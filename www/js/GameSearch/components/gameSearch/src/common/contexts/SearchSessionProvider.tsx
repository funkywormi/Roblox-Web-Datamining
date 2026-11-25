import React, { useLayoutEffect, useState } from "react";
import { PageSessionProvider, usePageSession } from "@rbx/discovery-common/session";
import { readSearchSessions, saveSearchSessions } from "../utils/searchSessionHistory";
import { SearchTabSessionProvider, useSearchSessionForTab } from "./SearchTabSessionContext";

function SaveSearchSessions(): null {
  const omniSearchSessionId = usePageSession();
  const top = useSearchSessionForTab("top");
  const games = useSearchSessionForTab("games");

  useLayoutEffect(() => {
    saveSearchSessions({ omniSearchSessionId, top, games });
  }, [omniSearchSessionId, top, games]);
  return null;
}

export function SearchSessionProvider({
  children,
}: {
  children?: React.ReactNode;
}): React.JSX.Element {
  const [saved] = useState(readSearchSessions);
  return (
    <PageSessionProvider
      {...(saved?.omniSearchSessionId === undefined
        ? {}
        : { fallbackSessionId: saved.omniSearchSessionId })}
    >
      <SearchTabSessionProvider {...(saved === undefined ? {} : { initialSessions: saved })}>
        <SaveSearchSessions />
        {children}
      </SearchTabSessionProvider>
    </PageSessionProvider>
  );
}
