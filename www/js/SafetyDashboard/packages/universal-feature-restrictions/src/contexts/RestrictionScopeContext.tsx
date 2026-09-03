import { createContext, useContext, useMemo, type ReactNode } from "react";

/**
 * Supplies metadata that belongs to one rendered restriction rather than to the host application.
 * Each future top-level restriction surface can establish its own isolated context.
 */

interface RestrictionScope {
  abuseVector: string;
  readOnly: boolean;
}

interface Props {
  abuseVector: string;
  readOnly?: boolean;
  children: ReactNode;
}

const RestrictionScopeContext = createContext<RestrictionScope | undefined>(undefined);

export const RestrictionScopeProvider = ({ abuseVector, readOnly = false, children }: Props) => {
  const scope = useMemo(() => ({ abuseVector, readOnly }), [abuseVector, readOnly]);
  return (
    <RestrictionScopeContext.Provider value={scope}>{children}</RestrictionScopeContext.Provider>
  );
};

export const useRestrictionScope = (): RestrictionScope => {
  const scope = useContext(RestrictionScopeContext);

  if (!scope) {
    throw new Error("useRestrictionScope must be used within a RestrictionScopeProvider");
  }

  return scope;
};
