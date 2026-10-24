import { useEffect, useRef, useState } from "react";
import { window } from "@rbx/core-lib/browser";
import { breakpoints } from "./useBreakpoint";

type BreakpointKey = keyof typeof breakpoints;

/**
 * Allows keys like 'small', 'large', or raw numbers like 400.
 */
type ResponsiveConfig<T> = {
  [K in BreakpointKey | number]?: T;
};

/**
 *
 * @description keys are breakpoint floors, and the value is the value to return if the window width is greater than or equal to the key
 */
export function useResponsiveValue<T>(defaultValue: T, config: ResponsiveConfig<T>): T {
  const [windowWidth, setWindowWidth] = useState(window?.innerWidth ?? 0);
  // null until the effect measures, and when no breakpoint matches. The rendered
  // value is derived from the current arguments so a new object identity does not
  // schedule another update.
  const [matchedPx, setMatchedPx] = useState<number | null>(null);

  const configRef = useRef(config);
  configRef.current = config;

  useEffect(() => {
    const handleResize = () => setWindowWidth(window?.innerWidth ?? 0);
    window?.addEventListener("resize", handleResize);
    return () => window?.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // 1. Convert all keys (strings or numbers) into a sorted array of pixel floors
    const sortedResolutions = Object.keys(configRef.current)
      .map(key => breakpoints[key as BreakpointKey] ?? Number(key))
      .sort((a, b) => b - a); // Sort descending (largest first)

    // 2. Find the first one that matches the current width
    const match = sortedResolutions.find(px => windowWidth >= px);
    setMatchedPx(match ?? null);
  }, [windowWidth]);

  if (matchedPx == null) {
    return defaultValue;
  }

  const match = Object.entries(config).find(([key]) => {
    const px = breakpoints[key as BreakpointKey] ?? Number(key);
    return px === matchedPx;
  });

  return match ? (match[1] as T) : defaultValue;
}
