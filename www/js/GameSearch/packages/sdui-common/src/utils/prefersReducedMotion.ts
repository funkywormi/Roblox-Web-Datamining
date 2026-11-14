import { window as browserWindow } from "@rbx/core-lib/browser";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function reducedMotionQuery(): MediaQueryList | undefined {
  if (browserWindow == null || typeof browserWindow.matchMedia !== "function") {
    return undefined;
  }
  return browserWindow.matchMedia(REDUCED_MOTION_QUERY);
}

/**
 * Whether the user prefers reduced motion. False when `matchMedia` is unavailable,
 * including during SSR.
 */
export function prefersReducedMotion(): boolean {
  return reducedMotionQuery()?.matches === true;
}

/**
 * Calls `listener` when the OS reduced-motion setting changes. The listener reads
 * {@link prefersReducedMotion} itself so it sees the new value.
 */
export function subscribeToReducedMotion(listener: () => void): () => void {
  const mediaQuery = reducedMotionQuery();
  if (mediaQuery == null || typeof mediaQuery.addEventListener !== "function") {
    return () => undefined;
  }

  mediaQuery.addEventListener("change", listener);
  return () => {
    mediaQuery.removeEventListener("change", listener);
  };
}
