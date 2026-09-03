import { useCallback, useEffect, useState } from "react";

// Tailwind-based breakpoints as per: https://github.rbx.com/Roblox/web-foundation-packages/blob/master/packages/%40rbx/foundation-tailwind/generated/foundation-tailwind.css
export const breakpoints = {
  xsmall: 0,
  small: 361,
  medium: 601,
  large: 1141,
  xlarge: 1521,
  xxlarge: 1921,
};

export const orderedBreakpoints: Breakpoint[] = [
  "xsmall",
  "small",
  "medium",
  "large",
  "xlarge",
  "xxlarge",
];

export type Breakpoint = keyof typeof breakpoints;

export type BreakpointResult = {
  isAboveInclusive: (bp: Breakpoint) => boolean;
  value: Breakpoint;
};

function getCurrentBreakpoint(): Breakpoint {
  const width = typeof window !== "undefined" ? window.innerWidth : breakpoints.xlarge;

  if (width >= breakpoints.xxlarge) return "xxlarge";
  if (width >= breakpoints.xlarge) return "xlarge";
  if (width >= breakpoints.large) return "large";
  if (width >= breakpoints.medium) return "medium";
  if (width >= breakpoints.small) return "small";
  return "xsmall";
}

/**
 * React hook for getting the current Tailwind breakpoint keyword.
 *
 * @returns An object { isAboveInclusive, value }
 */
export function useBreakpoint(): BreakpointResult {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(getCurrentBreakpoint());

  const isAboveInclusive = useCallback(
    (bp: Breakpoint) => orderedBreakpoints.indexOf(breakpoint) >= orderedBreakpoints.indexOf(bp),
    [breakpoint],
  );

  const onResize = useCallback(() => {
    setBreakpoint(getCurrentBreakpoint());
  }, []);

  useEffect(() => {
    window.addEventListener("resize", onResize);
    onResize();

    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [onResize]);

  return {
    isAboveInclusive,
    value: breakpoint,
  };
}
