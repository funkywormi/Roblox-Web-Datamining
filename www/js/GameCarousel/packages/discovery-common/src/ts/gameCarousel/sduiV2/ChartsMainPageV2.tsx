import React from "react";
import { RouteComponentProps, useLocation } from "react-router-dom";
import { TranslationProvider, useTranslation } from "@rbx/core-scripts/react";
import { useManualScrollRestore } from "@rbx/sdui-core/client";
import { CommonUIFeatures } from "../../common/constants/translationConstants";
import { useVerticalScrollTracker } from "../../common/components/useVerticalScrollTracker";
import { PageContext } from "../../common/types/pageContext";
import { withPageSession } from "../../common/utils/PageSessionContext";
import gameCarouselTranslationConfig from "../translation.config";
import { getChartsFilterResetKeyFromSearch } from "./chartsPageConfiguration";
import { ChartsMainPageContainerV2 } from "./ChartsMainPageContainerV2";

/**
 * Page shell for the main Charts SDUI v2 feed. Exported for IXP cutover in #17805;
 * `/charts` remains on the legacy route until then.
 */
export const ChartsMainPageV2 = (): React.JSX.Element => {
  const { translate } = useTranslation();
  const { search } = useLocation();

  useVerticalScrollTracker(PageContext.GamesPage);
  useManualScrollRestore(getChartsFilterResetKeyFromSearch(search));

  return (
    <div className="games-page-container">
      <section className="section">
        <div className="games-list-header">
          <h1>{translate(CommonUIFeatures.LabelCharts)}</h1>
        </div>
        <ChartsMainPageContainerV2 translate={translate} />
      </section>
    </div>
  );
};

const ChartsMainPageV2Entry = (_props: RouteComponentProps): React.JSX.Element => (
  <TranslationProvider config={gameCarouselTranslationConfig}>
    <ChartsMainPageV2 />
  </TranslationProvider>
);

export default withPageSession(ChartsMainPageV2Entry);
