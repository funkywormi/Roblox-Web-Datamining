import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { useQueries, useQuery, UseQueryResult } from '@tanstack/react-query';
import { EnvironmentUrls } from 'Roblox';
import { useSystemFeedback } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { Configuration } from '@rbx/clients-core';
import {
  AnalyticsQueryGatewayAPIApi,
  FilterOperation,
  MetricGranularity,
  ResourceType,
  QueryResponse
} from '@rbx/client-analytics-query-gateway/v1';
import {
  GROUP_ANALYTICS_CARDS,
  GROUP_ANALYTICS_DATE_RANGES,
  GroupAnalyticsCardDefinition,
  ChartSummaryType
} from '../groupAnalyticsDefinitions';
import { DEFAULT_RAQI_CLIENT_OPTIONS, pollQueryResponse } from '../utils/pollQueryResponse';
import { getCurrentAndComparisonWindows, snapToUtcDayStart } from '../utils/dateRange';
import {
  getGroupAnalyticsMetricSnapshot,
  GroupAnalyticsMetricSnapshot
} from '../utils/groupAnalyticsMetricSnapshot';

function buildMetricQueryFilter(
  dimension?: string,
  values?: string[]
): Array<{ dimension: string; values: string[]; operation: FilterOperation }> | undefined {
  if (dimension && values) {
    return [
      {
        dimension,
        values,
        operation: FilterOperation.Match
      }
    ];
  }
  return undefined;
}

async function fetchMetricQueryForCard(
  gatewayApi: AnalyticsQueryGatewayAPIApi,
  groupId: number,
  fetchStart: Date,
  fetchEnd: Date,
  card: GroupAnalyticsCardDefinition
): Promise<QueryResponse> {
  const query: {
    metric: string;
    granularity: MetricGranularity;
    startTime: string;
    endTime: string;
    filter?: Array<{ dimension: string; values: string[]; operation: FilterOperation }>;
  } = {
    metric: card.metricName,
    granularity: MetricGranularity.OneDay,
    startTime: fetchStart.toISOString(),
    endTime: fetchEnd.toISOString(),
    filter: buildMetricQueryFilter(card.dimension, card.values)
  };
  // poll until query returns done = true
  return pollQueryResponse(
    () =>
      gatewayApi.v1MetricsResourceResourceTypeIdResourceIdPost({
        resourceType: ResourceType.Group,
        resourceId: String(groupId),
        queryRequest: {
          query
        }
      }),
    DEFAULT_RAQI_CLIENT_OPTIONS
  );
}

export type GroupAnalyticsContextValue = {
  timeRangeDays: number;
  setTimeRangeDays: (days: number) => void;
  getCardMetricQuery: (
    card: GroupAnalyticsCardDefinition
  ) => UseQueryResult<GroupAnalyticsMetricSnapshot | undefined>;
  isMetricMetadataLoading: boolean;
  isMetricMetadataError: boolean;
};

const GroupAnalyticsContext = createContext<GroupAnalyticsContextValue | undefined>(undefined);

export const useGroupAnalytics = (): GroupAnalyticsContextValue => {
  const ctx = useContext(GroupAnalyticsContext);
  if (!ctx) {
    throw new Error('useGroupAnalytics must be used within GroupAnalyticsProvider');
  }
  return ctx;
};

export type GroupAnalyticsProviderProps = {
  groupId: number;
  cards?: GroupAnalyticsCardDefinition[];
  children: React.ReactNode;
};

