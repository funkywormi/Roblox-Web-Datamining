import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type SupportCenterContextState = {
  isTicketInaccessible: boolean;
  currentPageIndex: number;
};

type SupportCenterContextValue = SupportCenterContextState & {
  setIsTicketInaccessible: (inaccessible: boolean) => void;
  setCurrentPageIndex: (pageIndex: number) => void;
};

const defaultState: SupportCenterContextState = {
  isTicketInaccessible: false,
  currentPageIndex: 0,
};

const SupportCenterContext = createContext<SupportCenterContextValue | null>(null);

export const SupportCenterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<SupportCenterContextState>(defaultState);

  const setIsTicketInaccessible = useCallback((inaccessible: boolean) => {
    setState(current => ({ ...current, isTicketInaccessible: inaccessible }));
  }, []);

  const setCurrentPageIndex = useCallback((pageIndex: number) => {
    setState(current => ({ ...current, currentPageIndex: pageIndex }));
  }, []);

  const value = useMemo(
    (): SupportCenterContextValue => ({
      ...state,
      setIsTicketInaccessible,
      setCurrentPageIndex,
    }),
    [state, setIsTicketInaccessible, setCurrentPageIndex],
  );

  return <SupportCenterContext.Provider value={value}>{children}</SupportCenterContext.Provider>;
};

export const useSupportCenterContext = (): SupportCenterContextValue => {
  const context = useContext(SupportCenterContext);
  if (!context) {
    throw new Error("useSupportCenterContext must be used within SupportCenterProvider");
  }
  return context;
};
