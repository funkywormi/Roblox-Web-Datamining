import React, { createContext, useContext, useState } from "react";
import { generateRandomUuid } from "@rbx/core-lib/uuid";

import type { SearchType } from "../hooks/useSearchType";

type SearchTabSessions = Readonly<Record<SearchType, string>>;

const SearchTabSessionContext = createContext<SearchTabSessions | undefined>(undefined);

export function SearchTabSessionProvider({
  children,
  initialSessions,
}: {
  children?: React.ReactNode;
  initialSessions?: Partial<SearchTabSessions>;
}): React.JSX.Element {
  const [sessions] = useState(() => ({
    top: initialSessions?.top ?? generateRandomUuid(),
    games: initialSessions?.games ?? generateRandomUuid(),
  }));
  return (
    <SearchTabSessionContext.Provider value={sessions}>{children}</SearchTabSessionContext.Provider>
  );
}

export function useSearchSessionForTab(tab: SearchType): string {
  const sessions = useContext(SearchTabSessionContext);
  if (sessions === undefined) {
    throw new Error("Search tabs require SearchTabSessionProvider");
  }
  return sessions[tab];
}
