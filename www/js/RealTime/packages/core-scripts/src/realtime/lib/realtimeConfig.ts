// Realtime globals. .NET reads them off window.Roblox; a host without it (Next.js) injects them via
// initRealtimeConfig. Reads fall back to window.Roblox, so .NET needs no Init call.

export type RealtimeGlobals = {
  RealTimeSettings?: Record<string, unknown>;
  CurrentUser?: { userId: string | number };
  LocalStorage?: { isAvailable: () => boolean };
  Utilities?: Record<string, unknown>;
  Performance?: Record<string, unknown>;
  DeviceMeta?: unknown;
  EventStream?: Record<string, unknown>;
  Hybrid?: unknown;
};

let injected: RealtimeGlobals | null = null;

export const initRealtimeConfig = (config: RealtimeGlobals | null): void => {
  injected = config;
};

// Lazy so an injected config still wins and importing never touches window.
export const getRealtimeGlobals = (): RealtimeGlobals => {
  if (injected) {
    return injected;
  }
  if (typeof window === "undefined") {
    return {};
  }
  // window.Roblox is the legacy untyped global boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return (window as unknown as { Roblox?: RealtimeGlobals }).Roblox ?? {};
};
