import { navigator } from "@rbx/core-lib/browser";
import { getItem, removeItem, setItem } from "@rbx/core-lib/local-storage";
import type { DeviceFeatures } from "../types";
import { PROBE_VERSION } from "../version";
import { getDeviceProbeConfig } from "./config";
import {
  type DeviceMeasurement,
  failedRules,
  type ReportedDevice,
  type RequiredSpecRule,
} from "./requiredSpec";
import { RETENTION_MS } from "./retention";

/**
 * The version of what the client stores: the entries' shape and what a failure means. Bump it for
 * a new or changed field, or a client fix that should make devices probe again. A change to what
 * the scores measure bumps `PROBE_VERSION` instead, which is in the key too. Every version's
 * entry keeps its time in `measuredAt` or `failedAt` (Unix milliseconds): clients on other
 * versions date it from those to remove it after `RETENTION_MS`, and remove an entry they can't
 * date.
 */
const MEASUREMENT_VERSION = 1;

/**
 * Keyed on both versions, not the package version, so bundles that each include a copy of the
 * client (core scripts and a page's bundle on .NET) read the same entry. While two copies are on
 * different versions, each keeps its own entry instead of overwriting the other's.
 */
export const CACHE_KEY = `RBX_WASM_DEVICE_PROBE_V${MEASUREMENT_VERSION}_P${PROBE_VERSION}` as const;

// How long a measurement is used, set when it's written: at most RETENTION_MS when it meets the
// spec, and a couple of days when it doesn't, so a one-off bad measurement (low battery,
// background load) doesn't stick.
export const SPEC_MET_MAX_AGE_MS = RETENTION_MS;
export const SPEC_NOT_MET_MAX_AGE_MS = 2 * 24 * 60 * 60 * 1000;

/**
 * The cached probe result. Only the scores the required spec reads, so no GPU renderer, vendor,
 * extension or texture format lists, which identify the device.
 */
export type CachedDeviceProbe = DeviceMeasurement & {
  /** Unix milliseconds. */
  measuredAt: number;
  /**
   * Unix milliseconds. Set when it's written, from whether it met the host's required spec then,
   * so every copy of the client keeps it for the same time whatever spec its host sets.
   */
  expiresAt: number;
  /** Name and major version, such as `Chrome/141`. */
  browser: string;
};

/** Why a probe couldn't finish on this device. `crashed` is a run that never settled. */
export type ProbeFailureReason = "error" | "timeout" | "crashed";

// After the first failure the probe is skipped for an hour, then for RETENTION_MS (7 days) after
// two or more in a row: a device that can't finish twice answers no for as long as an entry is
// kept, instead of rerunning the probe every day.
export const FIRST_FAILURE_MAX_AGE_MS = 60 * 60 * 1000;
export const REPEATED_FAILURE_MAX_AGE_MS = RETENTION_MS;

/**
 * Stored in place of the scores when the probe couldn't finish on this device. A probe writes a
 * `crashed` one before it mounts the iframe and replaces it when it settles, so a run that killed
 * the tab still leaves one.
 */
export type CachedProbeFailure = {
  browser: string;
  /** Unix milliseconds. */
  failedAt: number;
  /** Failures in a row, this one included. */
  failureCount: number;
  reason: ProbeFailureReason;
  /** On a `crashed` entry a later run has reported, so a run that puts it back doesn't again. */
  crashReported?: true;
};

declare module "@rbx/core-lib/local-storage" {
  interface LocalStorageRegistry {
    [CACHE_KEY]: CachedDeviceProbe | CachedProbeFailure;
  }
}

// Every DeviceFeatures key, so the probe's own extra keys aren't copied into the cache.
const featureNames = [
  "wasmSimd",
  "wasmExceptions",
  "jspi",
  "bulkMemory",
  "bigInt",
  "sharedArrayBuffer",
  "crossOriginIsolated",
  "atomics",
  "webWorkers",
  "webgpu",
  "webSocket",
  "fetch",
  "audioContext",
  "audioWorklet",
  "opfs",
  "textDecoder",
  "can2GBAlloc",
  "can4GBAlloc",
] as const satisfies readonly (keyof DeviceFeatures)[];

// Fails to compile when DeviceFeatures gains a key that isn't listed above.
type UnlistedFeatureName = Exclude<keyof DeviceFeatures, (typeof featureNames)[number]>;
const _: [UnlistedFeatureName] extends [never] ? true : UnlistedFeatureName = true;

