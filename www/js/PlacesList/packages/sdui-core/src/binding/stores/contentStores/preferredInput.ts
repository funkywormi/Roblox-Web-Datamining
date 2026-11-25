export const PreferredInput = {
  Pointer: "Pointer",
  Touch: "Touch",
} as const;

export type PreferredInput = (typeof PreferredInput)[keyof typeof PreferredInput];

const PRIMARY_TOUCH_QUERY = "(pointer: coarse)";

type PreferredInputListener = (preferredInput: PreferredInput) => void;

function fromCoarsePointer(matches: boolean): PreferredInput {
  return matches ? PreferredInput.Touch : PreferredInput.Pointer;
}

export function readInitialPreferredInput(): PreferredInput {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return PreferredInput.Pointer;
  }

  return fromCoarsePointer(window.matchMedia(PRIMARY_TOUCH_QUERY).matches);
}

/**
 * Observes changes to the browser's primary pointer capability.
 */
export function observePreferredInput(listener: PreferredInputListener): () => void {
  if (typeof window === "undefined") return (): void => undefined;

  const cleanups: (() => void)[] = [];
  const runCleanups = (): void => {
    cleanups.forEach(cleanup => {
      cleanup();
    });
  };

  const primaryTouchQuery =
    typeof window.matchMedia === "function" ? window.matchMedia(PRIMARY_TOUCH_QUERY) : undefined;
  if (primaryTouchQuery) {
    const handlePrimaryPointerChange = (): void => {
      listener(fromCoarsePointer(primaryTouchQuery.matches));
    };
    primaryTouchQuery.addEventListener("change", handlePrimaryPointerChange);
    cleanups.push(() => {
      primaryTouchQuery.removeEventListener("change", handlePrimaryPointerChange);
    });
  }

  return runCleanups;
}
