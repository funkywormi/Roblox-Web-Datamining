// Stringified into the server HTML by capture.ts (`installEarlyClickCapture.toString()`). The page
// runs that source alone, with no module around it, so this file must not import any value: a
// reference to an import would typecheck here and then throw when the inline script runs. Types
// are erased, so `import type` is fine. Keep the body in syntax the browser runs as-is (no
// async, generators, decorators, or template literals); a compiler helper injected for those
// would also be missing when the string runs.
//
// The leave beacon (pagehide / visibility hidden) is inside this function for the same reason.
// It reports taps that leave before React loads: the one still held, and the ones this script
// already dropped, replaced, or expired. React's monitor reports the same taps once it has, and
// the shared flags and the queued notes stop the two from both sending.
//
// The browser globals below are the page's own document and window. Importing them from
// `@rbx/core-lib/browser` would put a module binding in the stringified source, and that binding
// does not exist when the inline script runs.
/* eslint-disable @rbx/browser/no-browser-globals */

export type CaptureEarlyClickState = {
  key: string;
  startedAt: number;
  taps: number;
  timer: number;
  /** Set once this tap has been reported as held, by React or by the script's leave beacon. */
  isHeldReported?: boolean;
  /**
   * Set once how this tap ended has been reported. The script then skips its expiry note and its
   * leave beacon, and React does not report the tap again.
   */
  isOutcomeReported?: boolean;
  /**
   * What the tap was waiting for when React first reported it. Later reports use this instead of
   * looking the row up again, because the row may have unmounted.
   */
  waitingFor?: "hydration" | "redirectUrl";
};

/** A tap the capture script gave up on after its timeout, before React resolved it. */
export type CaptureExpiredEarlyClick = {
  key: string;
  taps: number;
  waitMs: number;
  /** Whether React had already reported the tap as held before the script gave up on it. */
  isHeldReported?: boolean;
  /** Copied from the held state, so the outcome uses the same wait reason as `held`. */
  waitingFor?: "hydration" | "redirectUrl";
};

/** A tap the script discarded because the user moved on, before React resolved it. */
export type CaptureDiscardedEarlyClick = {
  key: string;
  taps: number;
  waitMs: number;
  /** Whether React had already reported the tap as held before the script discarded it. */
  isHeldReported?: boolean;
  /** Copied from the held state, so the outcome uses the same wait reason as `held`. */
  waitingFor?: "hydration" | "redirectUrl";
  /** `dropped`: the user tapped something this script will not hold. `replaced`: they tapped another row. */
  reason: "dropped" | "replaced";
};

/** Values inlined from capture.ts. The literal types are the names the rest of the module uses. */
export type EarlyClickCaptureConfig = {
  stateKey: "robuxEarlyClick";
  expiredKey: "robuxEarlyClickExpired";
  discardedKey: "robuxEarlyClickDiscarded";
  eventName: "robuxearlyclick";
  rowAttr: "data-early-click";
  rowSelector: "[data-early-click]";
  hydratedAttr: "data-hydrated";
  pendingAttr: "data-pending";
  timeoutMs: number;
  /** Element that carries the beacon's flow id, trigger context, and ecsv2 base URL. */
  beaconFlowAttr: "data-early-click-flow";
  beaconContextAttr: "data-early-click-context";
  beaconEndpointAttr: "data-early-click-endpoint";
  beaconTarget: "www";
  beaconEventType: "UserPurchaseFlow";
  beaconViewName: "EarlyClick";
  beaconPurchaseEventType: "UserInput";
  beaconSource: "inlineScript";
  beaconWebStack: "nextjs";
  /** `refurl` cap used by the payments-flow event. View paths are left off. */
  beaconRefUrlMaxLength: 200;
  /** Set by React once it is reporting taps, so a later leave is not a pre-hydration leave. */
  reactReadyKey: "robuxEarlyClickReactReady";
  /**
   * Set once a leave has been sent, whether it was `noTap` or taps. A later leave with nothing new
   * is then not counted as a leave with no tap.
   */
  noTapReportedKey: "robuxEarlyClickNoTapReported";
};

type CaptureWindow = Window & {
  __robuxEarlyClickCaptureInstalled?: boolean;
  robuxEarlyClick?: CaptureEarlyClickState;
  robuxEarlyClickExpired?: CaptureExpiredEarlyClick[];
  robuxEarlyClickDiscarded?: CaptureDiscardedEarlyClick[];
  robuxEarlyClickReactReady?: boolean;
  robuxEarlyClickNoTapReported?: boolean;
};

