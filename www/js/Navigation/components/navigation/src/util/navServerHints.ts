import { createContext, useContext } from "react";

export type NavServerHints = {
  downloadTypeStream?: Promise<string | null> | null;
  robuxStream?: Promise<number | null> | null;
  plusReferralEligibilityStream?: Promise<string | null> | null;
};

const noHints: NavServerHints = {};

export const NavServerHintsContext = createContext<NavServerHints>(noHints);

export const useNavServerHints = (): NavServerHints => useContext(NavServerHintsContext);

export const useIsNavServerRendered = (): boolean => useContext(NavServerHintsContext) !== noHints;
