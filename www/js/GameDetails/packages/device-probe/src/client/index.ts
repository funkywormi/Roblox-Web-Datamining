// The www client for the device probe: answers whether this device meets the required spec for
// WASM gameplay, from a cached measurement or by running the probe in an iframe. Nothing runs on
// import. See the WEB-3600 tech spec.
import { document, navigator, window } from "@rbx/core-lib/browser";
import { reportedDevice } from "../reportedDevice";
import { isSupportedBrowserAndDevice } from "./browserGate";
import {
  browserCacheKey,
  measurementFromScores,
  readCachedFailure,
  readCachedMeasurement,
  readRecentFailure,
  removeCachedMeasurement,
  restoreCachedFailure,
  unmeasuredDevice,
  writeCachedFailure,
  writeCachedMeasurement,
} from "./cache";
import { getDeviceProbeConfig, setDeviceProbeConfig } from "./config";
import { webPlayRegionAnswer } from "./eligibility";
import { type FrameResult, runProbeFrame } from "./frame";
import { browserAllowed, report, setBrowserGate } from "./hooks";
import { type DeviceMeasurement, failedReportedRules, failedRules } from "./requiredSpec";
import { removeExpiredProbeEntries } from "./retention";
import { checkStartCap, recordStart, removeStaleStarts } from "./starts";

export { isSupportedBrowserAndDevice } from "./browserGate";

export {
  defaultDeviceProbeConfig,
  setDeviceProbeConfig,
  type DeviceProbeConfig,
  type DeviceProbeConfigInput,
} from "./config";
export { setBrowserGate, type DeviceProbeBrowserGate } from "./hooks";
export {
  defaultRequiredSpec,
  type DeviceMeasurement,
  type RequiredSpec,
  type RequiredSpecRule,
} from "./requiredSpec";

// Shared by every tab on the origin, so two tabs don't benchmark at once and skew each other.
const LOCK_NAME = "rbx-device-probe";

let inFlight: Promise<DeviceMeasurement | null> | null = null;

// A recent failure on this device answers no without probing again. Reported as a skipped probe,
// so the answers the backoff denied show.
const backingOff = (now: number, crashGraceMs: number): boolean => {
  const failure = readRecentFailure(now, crashGraceMs);
  if (failure != null) {
    report("probeSkipped", { reason: failure.reason, browser: failure.browser });
  }
  return failure != null;
};

// The circuit breaker: the probe already started as often as it may in the window, whatever came
// of those runs. Reported as a skipped probe, once per window.
const capped = (now: number): boolean => {
  const { reached, firstSkip } = checkStartCap(now);
  if (firstSkip) {
    report("probeSkipped", { reason: "attemptCap", browser: browserCacheKey() });
  }
  return reached;
};

// A run holds the lock until it replaces its crash marker, and the browser releases it when the
// run's page goes away. So with the lock held, a crash marker of any age is from a run that never
// settled, and counts as a failure at once (`0`). Without Web Locks, a run in another tab may
// still be going, so it counts once it's older than the timeout.
const withProbeLock = async <T>(callback: (crashGraceMs: number) => Promise<T>): Promise<T> => {
  const locks = navigator?.locks;
  return locks == null
    ? callback(getDeviceProbeConfig().timeoutMs)
    : await locks.request(LOCK_NAME, () => callback(0));
};

// A hidden tab throttles the benchmarks, so a call made there (an EDP opened in a background
// tab, for example) stays pending until the tab is visible.
const whenVisible = (): Promise<void> =>
  new Promise(resolve => {
    const doc = document;
    if (doc?.visibilityState !== "hidden") {
      resolve();
      return;
    }
    const onVisibilityChange = (): void => {
      if (doc.visibilityState !== "hidden") {
        doc.removeEventListener("visibilitychange", onVisibilityChange);
        resolve();
      }
    };
    doc.addEventListener("visibilitychange", onVisibilityChange);
  });

