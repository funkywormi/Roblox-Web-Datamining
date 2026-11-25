import { SessionInfo } from "@rbx/unified-logging";
import {
  componentTypeName,
  findAnalyticsField,
  stripEnumPrefix,
  type SduiComponentConfig,
} from "@rbx/sdui-core";

type AnalyticsSnapshot = Record<string, string | number | boolean>;

export type SduiFeedImpressionFields = {
  pageContext: string;
  feedItemPositions: string;
  feedCollectionIds: string;
  feedComponentTypes: string;
} & Partial<Record<SessionInfo, string>>;

export type SduiFeedImpressionPayload = {
  fields: SduiFeedImpressionFields | undefined;
  impressedIndexes: number[];
  missingIndexes: number[];
};

function readSessionInfoFields(
  analyticsData: AnalyticsSnapshot,
): Partial<Record<SessionInfo, string>> {
  const sessionInfo: Partial<Record<SessionInfo, string>> = {};
  Object.values(SessionInfo).forEach(fieldName => {
    const value = findAnalyticsField(fieldName, analyticsData);
    if (typeof value === "string" && value.length > 0) {
      sessionInfo[fieldName] = value;
    }
  });
  return sessionInfo;
}

function keepFirstSessionInfo(
  sessionInfo: Partial<Record<SessionInfo, string>>,
  sectionSessionInfo: Partial<Record<SessionInfo, string>>,
): Partial<Record<SessionInfo, string>> {
  const nextSessionInfo = { ...sessionInfo };
  Object.values(SessionInfo).forEach(fieldName => {
    if (nextSessionInfo[fieldName] == null && sectionSessionInfo[fieldName] != null) {
      nextSessionInfo[fieldName] = sectionSessionInfo[fieldName];
    }
  });
  return nextSessionInfo;
}

function resolveFeedComponentType(
  analyticsData: AnalyticsSnapshot,
  componentType: SduiComponentConfig["componentType"],
): string {
  const analyticsComponentType = findAnalyticsField("componentType", analyticsData);
  if (analyticsComponentType != null) {
    return String(analyticsComponentType);
  }

  return stripEnumPrefix(componentTypeName(componentType), "", true);
}

function readSectionAnalytics(componentConfig: SduiComponentConfig): AnalyticsSnapshot {
  const { analyticsContext } = componentConfig;
  if (analyticsContext == null) {
    return {};
  }
  return {
    ...analyticsContext.getAncestorAnalyticsDataSnapshot(),
    ...analyticsContext.getAnalyticsDataSnapshot(),
  };
}

export function buildSduiFeedImpressionPayload(
  feedItemConfigs: SduiComponentConfig[],
  impressedIndexes: number[],
  pageContext: string,
): SduiFeedImpressionPayload {
  const feedItemPositions: number[] = [];
  const feedCollectionIds: string[] = [];
  const feedComponentTypes: string[] = [];
  const includedIndexes: number[] = [];
  const missingIndexes: number[] = [];
  let sessionInfo: Partial<Record<SessionInfo, string>> = {};

  impressedIndexes.forEach(index => {
    const componentConfig = feedItemConfigs[index];
    if (componentConfig == null) {
      missingIndexes.push(index);
      return;
    }

    const analyticsData = readSectionAnalytics(componentConfig);
    const collectionId = findAnalyticsField("collectionId", analyticsData);
    sessionInfo = keepFirstSessionInfo(sessionInfo, readSessionInfoFields(analyticsData));

    feedItemPositions.push(index + 1);
    feedCollectionIds.push(collectionId == null ? "" : String(collectionId));
    feedComponentTypes.push(resolveFeedComponentType(analyticsData, componentConfig.componentType));
    includedIndexes.push(index);
  });

  if (includedIndexes.length === 0) {
    return { fields: undefined, impressedIndexes: includedIndexes, missingIndexes };
  }

  return {
    fields: {
      pageContext,
      feedItemPositions: feedItemPositions.join(","),
      feedCollectionIds: feedCollectionIds.join(","),
      feedComponentTypes: feedComponentTypes.join(","),
      ...sessionInfo,
    },
    impressedIndexes: includedIndexes,
    missingIndexes,
  };
}
