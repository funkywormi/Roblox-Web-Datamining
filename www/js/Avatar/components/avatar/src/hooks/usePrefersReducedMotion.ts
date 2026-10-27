import { useEffect, useState } from "react";
import { window as browserWindow } from "@rbx/core-lib/browser";
import { prefersReducedMotion } from "../utils/animationPreview";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Subscribes to the OS/browser reduced-motion preference so animation previews
 * update if the user toggles the setting without a full reload.
 */
export default function usePrefersReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    if (browserWindow == null || typeof browserWindow.matchMedia !== "function") {
      return undefined;
    }
    const mediaQuery = browserWindow.matchMedia(REDUCED_MOTION_QUERY);
    const onChange = (): void => {
      setReducedMotion(mediaQuery.matches);
    };
    onChange();
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", onChange);
      return () => {
        mediaQuery.removeEventListener("change", onChange);
      };
    }
    return undefined;
  }, []);

  return reducedMotion;
}
