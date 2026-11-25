// The circuit breaker's start log: when the probe last started on this device, so it starts at
// most MAX_STARTS times in START_WINDOW_MS whatever the outcome, a run the tab hid or that never
// settled included. Kept apart from the scores entry, which a run's outcome replaces.
import { getItem, hasItem, removeItem, setItem } from "@rbx/core-lib/local-storage";
import { browserCacheKey } from "./cache";

/**
 * Not under the `RBX_WASM_DEVICE_PROBE_` prefix: clients before 1.5.0 remove every entry there
 * they can't date, and this one has no `measuredAt` or `failedAt`.
 */
export const STARTS_KEY = "RBX_DEVICE_PROBE_STARTS";

const MAX_STARTS = 2;
export const START_WINDOW_MS = 24 * 60 * 60 * 1000;

/** The probe's starts on this browser version, in Unix milliseconds, oldest first. */
type ProbeStarts = {
  browser: string;
  startedAt: number[];
  /** Set once a call the cap stopped reported it, so later ones in the window don't. */
  skipReported?: true;
};

declare module "@rbx/core-lib/local-storage" {
  interface LocalStorageRegistry {
    [STARTS_KEY]: ProbeStarts;
  }
}

// The log, on this browser version: a browser update starts a new log, as it re-probes.
const readStarts = (): { startedAt: unknown[]; skipReported: boolean } | null => {
  const entry: unknown = getItem(STARTS_KEY);
  if (
    typeof entry !== "object" ||
    entry === null ||
    Reflect.get(entry, "browser") !== browserCacheKey()
  ) {
    return null;
  }
  const startedAt: unknown = Reflect.get(entry, "startedAt");
  return {
    startedAt: Array.isArray(startedAt) ? startedAt : [],
    skipReported: Reflect.get(entry, "skipReported") === true,
  };
};

// Starts within the window. A start from the future (the clock moved back) is ignored, like a
// cached entry is.
const recentStarts = (log: ReturnType<typeof readStarts>, now: number): number[] =>
  (log?.startedAt ?? []).filter(
    (at): at is number => typeof at === "number" && now - at >= 0 && now - at < START_WINDOW_MS,
  );

/**
 * Whether the probe already started {@link MAX_STARTS} times in the last
 * {@link START_WINDOW_MS}, and whether this is the first call the cap stops in that window, which
 * reports it: the background run asks on every page view.
 */
export const checkStartCap = (now: number): { reached: boolean; firstSkip: boolean } => {
  const log = readStarts();
  const startedAt = recentStarts(log, now);
  if (startedAt.length < MAX_STARTS) {
    return { reached: false, firstSkip: false };
  }
  const firstSkip = log?.skipReported !== true;
  if (firstSkip) {
    setItem(STARTS_KEY, { browser: browserCacheKey(), startedAt, skipReported: true });
  }
  return { reached: true, firstSkip };
};

/** Logs a start. `false` when it couldn't be written (storage full or blocked). */
export const recordStart = (now: number): boolean =>
  setItem(STARTS_KEY, {
    browser: browserCacheKey(),
    startedAt: [...recentStarts(readStarts(), now), now].slice(-MAX_STARTS),
  }).isOk();

/** Removes the log once it holds no start in the window, so it isn't kept past its use. */
export const removeStaleStarts = (now: number): void => {
  if (hasItem(STARTS_KEY) && recentStarts(readStarts(), now).length === 0) {
    removeItem(STARTS_KEY);
  }
};
