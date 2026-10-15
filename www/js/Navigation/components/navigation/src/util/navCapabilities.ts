import type { TIntAuthComplianceResponse } from "../services/complianceService";

type NavCapabilities = {
  getIntAuthCompliancePolicy: () => Promise<TIntAuthComplianceResponse>;
  useIsAccountSwitcherAvailableForBrowser: () => [boolean, boolean];
  saveGameIntentFromCurrentUrl: () => void;
};

let capabilities: Partial<NavCapabilities> = {};

export const registerNavCapabilities = (registered: Partial<NavCapabilities>): void => {
  capabilities = { ...capabilities, ...registered };
};

export const getNavCapability = <K extends keyof NavCapabilities>(
  name: K,
): NavCapabilities[K] | undefined => capabilities[name];
