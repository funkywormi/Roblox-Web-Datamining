import React from "react";
import { RouteComponentProps } from "react-router-dom";
import { TranslateFunction, withTranslations } from "@rbx/core-scripts/react";
import { useManualScrollRestore } from "@rbx/sdui-core/client";
import eventStreamConstants, {
  EventStreamMetadata,
  SessionInfoType,
} from "../../common/constants/eventStreamConstants";
import { useVerticalScrollTracker } from "../../common/components/useVerticalScrollTracker";
import { usePageReferralTracker } from "../../common/hooks/usePageReferralTracker";
import { withPageSession } from "../../common/utils/PageSessionContext";
import { PageContext } from "../../common/types/pageContext";
import gameCarouselTranslationConfig from "../translation.config";
import { CHARTS_FILTER_KEYS, getChartsFilterResetKeyFromSearch } from "./chartsPageConfiguration";
import { ChartsSeeAllContainerV2 } from "./ChartsSeeAllContainerV2";

type ChartsSeeAllPageV2Props = {
  translate: TranslateFunction;
} & RouteComponentProps<{ sortName: string }>;

export const ChartsSeeAllPageV2 = ({
  match,
  location,
  history,
  translate,
}: ChartsSeeAllPageV2Props): React.JSX.Element => {
  const sortId = decodeURIComponent(match.params.sortName);

  usePageReferralTracker(
    eventStreamConstants.sortDetailReferral,
    [
      EventStreamMetadata.Position,
      EventStreamMetadata.GameSetTypeId,
      EventStreamMetadata.GameSetTargetId,
      EventStreamMetadata.Page,
      EventStreamMetadata.TreatmentType,
      SessionInfoType.DiscoverPageSessionInfo,
    ],
    [...CHARTS_FILTER_KEYS],
    {},
    location,
    history,
  );

  useManualScrollRestore(
    JSON.stringify([sortId, getChartsFilterResetKeyFromSearch(location.search)]),
  );
  useVerticalScrollTracker(PageContext.SortDetailPageDiscover);

  return <ChartsSeeAllContainerV2 translate={translate} sortId={sortId} />;
};

export default withPageSession(
  withTranslations(ChartsSeeAllPageV2, gameCarouselTranslationConfig) as unknown as React.FC<
    RouteComponentProps<{ sortName: string }>
  >,
);
