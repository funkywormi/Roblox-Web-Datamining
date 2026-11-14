import { document } from "@rbx/core-lib/browser";
import { getItem } from "@rbx/core-lib/local-storage";
import "../constants/localStorageRegistry";

const isHidden = (): boolean => document?.visibilityState === "hidden";

let hiddenSeen = isHidden();
let hiddenTransitions = 0;

document?.addEventListener("visibilitychange", () => {
  if (isHidden()) {
    hiddenSeen = true;
    hiddenTransitions += 1;
  }
});

// Chrome 115+ records every visibility change since navigation start, including any before this bundle ran.
const hiddenInTimeline = (since = 0): boolean => {
  try {
    return performance
      .getEntriesByType("visibility-state")
      .some(entry => entry.name === "hidden" && entry.startTime >= since);
  } catch {
    return false;
  }
};

export const getWasHidden = (): "true" | "false" =>
  hiddenSeen || hiddenInTimeline() ? "true" : "false";

export const watchHiddenFromNow = (): (() => "true" | "false") => {
  const start = performance.now();
  const startTransitions = hiddenTransitions;
  const hiddenAtStart = isHidden();
  return () =>
    hiddenAtStart || isHidden() || hiddenTransitions !== startTransitions || hiddenInTimeline(start)
      ? "true"
      : "false";
};

export const logTimingDebug = (
  name: string,
  ms: number,
  dimensions: Record<string, string>,
): void => {
  if (getItem("rbx-nav-timing-debug") === 1) {
    // eslint-disable-next-line no-console
    console.info(`[nav-timing] ${name} ${Math.round(ms)}ms`, dimensions);
  }
};
