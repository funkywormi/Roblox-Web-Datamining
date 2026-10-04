import { useMemo } from "react";
import { FoundationDark, FoundationLight } from "@rbx/design-foundations";
import useTheme from "./useTheme";

export type FoundationTokens = typeof FoundationDark | typeof FoundationLight;

/** @deprecated Please use Tailwind Classes or the CSS variables instead, as these tokens do not respect theme and color mode. */
const useTokens = (): FoundationTokens => {
  const theme = useTheme();

  const foundationTokens = useMemo(
    () => (theme === "dark" ? FoundationDark : FoundationLight),
    [theme],
  );

  return foundationTokens;
};

export default useTokens;
