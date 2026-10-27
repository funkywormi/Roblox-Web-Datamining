import {
  asFiniteNumber,
  asString,
  findAnalyticsFieldInAncestors,
  type ActionConfig,
  type AnalyticsContext,
  type SduiActionTelemetryHandler,
} from "@rbx/sdui-core";
import { generateRandomUuid } from "@rbx/core-lib/uuid";
import { parseEventParams } from "@rbx/unified-logging";

const EVENT_NAME = "playerTileClick";
const DEFAULT_EVENT_CONTEXT = "playerSearch";
const DEFAULT_CONTENT_TYPE = "User";

function readField(
  actionConfig: ActionConfig,
  analyticsContext: AnalyticsContext | undefined,
  fieldName: string,
): unknown {
  return findAnalyticsFieldInAncestors(
    fieldName,
    analyticsContext,
    actionConfig.actionParams[fieldName],
  );
}

function asStringIfStringOrFiniteNumber(value: unknown): string | undefined {
  return asString(value, { coerceFiniteNumber: true });
}

export const playerTileClickTelemetryHandler: SduiActionTelemetryHandler = (
  actionConfig,
  analyticsContext,
  ctx,
): void => {
  const profileType = asStringIfStringOrFiniteNumber(
    readField(actionConfig, analyticsContext, "profileType"),
  );
  if (profileType !== undefined && profileType !== "User") {
    return;
  }

  const playerId =
    asStringIfStringOrFiniteNumber(readField(actionConfig, analyticsContext, "playerId")) ??
    asStringIfStringOrFiniteNumber(readField(actionConfig, analyticsContext, "profileId"));
  if (playerId === undefined) {
    return;
  }

  const tilePos =
    asFiniteNumber(readField(actionConfig, analyticsContext, "tilePos")) ??
    asFiniteNumber(readField(actionConfig, analyticsContext, "itemPosition"));
  const collectionData = analyticsContext?.getCollectionData?.();
  const itemsPerRow = collectionData?.itemsPerRow;
  const rawStartRowNumber = collectionData?.startRowNumber;
  const startRowNumber = typeof rawStartRowNumber === "number" ? rawStartRowNumber : undefined;
  const canCalculatePosition =
    tilePos !== undefined && tilePos > 0 && itemsPerRow !== undefined && itemsPerRow > 0;
  const calculatedRowInSort = canCalculatePosition ? Math.ceil(tilePos / itemsPerRow) : undefined;
  const calculatedPositionInRow = canCalculatePosition
    ? ((tilePos - 1) % itemsPerRow) + 1
    : undefined;
  const calculatedFeedRowNumber =
    calculatedRowInSort !== undefined && startRowNumber !== undefined
      ? startRowNumber + calculatedRowInSort - 1
      : undefined;

  const fields = parseEventParams({
    playerId,
    locale: navigator.language,
    pageContext:
      asStringIfStringOrFiniteNumber(readField(actionConfig, analyticsContext, "pageContext")) ??
      ctx.pageContext.appPage,
    actionType: "OpenProfile",
    contentType:
      asStringIfStringOrFiniteNumber(readField(actionConfig, analyticsContext, "contentType")) ??
      DEFAULT_CONTENT_TYPE,
    interactionUuid:
      asStringIfStringOrFiniteNumber(
        readField(actionConfig, analyticsContext, "interactionUuid"),
      ) ?? generateRandomUuid(),
    tilePos,
    userSearchSessionId: asStringIfStringOrFiniteNumber(
      readField(actionConfig, analyticsContext, "userSearchSessionId"),
    ),
    rowInSort:
      asFiniteNumber(readField(actionConfig, analyticsContext, "rowInSort")) ?? calculatedRowInSort,
    positionInRow:
      asFiniteNumber(readField(actionConfig, analyticsContext, "positionInRow")) ??
      calculatedPositionInRow,
    feedRowNumber:
      asFiniteNumber(readField(actionConfig, analyticsContext, "feedRowNumber")) ??
      calculatedFeedRowNumber,
    sortId:
      asStringIfStringOrFiniteNumber(readField(actionConfig, analyticsContext, "collectionId")) ??
      (collectionData === undefined ? undefined : String(collectionData.collectionId)),
    sortPosition:
      asFiniteNumber(readField(actionConfig, analyticsContext, "collectionPosition")) ??
      collectionData?.collectionPosition,
  });

  const eventContext =
    asStringIfStringOrFiniteNumber(readField(actionConfig, analyticsContext, "eventContext")) ??
    DEFAULT_EVENT_CONTEXT;

  ctx.analyticsReporter.logEvent(
    { name: EVENT_NAME, type: EVENT_NAME, context: eventContext },
    fields,
  );
};
