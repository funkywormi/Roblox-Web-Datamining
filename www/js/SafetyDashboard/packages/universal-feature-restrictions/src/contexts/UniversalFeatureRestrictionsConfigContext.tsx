import { createContext, useContext, type ReactNode } from "react";
import type { UniversalFeatureRestrictionsConfig } from "../types/hostConfig";

/**
 * Supplies the host-agnostic configuration to the dialog subtree (translations, data access,
 * analytics, and IXP). Owned by {@link UniversalFeatureRestrictionsConfigProvider} and
 * consumed via {@link useUniversalFeatureRestrictionsConfig}.
 */
const UniversalFeatureRestrictionsConfigContext = createContext<
  UniversalFeatureRestrictionsConfig | undefined
>(undefined);

interface Props {
  config: UniversalFeatureRestrictionsConfig;
  children: ReactNode;
}

export const UniversalFeatureRestrictionsConfigProvider = ({ config, children }: Props) => {
  return (
    <UniversalFeatureRestrictionsConfigContext.Provider value={config}>
      {children}
    </UniversalFeatureRestrictionsConfigContext.Provider>
  );
};

export const useUniversalFeatureRestrictionsConfig = (): UniversalFeatureRestrictionsConfig => {
  const config = useContext(UniversalFeatureRestrictionsConfigContext);

  if (!config) {
    throw new Error(
      "useUniversalFeatureRestrictionsConfig must be used within a UniversalFeatureRestrictionsConfigProvider",
    );
  }

  return config;
};