export function installEarlyClickCapture(config: EarlyClickCaptureConfig): void {
  const page = window as CaptureWindow;
  const {
    stateKey,
    expiredKey,
    discardedKey,
    eventName,
    rowAttr,
    rowSelector,
    hydratedAttr,
    pendingAttr,
    timeoutMs,
    beaconFlowAttr,
    beaconContextAttr,
    beaconEndpointAttr,
    beaconTarget,
    beaconEventType,
    beaconViewName,
    beaconPurchaseEventType,
    beaconSource,
    beaconWebStack,
    beaconRefUrlMaxLength,
    reactReadyKey,
    noTapReportedKey,
  } = config;

  if (page.__robuxEarlyClickCaptureInstalled) {
    return;
  }
  page.__robuxEarlyClickCaptureInstalled = true;

  const notify = (): void => {
    try {
      window.dispatchEvent(new Event(eventName));
    } catch {
      // dispatchEvent can throw if the event name is bad. It is a fixed string; ignore and continue.
    }
  };

  const clearPending = (): void => {
    const previous = document.querySelector(`[${pendingAttr}]`);
    if (previous) {
      previous.removeAttribute(pendingAttr);
      previous.removeAttribute("aria-busy");
    }
  };

  const noteDiscard = (
    held: CaptureEarlyClickState | undefined,
    reason: CaptureDiscardedEarlyClick["reason"],
  ): void => {
    if (!held || held.isOutcomeReported) {
      return;
    }
    const discarded = page[discardedKey] ?? [];
    discarded.push({
      key: held.key,
      taps: held.taps,
      waitMs: Math.max(0, Math.round(performance.now() - held.startedAt)),
      isHeldReported: Boolean(held.isHeldReported),
      waitingFor: held.waitingFor,
      reason,
    });
    page[discardedKey] = discarded;
  };

  const dropHeld = (): void => {
    const held = page[stateKey];
    if (!held) {
      return;
    }
    clearTimeout(held.timer);
    clearPending();
    noteDiscard(held, "dropped");
    delete page.robuxEarlyClick;
    notify();
  };

  const holdRow = (row: Element): void => {
    const key = row.getAttribute(rowAttr);
    if (key == null) {
      return;
    }
    const state = page[stateKey];
    if (state && state.key === key) {
      state.taps += 1;
      return;
    }
    // A tap on a different row replaces the one being held. Replaying the first product after
    // the user moved on would purchase the wrong thing.
    if (state) {
      clearTimeout(state.timer);
      clearPending();
      noteDiscard(state, "replaced");
    }
    row.setAttribute(pendingAttr, "");
    row.setAttribute("aria-busy", "true");
    const held: CaptureEarlyClickState = {
      key,
      startedAt: performance.now(),
      taps: 1,
      timer: 0,
    };
    held.timer = window.setTimeout(() => {
      if (page[stateKey] === held) {
        delete page.robuxEarlyClick;
      }
      // Pass later taps through. Otherwise a row React never hydrates swallows every tap.
      row.setAttribute(hydratedAttr, "");
      row.removeAttribute(pendingAttr);
      row.removeAttribute("aria-busy");
      // React has not resolved this tap yet. Leave a note so it can report it once it runs.
      if (!held.isOutcomeReported) {
        const expired = page[expiredKey] ?? [];
        expired.push({
          key: held.key,
          taps: held.taps,
          waitMs: Math.max(0, Math.round(performance.now() - held.startedAt)),
          isHeldReported: Boolean(held.isHeldReported),
          waitingFor: held.waitingFor,
        });
        page[expiredKey] = expired;
      }
      notify();
    }, timeoutMs);
    page[stateKey] = held;
    notify();
  };

  // Matches parseEarlyClickKey. Inlined because this function is the whole page script.
  const parseKey = (key: string): { kind: "product" | "subscription"; productId: string } => {
    const separator = key.indexOf(":");
    if (separator === -1) {
      return { kind: "product", productId: key };
    }
    const kind = key.slice(0, separator) === "subscription" ? "subscription" : "product";
    const rawId = key.slice(separator + 1);
    const scopeSeparator = kind === "product" ? rawId.lastIndexOf("|") : -1;
    return {
      kind,
      productId: scopeSeparator === -1 ? rawId : rawId.slice(0, scopeSeparator),
    };
  };

  const waitingForOf = (key: string): "hydration" | "redirectUrl" => {
    const rows = document.querySelectorAll(rowSelector);
    for (const row of rows) {
      if (row.getAttribute(rowAttr) === key) {
        // A redirect row is server-rendered as an <a> with no href until its auth URL exists. A
        // plain purchase row renders a <button>, and a regular subscription tile renders an <a>
        // that already has its href, so neither is waiting for a URL.
        return row.querySelector("a:not([href])") ? "redirectUrl" : "hydration";
      }
    }
    return "hydration";
  };

  const referralUrl = (): string => {
    let ref = document.referrer;
    try {
      const topReferrer = window.top?.document.referrer;
      if (topReferrer) {
        ref = ref || topReferrer;
      }
    } catch {
      // A cross-origin frame hides its referrer. document.referrer still stands.
    }
    return ref.slice(0, beaconRefUrlMaxLength);
  };

  const buildBeaconUrl = (
    outcome: string,
    parsed: { kind: string; productId: string },
    waitingFor: string,
    waitMs: number,
    taps: number,
    flowId: string,
    context: string,
    endpoint: string,
    transport: string,
  ): string => {
    const metadata = JSON.stringify({
      outcome,
      kind: parsed.kind,
      productId: parsed.productId,
      waitingFor,
      waitMs: String(waitMs),
      taps: String(taps),
      source: beaconSource,
      webStack: beaconWebStack,
      eventTransport: transport,
    });
    const base = endpoint.endsWith("/") ? endpoint.slice(0, -1) : endpoint;
    const url = new URL(`${base}/e.png`);
    url.searchParams.append("t", beaconTarget);
    url.searchParams.append("evt", beaconEventType);
    // Device-derived, so it can differ from the trigger context React keeps for an existing flow.
    url.searchParams.append("ctx", context);
    url.searchParams.append("lt", new Date().toISOString());
    url.searchParams.append("url", window.location.href);
    url.searchParams.append("purchase_flow_uuid", flowId);
    url.searchParams.append("view_name", beaconViewName);
    url.searchParams.append("purchase_event_type", beaconPurchaseEventType);
    url.searchParams.append("refurl", referralUrl());
    url.searchParams.append("event_metadata", metadata);
    return url.href;
  };

  const deliver = (href: string, useFetch: boolean): void => {
    try {
      if (useFetch) {
        // The second callback handles a rejected fetch. It does not handle fetch throwing
        // before it returns a promise.
        window.fetch(href, { mode: "cors", credentials: "include", keepalive: true }).then(
          () => undefined,
          () => undefined,
        );
        return;
      }
      const img = new Image();
      img.src = href;
    } catch {
      // The beacon is best-effort. One failed send must not skip the other, or escape the listener.
    }
  };

  const readBeaconTarget = ():
    | { flowId: string; context: string; endpoint: string }
    | undefined => {
    const host = document.querySelector(`[${beaconFlowAttr}]`);
    if (!host) {
      return undefined;
    }
    const flowId = host.getAttribute(beaconFlowAttr);
    const context = host.getAttribute(beaconContextAttr);
    const endpoint = host.getAttribute(beaconEndpointAttr);
    if (!flowId || !context || !endpoint) {
      return undefined;
    }
    return { flowId, context, endpoint };
  };

  // A leave before React is reporting. Every tap React has not seen is sent as `held` plus how it
  // ended: the tap still held (`abandoned`), and the ones the script already ended and queued for
  // React (`dropped`, `replaced`, `expired`). Only a page where nothing was ever tapped sends one
  // `noTap`, so intent and no intent can be counted apart. Anything thrown here is telemetry.
  const reportLeave = (): void => {
    try {
      if (page[reactReadyKey]) {
        return;
      }
      const target = readBeaconTarget();
      if (!target) {
        return;
      }
      const useFetch = typeof window.fetch === "function";
      const transport = useFetch ? "fetch" : "img";
      const urlFor = (
        outcome: string,
        key: string,
        waitingFor: string,
        waitMs: number,
        taps: number,
      ): string =>
        buildBeaconUrl(
          outcome,
          parseKey(key),
          waitingFor,
          waitMs,
          taps,
          target.flowId,
          target.context,
          target.endpoint,
          transport,
        );

      const held = page[stateKey];
      const expired = page[expiredKey] ?? [];
      const discarded = page[discardedKey] ?? [];
      const isLiveTapPending = Boolean(held && !held.isHeldReported && !held.isOutcomeReported);
      const hasQueuedNotes = expired.length > 0 || discarded.length > 0;

      if (!held && !hasQueuedNotes) {
        if (page[noTapReportedKey]) {
          return;
        }
        let noTapUrl = "";
        try {
          noTapUrl = buildBeaconUrl(
            "noTap",
            { kind: "none", productId: "" },
            "hydration",
            Math.max(0, Math.round(performance.now())),
            0,
            target.flowId,
            target.context,
            target.endpoint,
            transport,
          );
        } catch {
          return;
        }
        page[noTapReportedKey] = true;
        deliver(noTapUrl, useFetch);
        return;
      }

      const urls: string[] = [];
      try {
        // The queued notes carry no wait reason when React never saw them. The row is still in the
        // page, so it is read now.
        const noteUrls = (
          notes: (CaptureExpiredEarlyClick | CaptureDiscardedEarlyClick)[],
          outcomeOf: (note: CaptureExpiredEarlyClick | CaptureDiscardedEarlyClick) => string,
        ): void => {
          for (const note of notes) {
            const waitingFor = note.waitingFor ?? waitingForOf(note.key);
            if (!note.isHeldReported) {
              urls.push(urlFor("held", note.key, waitingFor, note.waitMs, note.taps));
            }
            urls.push(urlFor(outcomeOf(note), note.key, waitingFor, note.waitMs, note.taps));
          }
        };
        noteUrls(discarded, note => ("reason" in note ? note.reason : "dropped"));
        noteUrls(expired, () => "expired");
        if (held && isLiveTapPending) {
          const waitingFor = waitingForOf(held.key);
          const waitMs = Math.max(0, Math.round(performance.now() - held.startedAt));
          urls.push(urlFor("held", held.key, waitingFor, waitMs, held.taps));
          urls.push(urlFor("abandoned", held.key, waitingFor, waitMs, held.taps));
        }
      } catch {
        // A bad endpoint makes `new URL` throw. Leave every tap for React to report.
        return;
      }
      if (urls.length === 0) {
        return;
      }

      // Mark everything sent before delivering, so React skips it and a second leave event does not
      // send it again. A later leave with nothing new is not a leave with no tap either.
      if (held && isLiveTapPending) {
        held.isHeldReported = true;
        held.waitingFor = waitingForOf(held.key);
        held.isOutcomeReported = true;
      }
      delete page.robuxEarlyClickExpired;
      delete page.robuxEarlyClickDiscarded;
      page[noTapReportedKey] = true;
      for (const href of urls) {
        deliver(href, useFetch);
      }
    } catch {
      // Lookup and timing can throw (for example `performance` missing). Swallow it.
    }
  };

  document.addEventListener(
    "click",
    (event: MouseEvent) => {
      const { target } = event;
      if (!(target instanceof Element)) {
        return;
      }
      const cta = target.closest("button, a");
      if (!cta) {
        return;
      }
      const row = cta.closest(rowSelector);
      const isModifiedLink =
        cta.tagName === "A" &&
        cta.hasAttribute("href") &&
        (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0);
      // A tap this script will not hold is the user choosing something else, including a control
      // that is already hydrated. Drop the queued tap so it is not replayed as well.
      if (!row || row.hasAttribute(hydratedAttr) || isModifiedLink) {
        if (page[stateKey]) {
          dropHeld();
        }
        return;
      }
      event.stopImmediatePropagation();
      event.preventDefault();
      holdRow(row);
    },
    true,
  );
  // An <a> with no href does not fire a click for Enter or Space. Redirect rows have no href
  // until the auth ticket arrives, so keyboard activation before hydration has to be held here.
  document.addEventListener(
    "keydown",
    (event: KeyboardEvent) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }
      const { target } = event;
      if (!(target instanceof HTMLAnchorElement) || target.hasAttribute("href")) {
        return;
      }
      const row = target.closest(rowSelector);
      if (!row || row.hasAttribute(hydratedAttr)) {
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      holdRow(row);
    },
    true,
  );
  // Capture on window runs before a listener React adds later, so a tap React has not reported
  // yet is sent here and flagged, and React then skips it.
  window.addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") {
        reportLeave();
      }
    },
    true,
  );
  window.addEventListener(
    "pagehide",
    () => {
      reportLeave();
    },
    true,
  );
}
