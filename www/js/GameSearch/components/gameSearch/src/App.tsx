import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { GameSearch } from "@rbx/discovery-common";
import { translations } from "../component.json";
import { useSearchType } from "./common/hooks/useSearchType";
import { useTopSearchResultsIxpWithExposure } from "./common/hooks/useTopSearchResultsIxpWithExposure";
import TopSearchResultsPage from "./top-search-results/TopSearchResultsPage";

function App(props: WithTranslationsProps) {
  const [searchType] = useSearchType();
  useTopSearchResultsIxpWithExposure();

  if (searchType === "top") {
    return <TopSearchResultsPage translate={props.translate} />;
  }

  return <GameSearch {...props} />;
}

export default withTranslations(App, translations);
