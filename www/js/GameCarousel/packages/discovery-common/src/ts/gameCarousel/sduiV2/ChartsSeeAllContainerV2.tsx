import React, { useMemo } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import { SduiPageEntryPoint } from "@rbx/sdui-core/client";
import { useLocation } from "react-router-dom";
import { SessionInfoType } from "../../common/constants/eventStreamConstants";
import { usePageSession } from "../../common/utils/PageSessionContext";
import {
  SORT_DETAIL_FEED_IDENTIFIER,
  getChartsSortDetailPageKey,
  parseChartsFiltersFromSearch,
} from "./chartsPageConfiguration";
import { syncChartsClientPageScope } from "./chartsClientPageScope";
import { buildChartsSortDetailRequestConfig } from "./fetchChartsData";
import { buildChartsPageEntryPointMessages } from "./chartsEntryPointMessages";
import { getChartsSeeAllSduiServices } from "./chartsSduiServices";

const ChartsSduiEntryPointLoading = (): React.JSX.Element => <Loading />;

export type ChartsSeeAllContainerV2Props = {
  translate: TranslateFunction;
  sortId: string;
};

export const ChartsSeeAllContainerV2 = ({
  translate,
  sortId,
}: ChartsSeeAllContainerV2Props): React.JSX.Element => {
  const sessionId = usePageSession();
  const { search } = useLocation();
  const filters = useMemo(() => parseChartsFiltersFromSearch(search), [search]);
  const clientPageScopeConfigKey = getChartsSortDetailPageKey(sortId);
  useMemo(() => syncChartsClientPageScope(clientPageScopeConfigKey), [clientPageScopeConfigKey]);
  const statusMessages = useMemo(() => buildChartsPageEntryPointMessages(translate), [translate]);
  const services = useMemo(() => getChartsSeeAllSduiServices(translate), [translate]);
  const additionalAnalyticsData = useMemo(
    () => ({ [SessionInfoType.DiscoverPageSessionInfo]: sessionId }),
    [sessionId],
  );
  const requestConfig = useMemo(
    () => buildChartsSortDetailRequestConfig(sortId, sessionId, filters),
    [sortId, sessionId, filters],
  );

  return (
    <div className="charts-sdui-page charts-sdui-sort-detail flex flex-col gap-xlarge">
      <SduiPageEntryPoint
        statusMessages={statusMessages}
        services={services}
        LoadingComponent={ChartsSduiEntryPointLoading}
        requestConfig={requestConfig}
        identifiers={{ rootIdentifier: SORT_DETAIL_FEED_IDENTIFIER }}
        additionalAnalyticsData={additionalAnalyticsData}
      />
    </div>
  );
};

export default ChartsSeeAllContainerV2;