// Runs the probe and caches what it measured, or a failure entry when it couldn't finish on this
// device (an error or a timeout), so the probe isn't run again for a while. `null` when it
// couldn't finish; a hidden tab or throttled scores cache no answer, so a later call probes again,
// but the start still counts toward the circuit breaker's cap (`MAX_STARTS` in `START_WINDOW_MS`).
// Where Web Play isn't offered, or that can't be told, it doesn't run and caches nothing.
const attemptProbe = async (): Promise<DeviceMeasurement | null> => {
  const region = await webPlayRegionAnswer();
  if (region !== "offered") {
    // What's stored isn't checked against the region when it's read, so an entry from where Web
    // Play was offered is removed once the region says it isn't.
    if (region === "notOffered") {
      removeCachedMeasurement();
    }
    return null;
  }
  await whenVisible();
  return withProbeLock(async crashGraceMs => {
    // Another tab may have probed while this one waited for the lock.
    const cached = readCachedMeasurement(Date.now());
    if (cached != null) {
      return cached;
    }
    if (backingOff(Date.now(), crashGraceMs)) {
      return null;
    }
    // The host may have turned the client off while this call waited for the lock. Not a failed
    // probe, so nothing is reported.
    if (!getDeviceProbeConfig().enabled) {
      return null;
    }
    // Hidden again, or still hidden after another copy's run the tab hid. Not a run, so nothing is
    // reported: only the copy that runs the probe reports its outcome.
    if (document?.visibilityState === "hidden") {
      return null;
    }
    // What the browser reports can fail the spec on its own. Then the answer is stored without
    // mounting the probe page, and it isn't a run: no start, crash marker or `probeStarted`.
    const device = reportedDevice();
    const reportedRules = failedReportedRules(device, getDeviceProbeConfig().requiredSpec);
    if (reportedRules.length > 0) {
      const measurement = unmeasuredDevice(device);
      writeCachedMeasurement(measurement, Date.now());
      report("probeCompleted", {
        durationMs: 0,
        browser: browserCacheKey(),
        isolated: null,
        failedRules: reportedRules,
      });
      return measurement;
    }
    // Checked here, after the cached answer, so a call made while another run is in flight gets
    // that run's answer.
    if (capped(Date.now())) {
      return null;
    }

    // The start, logged for the circuit breaker, and the crash marker: if the probe kills the
    // tab, the marker is what's left, and it counts as a failure once it's older than the
    // timeout. Every way the run settles replaces it. When either can't be written (storage full
    // or blocked), nothing would stop the probe running again on every page view, so it doesn't
    // run. Not a failed probe, so nothing is reported.
    let previousFailure = readCachedFailure();
    const failureCount = (previousFailure?.failureCount ?? 0) + 1;
    const startedAt = Date.now();
    if (!recordStart(startedAt) || !writeCachedFailure("crashed", failureCount, startedAt)) {
      return null;
    }
    const browser = browserCacheKey();
    report("probeStarted", { browser });
    // A crash marker from an earlier run that never settled, reported once: this run's marker has
    // just replaced it, and a hidden or throttled run puts it back marked as reported. Without Web
    // Locks a younger one may be a run in another tab.
    if (
      previousFailure?.reason === "crashed" &&
      previousFailure.crashReported !== true &&
      startedAt - previousFailure.failedAt >= crashGraceMs
    ) {
      report("probeFailed", { reason: "crashed", durationMs: null, browser, isolated: null });
      previousFailure = { ...previousFailure, crashReported: true };
    }
    const result = await runProbeFrame(getDeviceProbeConfig().timeoutMs).catch(
      (): FrameResult => ({ ok: false, reason: "error" }),
    );
    const durationMs = Date.now() - startedAt;
    const parsed = result.ok ? measurementFromScores(result.scores) : null;
    if (parsed == null) {
      const reason = result.ok ? "error" : result.reason;
      if (reason === "hidden") {
        restoreCachedFailure(previousFailure);
      } else {
        writeCachedFailure(reason, failureCount, Date.now());
      }
      report("probeFailed", { reason, durationMs, browser, isolated: null });
      return null;
    }
    const { measurement, measuredWhileVisible, earlyStop } = parsed;
    const { isolated } = measurement;
    if (!measuredWhileVisible) {
      restoreCachedFailure(previousFailure);
      report("probeFailed", { reason: "throttled", durationMs, browser, isolated });
      return null;
    }

    writeCachedMeasurement(measurement, Date.now());
    report("probeCompleted", {
      durationMs,
      browser,
      isolated,
      // An early stop reports the quick checks that failed, not the benchmarks it didn't run.
      failedRules: earlyStop ?? failedRules(measurement, getDeviceProbeConfig().requiredSpec),
    });
    return measurement;
  });
};

// Every path in the attempt that settles reports first. What's left rejects: the lock can't be
// taken, before the probe started.
const probeDevice = async (): Promise<DeviceMeasurement | null> => {
  try {
    return await attemptProbe();
  } catch {
    report("probeFailed", {
      reason: "error",
      durationMs: null,
      browser: browserCacheKey(),
      isolated: null,
    });
    return null;
  }
};

/**
 * Resolves `true` if this device meets the required spec, `false` otherwise. Resolves `false`
 * when the browser gate says no, even with a cached pass, and without probing where Web Play
 * isn't offered. Uses the cached measurement when it's valid; otherwise runs the probe in a
 * hidden iframe, which takes a few seconds. A hidden tab waits until it's visible first. A
 * recent failure on this device (see `FIRST_FAILURE_MAX_AGE_MS`), or a device where the probe
 * already started `MAX_STARTS` times in `START_WINDOW_MS`, resolves `false` without probing. With the client off, it still answers from the cache but doesn't probe, so an uncached
 * call resolves `false`. It doesn't probe when local storage can't be written either, as nothing
 * could be cached. Concurrent calls in a tab share one probe. Never rejects: any failure resolves
 * `false`.
 */
