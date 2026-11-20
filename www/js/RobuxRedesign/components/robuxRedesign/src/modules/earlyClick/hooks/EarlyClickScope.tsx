import { createContext, useContext, type ReactNode } from "react";

/**
 * Which section a row belongs to. The same Robux package can be rendered in more than one section,
 * and a held tap is stored by key, so each section passes its own scope.
 */
const EarlyClickScopeContext = createContext<string | undefined>(undefined);

export const EarlyClickScope = ({ scope, children }: { scope: string; children: ReactNode }) => (
  <EarlyClickScopeContext.Provider value={scope}>{children}</EarlyClickScopeContext.Provider>
);

export const useEarlyClickScope = (): string | undefined => useContext(EarlyClickScopeContext);
