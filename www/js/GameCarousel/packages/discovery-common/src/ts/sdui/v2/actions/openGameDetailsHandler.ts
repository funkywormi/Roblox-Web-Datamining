import {
  ActionType,
  SduiErrorName,
  actionTypeName,
  type AnalyticsContext,
  type SduiActionContext,
  type SduiPageContext,
  type UniverseData,
  UNIVERSE_CONTENT_TYPE,
} from "@rbx/sdui-core";

import {
  EventStreamMetadata,
  type TGameDetailReferral,
} from "../../../common/constants/eventStreamConstants";
import { buildGameDetailUrl } from "../../../common/utils/browserUtils";
import { getAppsFlyerReferralParams } from "../../../common/utils/appsFlyerReferralUtils";
import { getAppliedFiltersMetadataForUrlReferral } from "../../../common/utils/appliedFiltersUtils";
import { getGameSetTargetIdMetadata } from "../../../common/utils/gameSetTargetIdUtils";
import { parseMaybeStringNumberField } from "../../utils/analyticsParsingUtils";
import { filterInvalidEventParams } from "../utils/filterInvalidEventParams";
import { findAnalyticsFieldInAncestors } from "../utils/findAnalyticsFieldInAncestors";
import { getCommonReferralParams } from "../utils/getCommonReferralParams";
import { readPlaceId } from "../utils/readPlaceId";
import { readUniverseId } from "../utils/readUniverseId";

const OPEN_GAME_DETAILS_ACTION_TYPE = actionTypeName(ActionType.OPEN_GAME_DETAILS);

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

  return {
    ...getCommonReferralParams(analyticsContext, pageContext),
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
