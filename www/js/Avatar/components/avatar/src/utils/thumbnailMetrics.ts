/**
 * Thumbnail timing metrics logger, read lazily from the `window.Roblox.ThumbnailMetrics` runtime
 * global that the legacy thumbnail bundle installs on the .NET page. Sourced here through a typed
 * local accessor instead of the deprecated `@rbx/legacy-webapp-types/Roblox` barrel.
 *
 * Reading `window` lazily (rather than at module load) keeps this SSR-safe: during Next.js server
 * render there is no `window`, so `getThumbnailMetrics()` returns `undefined` and the optional-chained
 * call sites become no-ops until the bundle is present. Behaviour on .NET is unchanged.
 */
type RobloxThumbnailMetrics = {
  logFinalThumbnailTime: (duration: number, metricId?: string) => void;
  logThumbnailTimeout: (metricId?: string) => void;
};

export const getThumbnailMetrics = (): RobloxThumbnailMetrics | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  return (window as unknown as { Roblox?: { ThumbnailMetrics?: RobloxThumbnailMetrics } }).Roblox
    ?.ThumbnailMetrics;
};
