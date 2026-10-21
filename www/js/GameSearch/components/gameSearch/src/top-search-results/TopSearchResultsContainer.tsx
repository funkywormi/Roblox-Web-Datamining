import { useMemo } from "react";
import type { TranslateFunction } from "@rbx/core-scripts/react";
import { usePageSession } from "@rbx/discovery-common/session";
import { Loading } from "@rbx/sdui-common";
import { SduiPageEntryPoint } from "@rbx/sdui-core/client";

import { getKeyword } from "@rbx/discovery-common/utils";
import {
  PageContext,
  OmniSearchType,
  EventStreamMetadata,
  SessionInfoType,
} from "@rbx/discovery-common/telemetry";
import { buildSearchApiRequestConfig } from "../common/services/searchService";
import { getSduiServices } from "../common/services/sduiServices";
import { normalizeKeyword } from "../common/utils/keywordUtils";
import "./topSearchResults.scss";

const TOP_SEARCH_RESULTS_APP_PAGE = PageContext.SearchPage;
const TOP_SEARCH_RESULTS_SURFACE_KEY = PageContext.SearchPage;
const TOP_SEARCH_RESULTS_FEED_IDENTIFIER = "search_results_feed";

const getTopSearchResultsPageKey = (sessionId: string) => `${PageContext.SearchPage}-${sessionId}`;

const SDUI_PAGE_ENTRY_POINT_IDENTIFIERS = { rootIdentifier: TOP_SEARCH_RESULTS_FEED_IDENTIFIER };

const TopSearchResultsLoading = () => <Loading />;

type TopSearchResultsContainerProps = {
  translate: TranslateFunction;
};

export const TopSearchResultsContainer = ({ translate }: TopSearchResultsContainerProps) => {
  const keyword = normalizeKeyword(getKeyword());

  const sessionId = usePageSession();
  const pageKey = getTopSearchResultsPageKey(sessionId);

  const services = getSduiServices({
    translate,
    pageKey,
    appPage: TOP_SEARCH_RESULTS_APP_PAGE,
  });

  const requestConfig = useMemo(
    () =>
      buildSearchApiRequestConfig({
        keyword,
        sessionId,
        surfaceKey: TOP_SEARCH_RESULTS_SURFACE_KEY,
        configKey: pageKey,
      }),
    [keyword, pageKey, sessionId],
  );

  const additionalAnalyticsData = useMemo(
    () => ({
      [SessionInfoType.GameSearchSessionInfo]: sessionId,
      [EventStreamMetadata.OmniSearchType]: OmniSearchType.TopResults,
    }),
    [sessionId],
  );

  return (
    <div className="top-search-results-page flex padding-x-[10px]">
      <SduiPageEntryPoint
        services={services}
        LoadingComponent={TopSearchResultsLoading}
        requestConfig={requestConfig}
        identifiers={SDUI_PAGE_ENTRY_POINT_IDENTIFIERS}
        containerClassName="width-full min-width-0"
        additionalAnalyticsData={additionalAnalyticsData}
      />
    </div>
  );
};

export default TopSearchResultsContainer;