// Most specific first: Edge, Opera and Samsung Internet also send `Chrome/`, and Chrome on iOS
// sends `Safari/` and `CriOS/`.
const browserPatterns: readonly (readonly [string, RegExp])[] = [
  ["Edge", /\bEdg(?:e|A|iOS)?\/(\d+)/],
  ["Opera", /\bOPR\/(\d+)/],
  ["SamsungBrowser", /\bSamsungBrowser\/(\d+)/],
  ["Firefox", /\b(?:Firefox|FxiOS)\/(\d+)/],
  ["Chrome", /\b(?:Chrome|CriOS)\/(\d+)/],
  ["Safari", /\bVersion\/(\d+)\b.*\bSafari\//],
];

/**
 * The browser's name and major version, such as `Chrome/141`, or `unknown`. Only a cache key and
 * telemetry label, so a browser update re-probes: it isn't a support check. The host's browser
 * gate (`setBrowserGate`) decides which browsers are supported.
 */
export const browserCacheKey = (): string => {
  const userAgent = navigator?.userAgent ?? "";
  for (const [name, pattern] of browserPatterns) {
    const major = pattern.exec(userAgent)?.[1];
    if (major != null) {
      return `${name}/${major}`;
    }
  }
  return "unknown";
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const readFeatures = (value: unknown): DeviceMeasurement["features"] | null => {
  if (!isRecord(value)) {
    return null;
  }
  const features: Partial<Record<keyof DeviceFeatures, boolean>> = {};
  for (const name of featureNames) {
    const supported = value[name];
    if (typeof supported !== "boolean") {
      return null;
    }
    features[name] = supported;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- every name was set
  return features as DeviceMeasurement["features"];
};

// The stored entry is read back unchecked by core-lib, and another build of this library on the
// same origin may have written it, so it's checked field by field. Only the fields listed here
// are copied.
const readMeasurement = (entry: Record<string, unknown>): DeviceMeasurement | null => {
  const { isolated, cpu, gpu, memory } = entry;
  const features = readFeatures(entry.features);
  if (
    typeof isolated !== "boolean" ||
    features == null ||
    !isRecord(cpu) ||
    !isNumber(cpu.effectiveCores) ||
    !isNumber(cpu.singleThreadScore) ||
    !isRecord(gpu) ||
    typeof gpu.webgpuRenders !== "boolean" ||
    !isNumber(gpu.webgpuScore) ||
    !isRecord(memory) ||
    !(memory.deviceMemoryGiB === null || isNumber(memory.deviceMemoryGiB)) ||
    !isNumber(memory.maxSharedAllocMiB)
  ) {
    return null;
  }
  return {
    isolated,
    features,
    cpu: { effectiveCores: cpu.effectiveCores, singleThreadScore: cpu.singleThreadScore },
    gpu: { webgpuRenders: gpu.webgpuRenders, webgpuScore: gpu.webgpuScore },
    memory: {
      deviceMemoryGiB: memory.deviceMemoryGiB,
      maxSharedAllocMiB: memory.maxSharedAllocMiB,
    },
  };
};

const fixedRules = new Set<unknown>([
  "minDeviceMemoryGiB",
  "minEffectiveCores",
  "minSingleThreadScore",
  "minWebgpuScore",
  "requireWebgpuRenders",
  "softwareRenderer",
] satisfies Exclude<RequiredSpecRule, `feature:${string}`>[]);

const featureRules = new Set<unknown>(featureNames.map(name => `feature:${name}`));

// The rules are telemetry metric names, so only known ones are accepted.
const isRequiredSpecRule = (value: unknown): value is RequiredSpecRule =>
  fixedRules.has(value) || featureRules.has(value);

// The rules a probe that stopped before its benchmarks posted: `null` when it ran them,
// `undefined` when they aren't valid.
const readEarlyStop = (value: unknown): RequiredSpecRule[] | null | undefined => {
  if (value == null) {
    return null;
  }
  if (
    !isRecord(value) ||
    !Array.isArray(value.failedRules) ||
    value.failedRules.length === 0 ||
    !value.failedRules.every(isRequiredSpecRule)
  ) {
    return undefined;
  }
  return value.failedRules;
};

/**
 * The rule-relevant scores from a result the probe page posted, whether the CPU was measured
 * while the tab was visible, and the rules it stopped on when it stopped before its benchmarks
 * (`earlyStop`, `null` when it ran them). `null` when the result isn't shaped like
 * `DeviceScores`, or a benchmark failed.
 */
export const measurementFromScores = (
  scores: unknown,
): {
  measurement: DeviceMeasurement;
  measuredWhileVisible: boolean;
  earlyStop: RequiredSpecRule[] | null;
} | null => {
  if (!isRecord(scores) || !isRecord(scores.features) || !isRecord(scores.cpu)) {
    return null;
  }
  const earlyStop = readEarlyStop(scores.earlyStop);
  if (earlyStop === undefined) {
    return null;
  }
  const { measuredWhileVisible } = scores.cpu;
  const webgpu = isRecord(scores.gpu) && isRecord(scores.gpu.webgpu) ? scores.gpu.webgpu : {};
  const measurement = readMeasurement({
    isolated: scores.features.crossOriginIsolated,
    features: scores.features,
    cpu: scores.cpu,
    gpu: { webgpuRenders: webgpu.renders, webgpuScore: webgpu.score },
    memory: scores.memory,
  });
  if (measurement == null || typeof measuredWhileVisible !== "boolean") {
    return null;
  }
  // An early stop's unmeasured scores are 0 or false, so they fail every rule that reads them.
  // A probe that ran the benchmarks measures at least 1 core (it rejects when the CPU benchmark
  // fails), so a 0 isn't a measurement and mustn't be cached as a device that fails the spec.
  return earlyStop == null && measurement.cpu.effectiveCores < 1
    ? null
    : { measurement, measuredWhileVisible, earlyStop };
};

/**
 * Scores for a device that fails on what the browser reports alone, so the client stores an
 * answer without mounting the probe: its device memory, and 0 or false for everything it didn't
 * measure, so they fail every rule that reads it.
 */
export const unmeasuredDevice = ({ deviceMemoryGiB }: ReportedDevice): DeviceMeasurement => ({
  isolated: false,
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- every name is set
  features: Object.fromEntries(
    featureNames.map(name => [name, false]),
  ) as DeviceMeasurement["features"],
  cpu: { effectiveCores: 0, singleThreadScore: 0 },
  gpu: { webgpuRenders: false, webgpuScore: 0 },
  memory: { deviceMemoryGiB, maxSharedAllocMiB: 0 },
});

/**
 * The cached measurement, or `null` when there's none or it's invalid: from another browser major
 * version, or past its `expiresAt`. An entry an older client wrote without one expires
 * {@link SPEC_NOT_MET_MAX_AGE_MS} after it was measured, as it did then, and none is used past
 * {@link RETENTION_MS}.
 */
export const readCachedMeasurement = (now: number): DeviceMeasurement | null => {
  const entry: unknown = getItem(CACHE_KEY);
  if (!isRecord(entry) || entry.browser !== browserCacheKey() || !isNumber(entry.measuredAt)) {
    return null;
  }
  const { measuredAt } = entry;
  const expiresAt = Math.min(
    isNumber(entry.expiresAt) ? entry.expiresAt : measuredAt + SPEC_NOT_MET_MAX_AGE_MS,
    measuredAt + RETENTION_MS,
  );
  // A measurement from the future (the clock moved back) is as untrustworthy as a stale one.
  return now >= measuredAt && now < expiresAt ? readMeasurement(entry) : null;
};

export const writeCachedMeasurement = (measurement: DeviceMeasurement, now: number): void => {
  const meetsSpec = failedRules(measurement, getDeviceProbeConfig().requiredSpec).length === 0;
  // A failed write (storage full or blocked) leaves the run's crash marker, so the probe backs off
  // as it does after a crash.
  setItem(CACHE_KEY, {
    measuredAt: now,
    expiresAt: now + (meetsSpec ? SPEC_MET_MAX_AGE_MS : SPEC_NOT_MET_MAX_AGE_MS),
    browser: browserCacheKey(),
    ...measurement,
  });
};

const failureReasons = new Set<unknown>([
  "error",
  "timeout",
  "crashed",
] satisfies ProbeFailureReason[]);

/**
 * The failure entry for this browser version, whatever its age, or `null` when
 * there's none. A probe counts failures in a row from it.
 */
export const readCachedFailure = (): CachedProbeFailure | null => {
  const entry: unknown = getItem(CACHE_KEY);
  if (
    !isRecord(entry) ||
    entry.browser !== browserCacheKey() ||
    !isNumber(entry.failedAt) ||
    !isNumber(entry.failureCount) ||
    entry.failureCount < 1 ||
    !failureReasons.has(entry.reason)
  ) {
    return null;
  }
  return {
    browser: entry.browser,
    failedAt: entry.failedAt,
    failureCount: entry.failureCount,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- checked above
    reason: entry.reason as ProbeFailureReason,
    ...(entry.crashReported === true && { crashReported: true }),
  };
};

/**
 * The cached failure when it means the probe isn't run again yet, otherwise `null`. A `crashed`
 * entry younger than `crashGraceMs` may be a probe still running, in this tab or another, so it
 * doesn't count yet.
 */
export const readRecentFailure = (now: number, crashGraceMs: number): CachedProbeFailure | null => {
  const failure = readCachedFailure();
  if (failure == null) {
    return null;
  }
  const age = now - failure.failedAt;
  const maxAge = failure.failureCount >= 2 ? REPEATED_FAILURE_MAX_AGE_MS : FIRST_FAILURE_MAX_AGE_MS;
  return age >= 0 && age < maxAge && !(failure.reason === "crashed" && age < crashGraceMs)
    ? failure
    : null;
};

/** `false` when the entry couldn't be written (storage full or blocked). */
export const writeCachedFailure = (
  reason: ProbeFailureReason,
  failureCount: number,
  now: number,
): boolean => {
  return setItem(CACHE_KEY, {
    browser: browserCacheKey(),
    failedAt: now,
    failureCount,
    reason,
  }).isOk();
};

/** Puts back the failure entry from before a run, or removes the run's crash marker. */
export const restoreCachedFailure = (previous: CachedProbeFailure | null): void => {
  if (previous == null) {
    removeItem(CACHE_KEY);
  } else {
    setItem(CACHE_KEY, previous);
  }
};

export const removeCachedMeasurement = (): void => {
  removeItem(CACHE_KEY);
};
