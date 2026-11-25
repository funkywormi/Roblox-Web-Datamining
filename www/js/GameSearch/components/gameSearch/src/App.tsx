import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { SearchSessionProvider } from "./common/contexts/SearchSessionProvider";
import { translations } from "../component.json";
import { useSearchType } from "./common/hooks/useSearchType";
import { useTopSearchResultsIxpWithExposure } from "./common/hooks/useTopSearchResultsIxpWithExposure";
import GameSearchResultsPage from "./game-search-results/GameSearchResultsPage";
import TopSearchResultsPage from "./top-search-results/TopSearchResultsPage";

function App(props: WithTranslationsProps) {
  const [searchType] = useSearchType();
  useTopSearchResultsIxpWithExposure();

  if (searchType === "top") {
    return <TopSearchResultsPage translate={props.translate} />;
  }

  return <GameSearchResultsPage {...props} />;
}

function SearchApp(props: WithTranslationsProps): React.JSX.Element {
  return (
    <SearchSessionProvider>
      <App {...props} />
    </SearchSessionProvider>
  );
}

export default withTranslations(SearchApp, translations);
