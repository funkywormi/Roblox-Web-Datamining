import { document, window } from "@rbx/core-lib/browser";
import { DEVICE_PROBE_PATH, RESULT_MESSAGE_TYPE } from "../page";
import { PACKAGE_VERSION, PROBE_VERSION } from "../version";
import type { DeviceProbeFailureReason } from "./telemetry";

export type FrameResult =
  | { ok: true; scores: unknown }
  | { ok: false; reason: Exclude<DeviceProbeFailureReason, "crashed" | "throttled"> };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

// The page loaded with an error status, such as the 404 it returns in production. Resource
// Timing reports the iframe's navigation with `responseStatus` in Chrome 109+; elsewhere the
// probe times out instead. Every probe loads the same URL, so entries from before this probe
// mounted are ignored.
const loadFailed = (url: string, mountedAt: number): boolean =>
  typeof performance !== "undefined" &&
  typeof performance.getEntriesByName === "function" &&
  performance
    .getEntriesByName(url)
    .some(
      entry =>
        entry.startTime >= mountedAt &&
        "responseStatus" in entry &&
        typeof entry.responseStatus === "number" &&
        entry.responseStatus >= 400,
    );

/**
 * Mounts the probe page in a hidden iframe and resolves with what it posts. Only accepts a result
 * from that iframe, on this origin, with the known type and score format version. The iframe is
 * removed once it settles, which releases the probe's large memory allocations.
 */
export const runProbeFrame = (timeoutMs: number): Promise<FrameResult> =>
  new Promise(resolve => {
    const win = window;
    const doc = document;
    if (win == null || doc == null) {
      resolve({ ok: false, reason: "error" });
      return;
    }
    const iframe = doc.createElement("iframe");
    // Filled in once the listeners are added. They're removed by hand rather than with
    // `addEventListener({ signal })`, which Safari and iOS before 15 ignore, so every probe would
    // leave its listeners and iframe behind.
    const teardown: (() => void)[] = [];
    const settle = (result: FrameResult): void => {
      for (const remove of teardown) {
        remove();
      }
      iframe.remove();
      resolve(result);
    };

    iframe.src = `${DEVICE_PROBE_PATH}?v=${encodeURIComponent(PACKAGE_VERSION)}`;
    iframe.title = "Device probe";
    iframe.tabIndex = -1;
    iframe.setAttribute("aria-hidden", "true");
    // 1 px and transparent rather than display: none, so Chrome doesn't throttle its rendering
    // during the GPU benchmark.
    iframe.style.cssText =
      "position:fixed;top:0;left:0;width:1px;height:1px;border:0;opacity:0;pointer-events:none";
    const mountedAt = typeof performance === "undefined" ? 0 : performance.now();
    const onLoad = (): void => {
      if (loadFailed(iframe.src, mountedAt)) {
        settle({ ok: false, reason: "error" });
      }
    };
    const onMessage = (event: MessageEvent): void => {
      const data: unknown = event.data;
      if (
        event.origin !== win.location.origin ||
        event.source == null ||
        event.source !== iframe.contentWindow ||
        !isRecord(data) ||
        data.type !== RESULT_MESSAGE_TYPE ||
        data.version !== PROBE_VERSION
      ) {
        return;
      }
      settle(data.ok === true ? { ok: true, scores: data.scores } : { ok: false, reason: "error" });
    };
    // A hidden tab throttles the benchmarks, so the scores wouldn't be worth keeping.
    const onVisibilityChange = (): void => {
      if (doc.visibilityState === "hidden") {
        settle({ ok: false, reason: "hidden" });
      }
    };
    iframe.addEventListener("load", onLoad);
    doc.body.append(iframe);
    win.addEventListener("message", onMessage);
    doc.addEventListener("visibilitychange", onVisibilityChange);
    const timer = setTimeout(() => {
      settle({ ok: false, reason: "timeout" });
    }, timeoutMs);
    teardown.push(() => {
      clearTimeout(timer);
      iframe.removeEventListener("load", onLoad);
      win.removeEventListener("message", onMessage);
      doc.removeEventListener("visibilitychange", onVisibilityChange);
    });
  });
