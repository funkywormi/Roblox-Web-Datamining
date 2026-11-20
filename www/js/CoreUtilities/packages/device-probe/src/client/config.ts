import { defaultRequiredSpec, type RequiredSpec } from "./requiredSpec";

export type DeviceProbeConfig = {
  /**
   * The kill switch. Off, `meetsRequiredSpec()` never starts a probe: it answers from a valid
   * cache entry, and resolves `false` without one.
   */
  enabled: boolean;
  requiredSpec: Readonly<RequiredSpec>;
  /** From mounting the probe iframe; past it the probe counts as one that couldn't finish. */
  timeoutMs: number;
};

/** The host's settings. Missing keys, including ones in `requiredSpec`, use the defaults. */
export type DeviceProbeConfigInput = Partial<Omit<DeviceProbeConfig, "requiredSpec">> & {
  requiredSpec?: Partial<RequiredSpec>;
};

export const defaultDeviceProbeConfig: Readonly<DeviceProbeConfig> = {
  enabled: false,
  requiredSpec: defaultRequiredSpec,
  timeoutMs: 10_000,
};

let current: Readonly<DeviceProbeConfig> = defaultDeviceProbeConfig;

const isMinimum = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

const isPositive = (value: unknown): value is number => isMinimum(value) && value > 0;

// The host's values aren't type-checked at runtime, so a bad value falls back to its default
// instead of turning a rule off.
const sanitizeRequiredSpec = (spec: Partial<RequiredSpec>): RequiredSpec => {
  const defaults = defaultRequiredSpec;
  return {
    requiredFeatures:
      Array.isArray(spec.requiredFeatures) &&
      spec.requiredFeatures.every(name => typeof name === "string")
        ? spec.requiredFeatures
        : defaults.requiredFeatures,
    minDeviceMemoryGiB: isMinimum(spec.minDeviceMemoryGiB)
      ? spec.minDeviceMemoryGiB
      : defaults.minDeviceMemoryGiB,
    minEffectiveCores: isMinimum(spec.minEffectiveCores)
      ? spec.minEffectiveCores
      : defaults.minEffectiveCores,
    minSingleThreadScore: isMinimum(spec.minSingleThreadScore)
      ? spec.minSingleThreadScore
      : defaults.minSingleThreadScore,
    minWebgl2FillPassesPerMs: isMinimum(spec.minWebgl2FillPassesPerMs)
      ? spec.minWebgl2FillPassesPerMs
      : defaults.minWebgl2FillPassesPerMs,
    requireWebgl2Renders:
      typeof spec.requireWebgl2Renders === "boolean"
        ? spec.requireWebgl2Renders
        : defaults.requireWebgl2Renders,
  };
};

/**
 * Set by the page host to turn the client on. `requiredSpec` is an optional override of the
 * code-defined {@link defaultRequiredSpec}. Missing keys use {@link defaultDeviceProbeConfig}, so
 * the probe stays off until a host turns it on; `null` restores the defaults.
 */
export const setDeviceProbeConfig = (config: DeviceProbeConfigInput | null): void => {
  current =
    config == null
      ? defaultDeviceProbeConfig
      : {
          enabled: config.enabled === true,
          requiredSpec:
            config.requiredSpec == null
              ? defaultRequiredSpec
              : sanitizeRequiredSpec(config.requiredSpec),
          timeoutMs: isPositive(config.timeoutMs)
            ? config.timeoutMs
            : defaultDeviceProbeConfig.timeoutMs,
        };
};

export const getDeviceProbeConfig = (): Readonly<DeviceProbeConfig> => current;
