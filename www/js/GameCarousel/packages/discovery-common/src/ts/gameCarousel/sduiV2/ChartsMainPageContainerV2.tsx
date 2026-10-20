import React, { useEffect, useMemo, useRef } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { Loading } from "@rbx/core-ui";
import { SduiPageEntryPoint } from "@rbx/sdui-core/client";
import { useLocation } from "react-router-dom";
import { SessionInfoType } from "../../common/constants/eventStreamConstants";
import { usePageSession } from "../../common/utils/PageSessionContext";
import {
  CHARTS_FEED_IDENTIFIER,
  parseChartsFiltersFromSearch,
  type ChartsRequestFilters,
} from "./chartsPageConfiguration";
import { buildChartsPageRequestConfig } from "./fetchChartsData";
import { buildChartsPageEntryPointMessages } from "./chartsEntryPointMessages";
import { getChartsPageSduiServices } from "./chartsSduiServices";
import { clearChartsFilterUrlEcho, isChartsFilterUrlEcho } from "./chartsSduiRouter";

const ChartsSduiEntryPointLoading = (): React.JSX.Element => <Loading />;

export type ChartsMainPageContainerV2Props = {
  translate: TranslateFunction;
};

export const ChartsMainPageContainerV2 = ({
  translate,
}: ChartsMainPageContainerV2Props): React.JSX.Element => {
  const sessionId = usePageSession();
  const { search } = useLocation();
  const requestFiltersRef = useRef<ChartsRequestFilters>({});
  const filters = useMemo(() => {
    if (isChartsFilterUrlEcho(search)) {
      return requestFiltersRef.current;
    }
    const parsed = parseChartsFiltersFromSearch(search);
    requestFiltersRef.current = parsed;
    return parsed;
  }, [search]);
  const statusMessages = useMemo(() => buildChartsPageEntryPointMessages(translate), [translate]);
  const services = useMemo(() => getChartsPageSduiServices(translate), [translate]);
  const additionalAnalyticsData = useMemo(
    () => ({ [SessionInfoType.DiscoverPageSessionInfo]: sessionId }),
    [sessionId],
  );
  const requestConfig = useMemo(
    () => buildChartsPageRequestConfig(sessionId, filters),
    [sessionId, filters],
  );

  useEffect(() => {
    clearChartsFilterUrlEcho(search);
  }, [search]);

  return (
    <div className="charts-sdui-page flex flex-col gap-xlarge">
      <SduiPageEntryPoint
        statusMessages={statusMessages}
        services={services}
        LoadingComponent={ChartsSduiEntryPointLoading}
        requestConfig={requestConfig}
        identifiers={{ rootIdentifier: CHARTS_FEED_IDENTIFIER }}
        additionalAnalyticsData={additionalAnalyticsData}
      />
    </div>
  );
};

export default ChartsMainPageContainerV2;
