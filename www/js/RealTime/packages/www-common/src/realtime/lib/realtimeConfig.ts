import ready from "./ready";

// Realtime globals. .NET reads them off window.Roblox; a host without it (Next.js) injects them via
// initRealtimeConfig. Reads fall back to window.Roblox, so .NET needs no Init call.

export type RealTimeSettingsGlobal = {
  NotificationsEndpoint: string;
  IsDebuggerEnabled?: string;
  MaxConnectionTime?: string | number;
  IsEventPublishingEnabled?: boolean;
  IsDisconnectOnSlowConnectionDisabled?: boolean;
  IsSignalRClientTransportRestrictionEnabled?: boolean;
  IsLocalStorageInRealTimeEnabled?: boolean;
  IsRealtimeWebAnalyticsEnabled?: boolean;
  IsRealtimeWebAnalyticsConnectionEventsEnabled?: boolean;
  IsRealtimeDurableReplayEnabled?: boolean;
  IsRealtimeTailLossPollingEnabled?: boolean;
  RealtimeTailLossPollingBaseIntervalMs?: string | number;
  RealtimeTailLossPollingMaxIntervalMs?: string | number;
  RealtimeTailLossPollingBackoffMultiplier?: string | number;
  IsRealtimeTailLossGapDetectionEnabled?: boolean;
  RealtimeTailLossPollingRetryMaxAttempts?: string | number;
  RealtimeMessageDedupeLruCacheSize?: string | number;
};

export type ExponentialBackoffSpecificationOptions = {
  firstAttemptDelay: number;
  firstAttemptRandomnessFactor: number;
  subsequentDelayBase: number;
  subsequentDelayRandomnessFactor: number;
  maximumDelayBase: number;
};

export type ExponentialBackoffSpecification = {
  FirstAttemptDelay: () => number;
  FirstAttemptRandomnessFactor: () => number;
  SubsequentDelayBase: () => number;
  SubsequentDelayRandomnessFactor: () => number;
  MaximumDelayBase: () => number;
};

export type ExponentialBackoff = {
  StartNewAttempt: () => number;
  Reset: () => void;
  GetLastResetTime: () => number | null;
};

export type RealtimeGlobals = {
  RealTimeSettings?: RealTimeSettingsGlobal;
  CurrentUser?: { userId: string | number };
  LocalStorage?: { isAvailable: () => boolean };
  Utilities?: {
    ExponentialBackoffSpecification: new (
      options: ExponentialBackoffSpecificationOptions,
    ) => ExponentialBackoffSpecification;
    ExponentialBackoff: new (
      regularSpec: ExponentialBackoffSpecification,
      fastBackoffPredicate: (backoff: ExponentialBackoff) => boolean,
      fastSpec: ExponentialBackoffSpecification,
    ) => ExponentialBackoff;
  };
  Performance?: {
    logSinglePerformanceMark: (label: string) => void;
    setPerformanceMark: (label: string) => void;
  };
  DeviceMeta?: new () => { isAndroidApp?: boolean; isIosApp?: boolean };
  EventStream?: {
    SendEvent: (eventName: string, context: string, properties: Record<string, unknown>) => void;
    SendEventWithTarget: (
      eventName: string,
      context: string,
      properties: Record<string, unknown>,
      target: unknown,
    ) => void;
    TargetTypes: { WWW: unknown };
  };
  Hybrid?: unknown;
};

let injected: RealtimeGlobals | null = null;
let configVersion = 0;
let configured = false;
let pendingOnConfigured: (() => void)[] = [];

const markConfigured = () => {
  configured = true;
  const callbacks = pendingOnConfigured;
  pendingOnConfigured = [];
  callbacks.forEach(callback => {
    try {
      callback();
    } catch (error) {
      // Keep callbacks independent like separate ready listeners, but still surface the error.
      setTimeout(() => {
        // eslint-disable-next-line no-restricted-syntax
        throw error;
      });
    }
  });
};

const getWindowRoblox = (): RealtimeGlobals | undefined => {
  if (typeof window === "undefined") {
    return undefined;
  }
  // window.Roblox is the legacy untyped global boundary.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return (window as unknown as { Roblox?: RealtimeGlobals }).Roblox;
};

export const initRealtimeConfig = (config: RealtimeGlobals | null): void => {
  injected = config;
  configVersion += 1;
  if (config && !configured) {
    markConfigured();
  }
};

// Bumped by initRealtimeConfig so cached settings can be invalidated.
export const getRealtimeConfigVersion = (): number => configVersion;

// Runs callback once globals are available: on ready for a window.Roblox host, on Init otherwise.
export const onRealtimeConfigured = (callback: () => void): void => {
  if (configured) {
    callback();
  } else {
    pendingOnConfigured.push(callback);
  }
};

if (typeof document !== "undefined") {
  ready(() => {
    if (!configured && getWindowRoblox()) {
      markConfigured();
    }
  });
}

// Lazy so an injected config still wins.
export const getRealtimeGlobals = (): RealtimeGlobals => injected ?? getWindowRoblox() ?? {};
