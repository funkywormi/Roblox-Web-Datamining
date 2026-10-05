import React from "react";
import { Loading } from "@rbx/core-ui";
import type { RouteComponentProps } from "react-router-dom";
import SortDetailExploreApi from "../sortDetail/exploreApi/SortDetailExploreApi";
import ChartsSeeAllPageV2 from "./sduiV2/ChartsSeeAllPageV2";
import useIsChartsSduiV2Enabled from "./sduiV2/chartsSduiV2Experiment";

export type ChartsSeeAllIxpWrapperProps = RouteComponentProps<{ sortName: string }>;

// withTranslations supplies its own props at runtime, but these composed exports retain them in
// their public types after withPageSession.
const TranslatedChartsSeeAllPageV2 =
  ChartsSeeAllPageV2 as unknown as React.FC<ChartsSeeAllIxpWrapperProps>;
const TranslatedSortDetailExploreApi =
  SortDetailExploreApi as unknown as React.FC<ChartsSeeAllIxpWrapperProps>;

const ChartsSeeAllIxpWrapper = (routeProps: ChartsSeeAllIxpWrapperProps): React.JSX.Element => {
  const { isEnabled, isLoading } = useIsChartsSduiV2Enabled();

  if (isLoading) {
    return <Loading />;
  }

  return isEnabled ? (
    <TranslatedChartsSeeAllPageV2 {...routeProps} />
  ) : (
    <TranslatedSortDetailExploreApi {...routeProps} />
  );
};

export default ChartsSeeAllIxpWrapper;
