import type { WithTranslationsProps } from "@rbx/core-scripts/react";
import { GameSearch } from "@rbx/discovery-common";
import { useSearchSessionForTab } from "../common/contexts/SearchTabSessionContext";

export default function GameSearchResultsPage(props: WithTranslationsProps): React.JSX.Element {
  const gamesTabSessionId = useSearchSessionForTab("games");

  return <GameSearch {...props} gamesTabSessionId={gamesTabSessionId} />;
}
