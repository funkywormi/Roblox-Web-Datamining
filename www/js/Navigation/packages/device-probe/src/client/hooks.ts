// By package name, not path, so Next.js can alias it to the lazy loader.
import { loadTelemetry } from "@rbx/device-probe/client/telemetry-loader";
import type { DeviceProbeTelemetry } from "./telemetry";

/**
 * Whether this browser may use WASM gameplay. Called on every `meetsRequiredSpec()` call, before
 * the cache is read; `false` resolves `false` without probing and keeps the cache.
 */
export type DeviceProbeBrowserGate = () => boolean;

const allowAll: DeviceProbeBrowserGate = () => true;

let browserGate = allowAll;

/** Set by the host to answer `false` on browsers that can't play; `null` allows every browser. */
export const setBrowserGate = (gate: DeviceProbeBrowserGate | null): void => {
  browserGate = gate ?? allowAll;
};

type DeviceProbeEvent = {
  [Name in keyof DeviceProbeTelemetry]: [Name, Parameters<DeviceProbeTelemetry[Name]>[0]];
}[keyof DeviceProbeTelemetry];

// `null` until the telemetry module loads; events reported before then wait in `pending`.
let telemetry: DeviceProbeTelemetry | null = null;
let pending: DeviceProbeEvent[] = [];
let telemetryState: "unloaded" | "loading" | "failed" = "unloaded";

const send = (loaded: DeviceProbeTelemetry, [name, event]: DeviceProbeEvent): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- event matches name
    (loaded[name] as (event: DeviceProbeEvent[1]) => void)(event);
  } catch {
    // Telemetry must not break the caller.
  }
};

// Loaded on the first report, which is a run's `probeStarted` (or a backoff's `probeSkipped`), so
// a page view that runs no probe never loads it; on Next.js that's a chunk it doesn't download.
// Events reported before it loads are queued and sent in order once it has. The chunk loads while
// the probe runs, which takes seconds, so a run's result is reported after it. A page that unloads
// before it loads loses what's queued: the run's `probeStarted`, and an earlier run's `crashed`
// failure if it had one. The run itself is cut off too, so the next run reports it as `crashed`.
const startLoading = (): void => {
  telemetryState = "loading";
  // A loader that throws rejects instead, so the state can't stay `loading`.
  Promise.resolve()
    .then(loadTelemetry)
    .then(
      loaded => {
        telemetry = loaded;
        const queued = pending;
        pending = [];
        for (const event of queued) {
          send(loaded, event);
        }
      },
      () => {
        // Not retried: the events are dropped, and the probe doesn't wait on telemetry.
        telemetryState = "failed";
        pending = [];
      },
    );
};

/** Reports an event through web-telemetry, loading it first if needed. Never throws. */
export const report = <Name extends keyof DeviceProbeTelemetry>(
  name: Name,
  event: Parameters<DeviceProbeTelemetry[Name]>[0],
): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- event matches name
    const entry = [name, event] as DeviceProbeEvent;
    if (telemetry != null) {
      send(telemetry, entry);
      return;
    }
    if (telemetryState === "failed") {
      return;
    }
    pending.push(entry);
    if (telemetryState === "unloaded") {
      startLoading();
    }
  } catch {
    // Telemetry must not break the caller.
  }
};

/** The gate's answer; a throwing gate blocks the probe. */
export const browserAllowed = (): boolean => {
  try {
    return browserGate();
  } catch {
    return false;
  }
};
