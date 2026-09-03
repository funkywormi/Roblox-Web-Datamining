import { Hybrid } from "@rbx/legacy-webapp-types/Roblox";

const id = "web";

type BridgeSubphase = {
  name: string;
  deltaMs: number;
};

type BridgeMilestone = {
  name: string;
  id: string;
  deltaMs: number;
  subphases?: BridgeSubphase[];
};

// UA milestones are an imperfect match to web performance
// milestones, but we do the best we can to stick to these
// definitions. See https://docs.google.com/document/d/1ppwOVCMHVDqc9N6vPXxMmBEE6CIdAu9zL0fBKBv11RI/
// for more detail.
type PLTMilestone =
  | "PrimaryDataReady" // Last byte received
  | "DataProcessingStarted" // JS execution begins
  | "RenderStarted" // Web React render begins
  | "SurfaceMounted" // Web tree committed
  | "DataProcessingCompleted" // Hydration/data ready
  | "FunctionallyReady" // User can transact
  | "SurfaceReady"; // Complete

// See this excellent diagram for a breakdown of what these nav timings represent:
// https://mdn.github.io/shared-assets/images/diagrams/api/performance/timestamp-diagram.svg
const NAV_TIMING_TO_SPEC: ReadonlyArray<
  readonly [keyof PerformanceNavigationTiming, PLTMilestone, (keyof PerformanceNavigationTiming)[]?]
> = [
  [
    "responseEnd",
    "PrimaryDataReady",
    [
      "startTime",
      "redirectStart",
      "redirectEnd",
      "domainLookupStart",
      "domainLookupEnd",
      "connectStart",
      "secureConnectionStart",
      "connectEnd",
      "requestStart",
      "responseStart",
      "domInteractive",
    ],
  ],
  // Give DataProcessingStarted an (initially empty) subphase list so first-paint
  // can be stuffed in below — see getNavTimingMilestones.
  ["domContentLoadedEventStart", "DataProcessingStarted", []],
  ["domContentLoadedEventEnd", "RenderStarted", ["loadEventStart", "loadEventEnd"]],
];

type ServerTiming = {
  requestStartMs: number;
  requestEndMs: number;
};

// payments-web-subsite emits a standard Server-Timing response header carrying
// server-authoritative request timing — two metrics, rbxReqStart / rbxReqEnd, each an absolute
// Unix epoch ms carried in the entry's `duration`. It surfaces here as
// PerformanceNavigationTiming.serverTiming. This exists because inside an iOS WKWebView
// PerformanceNavigationTiming.requestStart/responseEnd read back as 0, so PrimaryDataReady
// ("last byte received") has nothing to anchor to; serverTiming does populate in WKWebView, so
// the server values fill that gap.
const getServerTiming = (
  navTiming: PerformanceNavigationTiming | undefined,
): ServerTiming | undefined => {
  const entries = navTiming?.serverTiming;
  if (!entries) {
    return undefined;
  }
  const requestStartMs = entries.find(entry => entry.name === "rbxReqStart")?.duration;
  const requestEndMs = entries.find(entry => entry.name === "rbxReqEnd")?.duration;
  // Number.isFinite — not `typeof === "number"` — because `typeof NaN === "number"`, and a NaN
  // here would flow through serverDeltaMs into a subphase (and the WKWebView anchor below),
  // serialize to `"deltaMs":null`, and crash the Lua consumer's `startTime + deltaMs / 1000`.
  if (
    requestStartMs !== undefined &&
    requestEndMs !== undefined &&
    Number.isFinite(requestStartMs) &&
    Number.isFinite(requestEndMs)
  ) {
    return { requestStartMs, requestEndMs };
  }
  return undefined;
};

