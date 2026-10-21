import { generateRandomUuid } from "@rbx/core-lib/uuid";
import type { AnalyticsContext, SduiAnalyticsReporter, SduiPageContext } from "@rbx/sdui-core";
import { getLocaleFromDocument } from "@rbx/www-common/intl";

const PLAYER_FRIEND_ADD_EVENT_NAME = "playerFriendAdd";
const DEFAULT_CONTENT_TYPE = "User";
const DEFAULT_EVENT_CONTEXT = "playerSearch";

type TelemetryFieldValue = string | number;
type AnalyticsSnapshot = Record<string, string | number | boolean>;

type ReportPlayerFriendAddOptions = {
  analyticsContext?: AnalyticsContext;
  analyticsReporter: SduiAnalyticsReporter;
  pageContext: SduiPageContext;
  targetUserId: string;
};

function toTelemetryFieldValue(value: unknown): TelemetryFieldValue | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  if (typeof value === "boolean") {
    return String(value);
  }
  return undefined;
}

function readAnalyticsField(
  analyticsData: AnalyticsSnapshot,
  ...fieldNames: string[]
): TelemetryFieldValue | undefined {
  for (const fieldName of fieldNames) {
    const value = toTelemetryFieldValue(analyticsData[fieldName]);
    if (value != null) {
      return value;
    }
  }
  return undefined;
}

function asPositiveNumber(value: unknown): number | undefined {
  const numericValue =
    typeof value === "number" || typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : undefined;
}

function optionalTelemetryField(
  fieldName: string,
  value: TelemetryFieldValue | undefined,
): Record<string, TelemetryFieldValue> {
  return value == null ? {} : { [fieldName]: value };
}

function stringifyTelemetryField(value: TelemetryFieldValue | undefined): string | undefined {
  return value == null ? undefined : String(value);
}

export function reportPlayerFriendAdd({
  analyticsContext,
  analyticsReporter,
  pageContext,
  targetUserId,
}: ReportPlayerFriendAddOptions): void {
  const analyticsData: AnalyticsSnapshot = analyticsContext
    ? {
        ...analyticsContext.getAncestorAnalyticsDataSnapshot(),
        ...analyticsContext.getAnalyticsDataSnapshot(),
      }
    : {};
  const collectionData = analyticsContext?.getCollectionData?.();
  const tilePosition = readAnalyticsField(analyticsData, "tilePos", "itemPosition");
  const numericTilePosition = asPositiveNumber(tilePosition);
  const itemsPerRow = asPositiveNumber(collectionData?.itemsPerRow);
  const rowInCollection =
    numericTilePosition != null && itemsPerRow != null
      ? Math.ceil(numericTilePosition / itemsPerRow)
      : undefined;
  const positionInRow =
    numericTilePosition != null && itemsPerRow != null
      ? ((numericTilePosition - 1) % itemsPerRow) + 1
      : undefined;
  const collectionStartRow = asPositiveNumber(collectionData?.startRowNumber);
  const feedRowNumber =
    collectionStartRow != null && rowInCollection != null
      ? collectionStartRow + rowInCollection - 1
      : undefined;
  const eventContext = readAnalyticsField(analyticsData, "eventContext") ?? DEFAULT_EVENT_CONTEXT;
  const contentType =
    readAnalyticsField(analyticsData, "contentType") ??
    toTelemetryFieldValue(collectionData?.contentType) ??
    DEFAULT_CONTENT_TYPE;
  const fields: Record<string, TelemetryFieldValue> = {
    actionType: "RequestFriendship",
    contentType,
    eventContext,
    interactionUuid: generateRandomUuid(),
    playerId: targetUserId,
    ...optionalTelemetryField("tilePos", tilePosition),
    ...optionalTelemetryField(
      "pageContext",
      readAnalyticsField(analyticsData, "pageContext") ?? pageContext.appPage,
    ),
    ...optionalTelemetryField(
      "userSearchSessionId",
      stringifyTelemetryField(readAnalyticsField(analyticsData, "userSearchSessionId")),
    ),
    ...optionalTelemetryField(
      "feedRowNumber",
      readAnalyticsField(analyticsData, "feedRowNumber") ?? feedRowNumber,
    ),
    ...optionalTelemetryField(
      "positionInRow",
      readAnalyticsField(analyticsData, "positionInRow") ?? positionInRow,
    ),
    ...optionalTelemetryField(
      "rowInSort",
      readAnalyticsField(analyticsData, "rowInSort") ?? rowInCollection,
    ),
    ...optionalTelemetryField(
      "sortId",
      stringifyTelemetryField(
        readAnalyticsField(analyticsData, "collectionId") ??
          toTelemetryFieldValue(collectionData?.collectionId),
      ),
    ),
    ...optionalTelemetryField(
      "sortPosition",
      readAnalyticsField(analyticsData, "collectionPosition") ??
        toTelemetryFieldValue(collectionData?.collectionPosition),
    ),
    locale: getLocaleFromDocument(),
  };

  analyticsReporter.logEvent(
    {
      name: PLAYER_FRIEND_ADD_EVENT_NAME,
      type: PLAYER_FRIEND_ADD_EVENT_NAME,
      context: String(eventContext),
    },
    fields,
  );
}
