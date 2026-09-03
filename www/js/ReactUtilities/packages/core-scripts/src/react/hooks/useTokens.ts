import { useMemo } from "react";
import { FoundationDark, FoundationLight } from "@rbx/design-foundations";
import useTheme from "./useTheme";

export type FoundationTokens = typeof FoundationDark | typeof FoundationLight;

const useTokens = (): FoundationTokens => {
  const theme = useTheme();

  const foundationTokens = useMemo(
    () => (theme === "dark" ? FoundationDark : FoundationLight),
    [theme],
  );

  return foundationTokens;
};

export default useTokens;