function getNavTimingMilestones({
  navTiming,
  firstPaintMs,
  serverTiming,
  deltaMs,
  serverDeltaMs,
}: {
  navTiming: PerformanceNavigationTiming | undefined;
  firstPaintMs: number | undefined;
  serverTiming: ServerTiming | undefined;
  deltaMs: (entryRelativeMs: number) => number;
  serverDeltaMs: (epochMs: number) => number;
}): BridgeMilestone[] {
  if (!navTiming) {
    return [];
  }

  return NAV_TIMING_TO_SPEC.reduce<BridgeMilestone[]>((metrics, [field, name, phases]) => {
    const value = navTiming[field] as number;

    const subPhaseValues = phases?.reduce<BridgeSubphase[]>((subphases, subphase) => {
      const subphaseValue = navTiming[subphase] as number;
      if (!subphaseValue) {
        return subphases;
      }

      return [...subphases, { name: subphase, deltaMs: deltaMs(subphaseValue) }];
    }, []);

    // stuff firstPaintMs in as a subphase between "JS execution begins" and "Web React render begins"
    if (name === "DataProcessingStarted" && firstPaintMs && subPhaseValues) {
      subPhaseValues.push({ name: "first-paint", deltaMs: deltaMs(firstPaintMs) });
    }

    // Bridge the server's request timing into PrimaryDataReady. These are absolute epoch ms
    // (same clock domain as ttiStartMs), so they go through serverDeltaMs — NOT deltaMs, which
    // adds performance.timeOrigin and only makes sense for performance-relative entries.
    let deltaFromStart = value ? deltaMs(value) : undefined;
    if (name === "PrimaryDataReady" && serverTiming && subPhaseValues) {
      subPhaseValues.push(
        { name: "serverRequestStart", deltaMs: serverDeltaMs(serverTiming.requestStartMs) },
        { name: "serverRequestEnd", deltaMs: serverDeltaMs(serverTiming.requestEndMs) },
      );
      // Inside a WKWebView responseEnd reads back 0, which would otherwise drop this milestone
      // (and its subphases) entirely; anchor on the server's request-end so it still surfaces.
      if (deltaFromStart === undefined) {
        deltaFromStart = serverDeltaMs(serverTiming.requestEndMs);
      }
    }

    if (deltaFromStart === undefined) {
      return metrics;
    }

    return [...metrics, { name, id, deltaMs: deltaFromStart, subphases: subPhaseValues }];
  }, []);
}

