// Bump when a probe change makes new scores incomparable with cached or reported ones. Matches
// PROBE_VERSION in game-engine's perf-probe.ts and the webClientDeviceProbe `probeVersion` field.
// v2: CPU and GPU benchmarks run sequentially, so they don't contend.
// v3: CPU bench workers can spawn from a host URL instead of a blob: URL blocked by the CSP.
export const PROBE_VERSION = 3;

// The package version. The www /device-probe page serves the probe under `?v=<PACKAGE_VERSION>`
// with a long-lived cache, so every change to shipped code must bump it (see CHANGELOG.md).
export const PACKAGE_VERSION = "1.5.0";