export const meetsRequiredSpec = async (): Promise<boolean> => {
  try {
    // Asked on every call, before the cache: the host can exclude a browser version after it
    // cached a pass. The cache is kept, so the answer comes back if the gate allows it again.
    if (!browserAllowed()) {
      return false;
    }
    let measurement = readCachedMeasurement(Date.now());
    if (measurement == null) {
      if (backingOff(Date.now(), getDeviceProbeConfig().timeoutMs)) {
        return false;
      }
      // The kill switch stops new probes, not answers from the cache.
      if (!getDeviceProbeConfig().enabled) {
        return false;
      }
      inFlight ??= probeDevice().finally(() => {
        inFlight = null;
      });
      measurement = await inFlight;
      // Asked again: the host may have excluded this browser while the probe ran.
      if (!browserAllowed()) {
        return false;
      }
    }
    // The spec is read again: the host may have changed it while the probe ran.
    return (
      measurement != null &&
      failedRules(measurement, getDeviceProbeConfig().requiredSpec).length === 0
    );
  } catch {
    return false;
  }
};

/**
 * The cached answer, without probing: `true` or `false` from a valid cached measurement, `false`
 * from a recent failure on this device, `null` when there's neither. Ignores the kill switch, so a
 * host that stops new probe runs can still use answers cached before. `false` when the browser
 * gate says no, like `meetsRequiredSpec()`.
 */
export const cachedMeetsRequiredSpec = (): boolean | null => {
  try {
    if (!browserAllowed()) {
      return false;
    }
    const now = Date.now();
    const measurement = readCachedMeasurement(now);
    if (measurement == null) {
      return readRecentFailure(now, getDeviceProbeConfig().timeoutMs) == null ? null : false;
    }
    return failedRules(measurement, getDeviceProbeConfig().requiredSpec).length === 0;
  } catch {
    return null;
  }
};

/**
 * Removes the cached measurement or failure entry, so the next call runs the probe again (for
 * example after a failed WASM play).
 */
export const clearDeviceProbeCache = (): void => {
  removeCachedMeasurement();
};

// A run that never settled leaves its crash marker, and the next run reports it. After two
// failures in a row the backoff lasts as long as the marker is kept, so there's no next run to:
// the background run reports it instead, once, when it's older than the timeout (younger, a run
// may still be going).
const reportSettledCrash = (now: number): void => {
  const failure = readCachedFailure();
  if (
    failure?.reason === "crashed" &&
    failure.failureCount >= 2 &&
    failure.crashReported !== true &&
    now - failure.failedAt >= getDeviceProbeConfig().timeoutMs
  ) {
    report("probeFailed", {
      reason: "crashed",
      durationMs: null,
      browser: failure.browser,
      isolated: null,
    });
    restoreCachedFailure({ ...failure, crashReported: true });
  }
};

declare global {
  interface Window {
    // On the window, not in this module, so two bundles that each include the client start once.
    rbxDeviceProbeBackgroundRun?: true;
  }
}

/**
 * Called by the page hosts (core scripts on .NET, the root layout on Next.js) on every page.
 * Probes once the page has loaded, if this device has no stored answer and Play on Web can show
 * on it, so the answer is stored before a page asks for it. Runs at most once per document and
 * never in a frame. The region check, the visible-tab wait, the cross-tab lock and the failure
 * backoff are `meetsRequiredSpec()`'s. It also removes what the probe stored once it's past
 * `RETENTION_MS`.
 */
export const runDeviceProbeInBackground = (): void => {
  const win = window;
  if (win == null || win.rbxDeviceProbeBackgroundRun === true) {
    return;
  }
  win.rbxDeviceProbeBackgroundRun = true;
  if (win.top !== win) {
    return;
  }
  setBrowserGate(isSupportedBrowserAndDevice);
  removeExpiredProbeEntries(Date.now());
  removeStaleStarts(Date.now());
  reportSettledCrash(Date.now());
  // `false` too when the gate says no or a recent failure is backing off.
  if (cachedMeetsRequiredSpec() !== null) {
    return;
  }
  setDeviceProbeConfig({ enabled: true });
  const run = (): void => {
    // eslint-disable-next-line no-void, @rbx/promises/prefer-query-mutation -- only stores the answer; never rejects
    void meetsRequiredSpec();
  };
  if (document?.readyState === "complete") {
    run();
  } else {
    win.addEventListener("load", run, { once: true });
  }
};
