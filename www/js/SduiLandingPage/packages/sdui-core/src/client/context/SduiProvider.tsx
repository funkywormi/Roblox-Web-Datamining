import React, { createContext, useContext, useMemo } from "react";
import type { SduiServices } from "../../services/SduiServices";

export interface SduiContextValue extends SduiServices {
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

/**
 * Read `translate` from the nearest `SduiProvider`. Unlike `useSduiServices`, returns undefined
 * outside a provider, for primitives that fall back to English text.
 */
export function useSduiTranslate(): SduiServices["translate"] {
  return useContext(SduiContext)?.translate;
}

/** Read the cache/request key scoped to the nearest SDUI render subtree. */
export function useSduiConfigKey(): string | undefined {
  return useSduiServices().configKey;
}

export interface SduiProviderProps {
  children: React.ReactNode;
  services: SduiServices;
  configKey?: string;
}

/**
 * Provides `SduiServices` plus the current `configKey` to descendants.
 */
export function SduiProvider({ children, services, configKey }: SduiProviderProps) {
  const contextValue = useMemo<SduiContextValue>(
    () => ({ ...services, configKey }),
    [services, configKey],
  );

  return <SduiContext.Provider value={contextValue}>{children}</SduiContext.Provider>;
}
