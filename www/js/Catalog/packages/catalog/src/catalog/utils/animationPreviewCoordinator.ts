import { useEffect, useState } from "react";

type Listener = (activeKey: string | null) => void;

let activePreviewKey: string | null = null;
const listeners = new Set<Listener>();

const notify = (): void => {
  listeners.forEach(listener => {
    listener(activePreviewKey);
  });
};

/**
 * Only one catalog card may mount a 3D animation preview at a time. Claiming a new key
 * immediately revokes the previous card so WebGL contexts do not overlap while scrubbing.
 */
export const getActiveAnimationPreviewKey = (): string | null => activePreviewKey;

export const claimAnimationPreview = (key: string): (() => void) => {
  activePreviewKey = key;
  notify();
  return () => {
    if (activePreviewKey === key) {
      activePreviewKey = null;
      notify();
    }
  };
};

export const useIsActiveAnimationPreview = (key: string): boolean => {
  const [isActive, setIsActive] = useState(() => activePreviewKey === key);

  useEffect(() => {
    const listener: Listener = nextKey => {
      setIsActive(nextKey === key);
    };
    listeners.add(listener);
    setIsActive(activePreviewKey === key);
    return () => {
      listeners.delete(listener);
    };
  }, [key]);

  return isActive;
};

/** Test helper. */
export const resetAnimationPreviewCoordinator = (): void => {
  activePreviewKey = null;
  listeners.clear();
};
