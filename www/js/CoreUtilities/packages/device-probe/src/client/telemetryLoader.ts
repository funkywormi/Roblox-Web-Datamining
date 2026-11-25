// How the client gets its telemetry module: bundled with it. Rspack bundles for .NET pages (core
// scripts, the EDP) use this one. A static content component uploads one JS file only, so a chunk
// would never reach the CDN, and an `import()` would stop Rspack concatenating the modules the
// telemetry shares with the rest of the bundle. Next.js aliases this module to
// `lazyTelemetryLoader.ts` (`resolveAlias` in www-nextjs's `next.config.ts`).
import { type DeviceProbeTelemetry, deviceProbeTelemetry } from "./telemetry";

export const loadTelemetry = (): Promise<DeviceProbeTelemetry> =>
  Promise.resolve(deviceProbeTelemetry);
