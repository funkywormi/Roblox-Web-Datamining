import {
  EventNames,
  ItemActionMetadata,
  parseEventParams,
  SharedEventMetadata,
} from "@rbx/unified-logging";
import { sendEvent } from "@rbx/core-scripts/event-stream";
import {
  TAnalyticsContext,
  TCollectionAnalyticsData,
  TItemAnalyticsData,
  TSduiContext,
} from "./SduiTypes";
import logSduiError, { SduiErrorNames } from "../utils/logSduiError";
import { buildAndValidateItemAnalyticsData, DUMMY_COLLECTION_DATA } from "./buildAnalyticsData";
import { TSduiActionConfig } from "./SduiActionParserRegistry";
import { filterInvalidEventParams, getEventContext } from "../utils/analyticsParsingUtils";

export const buildBaseActionParams = (
  item: TItemAnalyticsData,
  entryIndex: number,
  contentType: string,
  collectionPosition: number,
  collectionId: number,
  collectionComponentType: string,
  totalNumberOfItems: number,
  actionType: string,
  sduiContext: TSduiContext,
): Record<string, string | number | boolean> => {
  if (!item) {
    logSduiError(
      SduiErrorNames.BuildBaseActionParamsMissingItem,
      `Item is nil when sending action for collection ${collectionId}`,
      sduiContext.pageContext,
    );

    return {};
  }

  return {
    [SharedEventMetadata.CollectionId]: collectionId,
    [SharedEventMetadata.CollectionPosition]: collectionPosition,
    [SharedEventMetadata.ContentType]: contentType,
    [SharedEventMetadata.CollectionComponentType]: collectionComponentType,
    [ItemActionMetadata.TotalNumberOfItems]: totalNumberOfItems,
    [ItemActionMetadata.ItemId]: item.id,
    [ItemActionMetadata.ItemPosition]: entryIndex,
    [ItemActionMetadata.PositionInTopic]: entryIndex,
    [ItemActionMetadata.ItemComponentType]: item.itemComponentType,
    [ItemActionMetadata.ActionType]: actionType,
  };
};

export const reportActionAnalytics = (
  actionConfig: TSduiActionConfig,
  analyticsContext: TAnalyticsContext,
  sduiContext: TSduiContext,
  collectionAnalyticsData: TCollectionAnalyticsData | null,
): void => {
  const itemAnalyticsData = buildAndValidateItemAnalyticsData(
    analyticsContext.analyticsData ?? {},
    analyticsContext.ancestorAnalyticsData ?? {},
    undefined,
    sduiContext,
  );

  const resultCollectionAnalyticsData =
    collectionAnalyticsData ??
    (analyticsContext.getCollectionData && analyticsContext.getCollectionData()) ??
    null;

  if (!resultCollectionAnalyticsData) {
    logSduiError(
      SduiErrorNames.ReportItemActionMissingCollectionData,
      `Collection data is missing when sending action ${JSON.stringify(actionConfig)}`,
      sduiContext.pageContext,
    );
  }

  const finalCollectionAnalyticsData = resultCollectionAnalyticsData ?? DUMMY_COLLECTION_DATA;

  const baseParams = buildBaseActionParams(
    itemAnalyticsData,
    itemAnalyticsData.itemPosition,
    finalCollectionAnalyticsData.contentType,
    finalCollectionAnalyticsData.collectionPosition,
    finalCollectionAnalyticsData.collectionId,
    finalCollectionAnalyticsData.collectionComponentType,
    finalCollectionAnalyticsData.totalNumberOfItems,
    actionConfig.actionType,
    sduiContext,
  );

  const params = {
    ...finalCollectionAnalyticsData,
    ...itemAnalyticsData,
    ...filterInvalidEventParams(actionConfig.actionParams, sduiContext.pageContext),
    ...baseParams,
  };

  sendEvent(
    {
      name: EventNames.ItemAction,
      type: EventNames.ItemAction,
      context: getEventContext(sduiContext.pageContext) ?? "unknown",
    },
    parseEventParams({ ...params }),
  );
};

export default reportActionAnalytics;