export function GroupAnalyticsProvider({
  groupId,
  cards,
  children
}: GroupAnalyticsProviderProps): JSX.Element {
  const { systemFeedbackService } = useSystemFeedback();
  const { translate } = useTranslation();

  // Time range the user sets to get metric data over
  const [timeRangeDays, setTimeRangeDays] = useState(GROUP_ANALYTICS_DATE_RANGES[0].numOfDays);

  const gatewayApi = useMemo(() => {
    const basePath = `${EnvironmentUrls.apiGatewayUrl}/analytics-query-gateway`.replace(/\/$/, '');
    return new AnalyticsQueryGatewayAPIApi(
      new Configuration({
        basePath,
        credentials: 'include'
      })
    );
  }, []);

  const activeCards = useMemo(() => cards ?? GROUP_ANALYTICS_CARDS, [cards]);
  const uniqueMetricNames = useMemo(() => Array.from(new Set(activeCards.map(c => c.metricName))), [
    activeCards
  ]);

  const notifyGatewayNetworkError = useCallback(() => {
    systemFeedbackService.warning(translate('NetworkError'));
  }, [systemFeedbackService, translate]);

  // Load the metadata to get the latestAvailableTime for each metric
  const {
    data: metricMetadata,
    isLoading: isMetricMetadataLoading,
    isError: isMetricMetadataError
  } = useQuery({
    queryKey: ['group-analytics-metadata-query', groupId, uniqueMetricNames],
    queryFn: () =>
      pollQueryResponse(() =>
        gatewayApi.v1MetricsMetadataPost({
          metricMetadataRequest: { query: { metrics: uniqueMetricNames } }
        })
      ),
    enabled: groupId > 0,
    onError: notifyGatewayNetworkError,
    retry: 3
  });

  // Generate a map of metricName -> latestAvailableTime
  const maxEndDateByMetric = useMemo(() => {
    const map = new Map<string, Date>();
    const rows = metricMetadata?.operation?.metricMetadataResult?.metadata;
    if (!rows) {
      return map;
    }
    for (const row of rows) {
      const name = row.metric;
      const t = row.latestAvailableTime;
      if (name && t) {
        map.set(name, new Date(t));
      }
    }
    return map;
  }, [metricMetadata]);

  const metadataResolved = groupId > 0 && !isMetricMetadataLoading;

  // Load metrics for each card we show
  const cardMetricQueries = useQueries({
    queries: activeCards.map(card => {
      const { metricName, id: cardId } = card;
      const maxEndDate = snapToUtcDayStart(maxEndDateByMetric.get(metricName) ?? new Date());
      return {
        queryKey: [
          'group-analytics-query',
          groupId,
          timeRangeDays,
          metricName,
          maxEndDate.toISOString(),
          cardId
        ],
        queryFn: async () => {
          if (isMetricMetadataError) return undefined;

          const {
            currentWindow,
            comparisonWindow,
            fetchStart,
            fetchEnd
          } = getCurrentAndComparisonWindows(timeRangeDays, maxEndDate);

          const metricQuery = await fetchMetricQueryForCard(
            gatewayApi,
            groupId,
            fetchStart,
            fetchEnd,
            card
          );

          return getGroupAnalyticsMetricSnapshot(
            card.chartSummaryType ?? ChartSummaryType.Total,
            metricQuery,
            currentWindow,
            comparisonWindow
          );
        },
        enabled: metadataResolved,
        onError: notifyGatewayNetworkError,
        retry: 3
      };
    })
  });

  // Get the metric query associated with an analytics card
  const getCardMetricQuery = useCallback(
    (
      card: GroupAnalyticsCardDefinition
    ): UseQueryResult<GroupAnalyticsMetricSnapshot | undefined> => {
      const index = activeCards.findIndex(c => c.id === card.id);
      return cardMetricQueries[index];
    },
    [activeCards, cardMetricQueries]
  );

  const value = useMemo(
    () => ({
      timeRangeDays,
      setTimeRangeDays,
      getCardMetricQuery,
      isMetricMetadataLoading,
      isMetricMetadataError
    }),
    [timeRangeDays, getCardMetricQuery, isMetricMetadataLoading, isMetricMetadataError]
  );

  return <GroupAnalyticsContext.Provider value={value}>{children}</GroupAnalyticsContext.Provider>;
}
