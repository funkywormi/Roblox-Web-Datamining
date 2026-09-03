import { createContext, useContext, ReactNode } from "react";
import type { NotApprovedUIConfig, TranslateFunction } from "./types";

const NotApprovedUIContext = createContext<NotApprovedUIConfig | undefined>(undefined);

interface NotApprovedUIProviderProps {
  config: NotApprovedUIConfig;
  children: ReactNode;
}

export const NotApprovedUIProvider = ({ config, children }: NotApprovedUIProviderProps) => {
  return <NotApprovedUIContext.Provider value={config}>{children}</NotApprovedUIContext.Provider>;
};

export const useNotApprovedUIConfig = (): NotApprovedUIConfig => {
  const config = useContext(NotApprovedUIContext);
  if (!config) {
    throw new Error("useNotApprovedUIConfig must be used within a NotApprovedUIProvider");
  }
  return config;
};

export const useNotApprovedTranslate = (): TranslateFunction => {
  return useNotApprovedUIConfig().translate;
};
