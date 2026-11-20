import type { DeviceMeasurement, RequiredSpecRule } from "./requiredSpec";

/**
 * Why the probe couldn't finish: it posted an error, failed to load or couldn't start (`error`),
 * posted nothing in time (`timeout`), the tab was hidden (`hidden`), or it measured while the tab
 * was hidden, so its CPU scores are throttled (`throttled`).
 */
export type DeviceProbeFailureReason = "error" | "timeout" | "hidden" | "throttled";

export type DeviceProbeFailedEvent = {
  reason: DeviceProbeFailureReason;
  /** From mounting the iframe; 0 when it wasn't mounted. */
  durationMs: number;
  /** Name and major version, such as `Chrome/141`. */
  browser: string;
  /** `null` when the probe didn't post scores. */
  isolated: boolean | null;
};

export type DeviceSpecNotMetEvent = {
  failedRules: RequiredSpecRule[];
  browser: string;
  isolated: boolean;
  scores: DeviceMeasurement;
};

export type DeviceProbeCompletedEvent = {
  durationMs: number;
  browser: string;
  isolated: boolean;
  scores: DeviceMeasurement;
};

/**
 * Receives probe outcomes. Each event fires once per probe run, never for a cached result, so
 * sampling `probeCompleted` is up to the implementation.
 */
export type DeviceProbeTelemetry = {
  probeFailed: (event: DeviceProbeFailedEvent) => void;
  /** The probe finished but the device doesn't meet the required spec. */
  specNotMet: (event: DeviceSpecNotMetEvent) => void;
  /** The probe finished, whether or not the device meets the required spec. */
  probeCompleted: (event: DeviceProbeCompletedEvent) => void;
};

/**
 * Whether this browser may use WASM gameplay. Called on every `meetsRequiredSpec()` call, before
 * the cache is read; `false` resolves `false` without probing and keeps the cache.
 */
export type DeviceProbeBrowserGate = () => boolean;

const noopTelemetry: DeviceProbeTelemetry = {
  probeFailed: () => undefined,
  specNotMet: () => undefined,
  probeCompleted: () => undefined,
};

const allowAll: DeviceProbeBrowserGate = () => true;

let telemetry = noopTelemetry;
let browserGate = allowAll;

/** Set by the host to report probe outcomes; `null` restores the no-op default. */
export const setDeviceProbeTelemetry = (impl: DeviceProbeTelemetry | null): void => {
  telemetry = impl ?? noopTelemetry;
};

/** Set by the host to answer `false` on browsers that can't play; `null` allows every browser. */
export const setBrowserGate = (gate: DeviceProbeBrowserGate | null): void => {
  browserGate = gate ?? allowAll;
};

/** Reports an event. A throwing implementation doesn't change the answer. */
export const report = <Name extends keyof DeviceProbeTelemetry>(
  name: Name,
  event: Parameters<DeviceProbeTelemetry[Name]>[0],
): void => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- event matches name
    (telemetry[name] as (event: Parameters<DeviceProbeTelemetry[Name]>[0]) => void)(event);
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
