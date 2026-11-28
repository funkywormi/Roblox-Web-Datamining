import type { DeviceFeatures } from "../types";

/**
 * What a device needs for WASM gameplay. Defined in code ({@link defaultRequiredSpec}) and applied
 * to the cached scores on every call, so a new value takes effect on deploy without re-probing.
 */
export type RequiredSpec = {
  /**
   * `features` that must all be true. Names the probe doesn't report fail, so a misspelled name
   * can't loosen the spec. Leave out `sharedArrayBuffer` and `crossOriginIsolated`: they describe
   * the probe iframe, which isn't isolated outside Chrome with Document-Isolation-Policy.
   */
  requiredFeatures: readonly string[];
  /** `navigator.deviceMemory` is bucketed (a 6 GB Android phone most likely reports 4). */
  minDeviceMemoryGiB: number;
  minEffectiveCores: number;
  /** The probe's `cpu.singleThreadScore`, in iterations per ms. */
  minSingleThreadScore: number;
  /** The probe's `gpu.webgpu.score`, in GFLOPS. */
  minWebgpuScore: number;
  requireWebgpuRenders: boolean;
};

/**
 * The required spec (WEB-3756). Changing a value is a normal code change and deploy. The values
 * are the WEB-3600 tech spec's example until product sets the real minimums.
 */
export const defaultRequiredSpec: Readonly<RequiredSpec> = {
  requiredFeatures: [
    "wasmSimd",
    "wasmExceptions",
    "jspi",
    "bulkMemory",
    "atomics",
    "webWorkers",
    "webgpu",
    "can2GBAlloc",
  ],
  minDeviceMemoryGiB: 4,
  minEffectiveCores: 4,
  minSingleThreadScore: 0,
  minWebgpuScore: 0,
  requireWebgpuRenders: true,
};

/** The probe's scores that the required spec reads, and all the cache keeps of them. */
export type DeviceMeasurement = {
  /** `features.crossOriginIsolated`: whether the probe ran isolated, with precise timers. */
  isolated: boolean;
  features: { [Name in keyof DeviceFeatures]: boolean };
  cpu: { effectiveCores: number; singleThreadScore: number };
  gpu: { webgpuRenders: boolean; webgpuScore: number };
  memory: { deviceMemoryGiB: number | null; maxSharedAllocMiB: number };
};

/**
 * A failed rule: `feature:<name>`, the name of the minimum or requirement, or `softwareRenderer`.
 * Only the probe reports `softwareRenderer`, when it stops before the benchmarks because WebGPU's
 * adapter is a fallback adapter, which computes in software. The scores stored then fail
 * `requireWebgpuRenders` too. It stops on `requireWebgpuRenders` when there's no adapter.
 */
export type RequiredSpecRule =
  | `feature:${string}`
  | "minDeviceMemoryGiB"
  | "minEffectiveCores"
  | "minSingleThreadScore"
  | "minWebgpuScore"
  | "requireWebgpuRenders"
  | "softwareRenderer";

/** What the browser reports about the device without measuring it. */
export type ReportedDevice = {
  /** `navigator.deviceMemory`, `null` where the browser doesn't report it. */
  deviceMemoryGiB: number | null;
  /** `navigator.hardwareConcurrency`, at least 1. */
  reportedCores: number;
};

/** `feature:<name>` for each of `names` the features lack. Names the probe doesn't report fail. */
export const failedFeatureRules = (
  features: DeviceMeasurement["features"],
  names: readonly string[],
): RequiredSpecRule[] =>
  names
    .filter(
      name =>
        !Object.hasOwn(features, name) ||
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- checked by Object.hasOwn
        !features[name as keyof DeviceFeatures],
    )
    .map(name => `feature:${name}` as const);

// Firefox and Safari don't report device memory, which only passes a minimum of 0.
const tooLittleMemory = (deviceMemoryGiB: number | null, spec: Readonly<RequiredSpec>): boolean =>
  spec.minDeviceMemoryGiB > 0 && (deviceMemoryGiB ?? 0) < spec.minDeviceMemoryGiB;

/**
 * The rules that fail on what the browser reports alone, so no measurement could pass them: the
 * device memory, and fewer reported cores than the minimum (effective cores are measured on at
 * most the reported ones).
 */
export const failedReportedRules = (
  device: ReportedDevice,
  spec: Readonly<RequiredSpec>,
): RequiredSpecRule[] => {
  const failed: RequiredSpecRule[] = [];
  if (tooLittleMemory(device.deviceMemoryGiB, spec)) {
    failed.push("minDeviceMemoryGiB");
  }
  if (device.reportedCores < spec.minEffectiveCores) {
    failed.push("minEffectiveCores");
  }
  return failed;
};

/** The rules the measurement fails; empty when the device meets the spec. */
export const failedRules = (
  measurement: DeviceMeasurement,
  spec: Readonly<RequiredSpec>,
): RequiredSpecRule[] => {
  const failed = failedFeatureRules(measurement.features, spec.requiredFeatures);
  if (tooLittleMemory(measurement.memory.deviceMemoryGiB, spec)) {
    failed.push("minDeviceMemoryGiB");
  }
  if (measurement.cpu.effectiveCores < spec.minEffectiveCores) {
    failed.push("minEffectiveCores");
  }
  if (measurement.cpu.singleThreadScore < spec.minSingleThreadScore) {
    failed.push("minSingleThreadScore");
  }
  if (measurement.gpu.webgpuScore < spec.minWebgpuScore) {
    failed.push("minWebgpuScore");
  }
  if (spec.requireWebgpuRenders && !measurement.gpu.webgpuRenders) {
    failed.push("requireWebgpuRenders");
  }
  return failed;
};
