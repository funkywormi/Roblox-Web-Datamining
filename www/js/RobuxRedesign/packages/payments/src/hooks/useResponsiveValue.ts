import { useEffect, useState } from "react";
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
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0,
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 1. Convert all keys (strings or numbers) into a sorted array of [pixelValue, T]
  const sortedResolutions = Object.entries(config)
    .map(([key, value]) => {
      const px = breakpoints[key as BreakpointKey] ?? Number(key);
      return { px, value };
    })
    .sort((a, b) => b.px - a.px); // Sort descending (largest first)

  // 2. Find the first one that matches the current width
  const match = sortedResolutions.find(res => windowWidth >= res.px);

  return match ? (match.value as T) : defaultValue;
}
