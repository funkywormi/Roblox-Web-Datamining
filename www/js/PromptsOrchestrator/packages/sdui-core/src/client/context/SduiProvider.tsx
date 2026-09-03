import React, { createContext, useContext, useMemo } from "react";
import type { SduiServices } from "../../services/SduiServices";
import type { SduiPageContext } from "../../types";

export interface SduiContextValue extends SduiServices {
  pageContext?: SduiPageContext;
  configKey?: string;
}

export const SduiContext = createContext<SduiContextValue | null>(null);
SduiContext.displayName = "SduiContext";

/**
 * Read the SDUI services + page metadata from the nearest `SduiProvider`.
 * Throws when called outside a provider so misuse fails loudly at mount.
 */
export function useSduiServices(): SduiContextValue {
  const contextValue = useContext(SduiContext);
  if (!contextValue) {
    throw new Error("SDUI: useSduiServices must be called inside an <SduiProvider>");
  }
  return contextValue;
}

export interface SduiProviderProps {
  children: React.ReactNode;
  services: SduiServices;
  pageContext?: SduiPageContext;
  configKey?: string;
}

/**
 * Provides `SduiServices` plus per-page metadata (`pageContext`, `configKey`) to descendants.
 */
export function SduiProvider({ children, services, pageContext, configKey }: SduiProviderProps) {
  const contextValue = useMemo<SduiContextValue>(
    () => ({ ...services, pageContext, configKey }),
    [services, pageContext, configKey],
  );

  return <SduiContext.Provider value={contextValue}>{children}</SduiContext.Provider>;
}
