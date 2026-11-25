import {
  ActionType,
  SduiErrorName,
  actionTypeName,
  findAnalyticsFieldInAncestors,
  getZeroBasedPosition,
  type AnalyticsContext,
  type SduiActionContext,
  type SduiPageContext,
  type UniverseData,
  UNIVERSE_CONTENT_TYPE,
} from "@rbx/sdui-core";

import {
  EventStreamMetadata,
  SessionInfoType,
  type TGameDetailReferral,
} from "../../../common/constants/eventStreamConstants";
import { ANALYTICS_DATA_KEY_SUFFIX } from "../../../common/constants/analyticsConstants";
import { buildGameDetailUrl } from "../../../common/utils/browserUtils";
import { getAppsFlyerReferralParams } from "../../../common/utils/appsFlyerReferralUtils";
import { getAppliedFiltersMetadataForUrlReferral } from "../../../common/utils/appliedFiltersUtils";
import { getGameSetTargetIdMetadata } from "../../../common/utils/gameSetTargetIdUtils";
import { getAbsoluteRowClickData } from "../../../common/utils/parsingUtils";
import { parseMaybeStringNumberField, parseStringField } from "../../utils/analyticsParsingUtils";
import { filterAndStringifyAnalyticsData } from "../../utils/sduiGameImpressionsAnalyticsDataUtils";
import { filterInvalidEventParams } from "../utils/filterInvalidEventParams";
import { getCommonReferralParams } from "../utils/getCommonReferralParams";
import { readPlaceId } from "../utils/readPlaceId";
import { readUniverseId } from "../utils/readUniverseId";

const OPEN_GAME_DETAILS_ACTION_TYPE = actionTypeName(ActionType.OPEN_GAME_DETAILS);

// Standard SDUI / referral keys already carried as dedicated query params or
// internal runtime metadata; excluded from dynamic `*_analyticsData` forwarding
// so only server-provided custom fields (e.g. `sourceSortId`, `newGameEnum`)
// are appended to the referral URL.
const STANDARD_REFERRAL_ANALYTICS_KEYS: ReadonlySet<string> = new Set([
  "id",
  "itemPosition",
  "itemComponentType",
  "componentType",
  "collectionId",
  "collectionPosition",
  "collectionComponentType",
  "contentType",
  "itemsPerRow",
  "totalNumberOfItems",
  "startRowNumber",
  "isWideTiles",
  "feedItemPosition",
  "doesNotAdvanceStartRow",
  "appPage",
  "configKey",
  "hasSponsoredContent",
  "placeId",
  "universeId",
  "adFlag",
  "adId",
  "nativeAdData",
  "heroUnitId",
  "navigationUniverseId",
  "thumbnailAssetId",
  "thumbnailListId",
  "videoThumbnailAssetId",
  "tileBadgeIds",
  "appliedFilters",
  "gameSetTargetId",
  "sortSubId",
  "interactionUuid",
  ...Object.values(SessionInfoType),
]);

function buildForwardedAnalyticsDataParams(
  analyticsContext: AnalyticsContext | undefined,
): Record<string, string> {
  if (!analyticsContext) {
    return {};
  }

  const merged = {
    ...filterAndStringifyAnalyticsData(analyticsContext.getCollectionData?.()),
    ...filterAndStringifyAnalyticsData(
      analyticsContext.getAncestorAnalyticsDataSnapshot?.() ??
        analyticsContext.ancestorAnalyticsData,
    ),
    ...filterAndStringifyAnalyticsData(
      analyticsContext.getAnalyticsDataSnapshot?.() ?? analyticsContext.analyticsData,
    ),
  };

  const result: Record<string, string> = {};
  Object.entries(merged).forEach(([key, value]) => {
    if (!STANDARD_REFERRAL_ANALYTICS_KEYS.has(key) && value !== "") {
      result[`${key}${ANALYTICS_DATA_KEY_SUFFIX}`] = value;
    }
  });
  return result;
}

function readGameUrlNameParts(
  ctx: SduiActionContext,
  universeId: number | undefined,
): { placeName: string; canonicalUrlPath?: string } {
  if (universeId === undefined || universeId <= 0) {
    return { placeName: "" };
  }

  const entity = ctx.dataBinder.getEntity(UNIVERSE_CONTENT_TYPE, String(universeId)).value as
    | UniverseData
    | undefined;

  return {
    placeName: typeof entity?.name === "string" ? entity.name : "",
    canonicalUrlPath:
      typeof entity?.canonicalUrlPath === "string" ? entity.canonicalUrlPath : undefined,
  };
}