export function createWithTtiMetrics(namespace: string): {
  reportInteractive: () => void;
} {
  try {
    let interactiveRequested = false;
    let interactiveMs: number | undefined;
    let loaded = false;
    let lcpReady = false;
    let emitted = false;
    let firstPaintMs: number | undefined;
    let firstContentfulPaintMs: number | undefined;
    let largestContentfulPaintMs: number | undefined;
    let paintObserver: PerformanceObserver | undefined;
    let lcpObserver: PerformanceObserver | undefined;

    const disconnectObservers = (): void => {
      paintObserver?.disconnect();
      lcpObserver?.disconnect();
    };

    // Builds and sends the milestone payload at most once. On the complete path
    // (partial === false) every signal is present; on a best-effort flush
    // (partial === true, from page teardown) we emit whatever we've collected so
    // far and skip milestones whose source hasn't been observed yet.
    const buildAndSend = ({ partial }: { partial: boolean }): void => {
      try {
        if (emitted) {
          return;
        }

        const param = new URLSearchParams(window.location.search).get("ttiStartMs");
        const ttiStartMs = param === null ? NaN : Number(param);
        if (!Number.isFinite(ttiStartMs)) {
          // Nothing we can anchor deltas to — never retry.
          emitted = true;
          return;
        }

        emitted = true;
        disconnectObservers();

        const navTiming = performance.getEntriesByType("navigation").at(0) as
          | PerformanceNavigationTiming
          | undefined;

        const toDelta = (entryRelativeMs: number): number =>
          entryRelativeMs + performance.timeOrigin - ttiStartMs;

        // Server timestamps are absolute epoch ms in the same clock domain as ttiStartMs,
        // so their delta is a plain subtraction — no performance.timeOrigin.
        const serverToDelta = (epochMs: number): number => epochMs - ttiStartMs;

        const milestones: BridgeMilestone[] = getNavTimingMilestones({
          navTiming,
          firstPaintMs,
          serverTiming: getServerTiming(navTiming),
          deltaMs: toDelta,
          serverDeltaMs: serverToDelta,
        });

        if (firstContentfulPaintMs !== undefined) {
          milestones.push({
            name: "SurfaceMounted",
            id,
            deltaMs: toDelta(firstContentfulPaintMs),
          });
        }

        // Data hydration happens effectively the moment interactive is reported —
        // pin to that timestamp, not emit time, so gating the emit on `load`
        // doesn't inflate this milestone.
        if (interactiveMs !== undefined) {
          milestones.push({
            name: "DataProcessingCompleted",
            id,
            deltaMs: toDelta(interactiveMs),
          });
        }

        if (largestContentfulPaintMs !== undefined) {
          milestones.push({
            name: "FunctionallyReady",
            id,
            deltaMs: toDelta(largestContentfulPaintMs),
          });
        }

        // "Complete" only has meaning once the page actually finished; skip it on
        // a partial flush where the user abandoned mid-load.
        if (!partial) {
          milestones.push({
            name: "SurfaceReady",
            id,
            deltaMs: toDelta(performance.now()),
          });
        }

        // Last line of defense: the consumer does `startTime + deltaMs / 1000`, so a non-finite
        // deltaMs (NaN/Infinity) serializes to JSON `null` and crashes it with a nil arithmetic
        // error. Drop any milestone whose own deltaMs isn't finite, and strip any non-finite
        // subphase, so nothing upstream can leak a bad delta onto the wire.
        const safeMilestones = milestones
          .filter(milestone => Number.isFinite(milestone.deltaMs))
          .map(milestone =>
            milestone.subphases
              ? {
                  ...milestone,
                  subphases: milestone.subphases.filter(subphase =>
                    Number.isFinite(subphase.deltaMs),
                  ),
                }
              : milestone,
          );

        Hybrid?.Navigation?.navigateToFeature({
          feature: "TTIComplete",
          eventName: namespace,
          milestones: safeMilestones,
        });
      } catch {
        // fail silent — TTI reporting must never crash the host page
      }
    };

    // Complete path: emit once interactive is reported, LCP has been observed, and
    // the document has fully loaded (so all nav timings — including
    // domContentLoadedEventEnd / loadEvent* behind RenderStarted — are populated).
    const tryEmit = (): void => {
      if (!interactiveRequested || !lcpReady || !loaded) {
        return;
      }
      buildAndSend({ partial: false });
    };

    // Best-effort path: fire on page teardown even if the complete gate never
    // opened, so we don't lose users who abandon before LCP / load.
    const flush = (): void => {
      buildAndSend({ partial: true });
    };

    if (typeof document !== "undefined") {
      if (document.readyState === "complete") {
        loaded = true;
      } else if (typeof window !== "undefined") {
        window.addEventListener(
          "load",
          () => {
            loaded = true;
            tryEmit();
          },
          { once: true },
        );
      }

      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          flush();
        }
      });
    }

    if (typeof window !== "undefined") {
      // pagehide + unload cover WebView/desktop navigation-away; visibilitychange
      // (above) covers iOS/WKWebView, which doesn't reliably fire unload.
      window.addEventListener("pagehide", flush);
      window.addEventListener("unload", flush);
    }

    if (typeof PerformanceObserver !== "undefined") {
      try {
        paintObserver = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (entry.name === "first-paint") {
              firstPaintMs = entry.startTime;
            } else if (entry.name === "first-contentful-paint") {
              firstContentfulPaintMs = entry.startTime;
            }

            if (firstPaintMs !== undefined && firstContentfulPaintMs !== undefined) {
              paintObserver?.disconnect();
              break;
            }
          }
        });
        paintObserver.observe({ type: "paint", buffered: true });

        // Keep observing so largestContentfulPaintMs tracks the latest candidate;
        // the observer is disconnected in buildAndSend when we actually emit.
        lcpObserver = new PerformanceObserver(list => {
          const last = list.getEntries().at(-1);
          if (last) {
            largestContentfulPaintMs = last.startTime;
            lcpReady = true;
            tryEmit();
          }
        });
        lcpObserver.observe({ type: "largest-contentful-paint", buffered: true });
      } catch {
        // older browsers may reject the entryType; fail silent
      }
    }

    const reportInteractive = (): void => {
      if (interactiveRequested) {
        return;
      }
      interactiveRequested = true;
      interactiveMs = performance.now();
      tryEmit();
    };

    return { reportInteractive };
  } catch {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    return { reportInteractive: () => {} };
  }
}