/**
 * Section-local cell for row math. `itemPosition` is the canonical pool rank, which keeps counting
 * across pool sections.
 */
function getZeroBasedLayoutPosition(analyticsContext: AnalyticsContext | undefined): number {
  const layoutCellPosition = analyticsContext?.getLayoutCellPosition?.();
  if (layoutCellPosition !== undefined) {
    return getZeroBasedPosition(layoutCellPosition);
  }
  const ownData = analyticsContext?.analyticsData;
  const source = ownData?.itemPosition != null ? ownData : analyticsContext?.ancestorAnalyticsData;
  return getZeroBasedPosition(parseMaybeStringNumberField(source?.itemPosition, -1));
}

function buildGameDetailReferralParams(
  actionParams: Record<string, unknown>,
  analyticsContext: AnalyticsContext | undefined,
  pageContext: SduiPageContext,
): TGameDetailReferral {
  const filteredActionParams = filterInvalidEventParams(actionParams);

  const analyticsPlaceId = parseMaybeStringNumberField(
    filteredActionParams.placeId ??
      filteredActionParams.place_id ??
      findAnalyticsFieldInAncestors("placeId", analyticsContext, -1),
    -1,
  );
  const analyticsUniverseId = parseMaybeStringNumberField(
    filteredActionParams.universeId ??
      filteredActionParams.universe_id ??
      findAnalyticsFieldInAncestors("universeId", analyticsContext, -1),
    -1,
  );

  const collectionAnalyticsData = analyticsContext?.getCollectionData?.();
  const appliedFilters =
    collectionAnalyticsData?.[EventStreamMetadata.AppliedFilters] ||
    findAnalyticsFieldInAncestors(EventStreamMetadata.AppliedFilters, analyticsContext, "");
  const sortSubId = parseStringField(
    collectionAnalyticsData?.[EventStreamMetadata.SortSubId] ??
      findAnalyticsFieldInAncestors(EventStreamMetadata.SortSubId, analyticsContext, ""),
    "",
  );
  const commonParams = getCommonReferralParams(analyticsContext, pageContext);
  const startRowNumber =
    typeof collectionAnalyticsData?.startRowNumber === "number"
      ? collectionAnalyticsData.startRowNumber
      : undefined;
  const itemsPerRow =
    collectionAnalyticsData && collectionAnalyticsData.itemsPerRow > 0
      ? collectionAnalyticsData.itemsPerRow
      : undefined;
  const layoutPosition = getZeroBasedLayoutPosition(analyticsContext);
  const absoluteRowData =
    layoutPosition >= 0 ? getAbsoluteRowClickData(startRowNumber, itemsPerRow, layoutPosition) : {};

  return {
    ...buildForwardedAnalyticsDataParams(analyticsContext),
    ...commonParams,
    ...absoluteRowData,
    ...(sortSubId !== "" && { [EventStreamMetadata.SortSubId]: sortSubId }),
    ...getAppsFlyerReferralParams(),
    [EventStreamMetadata.PlaceId]: analyticsPlaceId,
    [EventStreamMetadata.UniverseId]: analyticsUniverseId,
    ...getGameSetTargetIdMetadata(
      collectionAnalyticsData?.gameSetTargetId ??
        findAnalyticsFieldInAncestors(EventStreamMetadata.GameSetTargetId, analyticsContext, -1),
    ),
    ...getAppliedFiltersMetadataForUrlReferral(appliedFilters),
  };
}

export function openGameDetailsResolveHref(
  actionParams: Record<string, unknown>,
  ctx: SduiActionContext,
  analyticsContext?: AnalyticsContext,
): string | undefined {
  const placeId = readPlaceId(actionParams);
  if (placeId === undefined) {
    ctx.errorReporter.reportSduiError(
      SduiErrorName.MalformedActionParam,
      "Missing or invalid placeId for OPEN_GAME_DETAILS resolveHref",
      ctx.pageContext,
      {
        actionType: OPEN_GAME_DETAILS_ACTION_TYPE,
        propName: "placeId",
      },
    );
    return undefined;
  }

  const referralParams = buildGameDetailReferralParams(
    actionParams,
    analyticsContext,
    ctx.pageContext,
  );

  const universeId = readUniverseId(actionParams, analyticsContext);
  const { placeName, canonicalUrlPath } = readGameUrlNameParts(ctx, universeId);

  return buildGameDetailUrl(placeId, placeName, referralParams, canonicalUrlPath);
}
