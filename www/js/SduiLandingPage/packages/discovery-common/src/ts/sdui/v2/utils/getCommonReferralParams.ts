import type { AnalyticsContext, SduiPageContext } from "@rbx/sdui-core";

import {
  EventStreamMetadata,
  type TCommonReferralParams,
} from "../../../common/constants/eventStreamConstants";
import {
  parseBooleanField,
  parseMaybeStringNumberField,
  parseStringField,
} from "../../utils/analyticsParsingUtils";
import { findAnalyticsFieldInAncestors } from "./findAnalyticsFieldInAncestors";
import {
  buildSessionAnalyticsData,
  getSessionInfoKey,
  resolvePageForReferral,
  toV1PageContext,
} from "./pageReferralUtils";

export function getCommonReferralParams(
  analyticsContext: AnalyticsContext | undefined,
  pageContext: SduiPageContext,
): TCommonReferralParams {
  const v1PageContext = toV1PageContext(pageContext);

  const isAd = parseBooleanField(
    findAnalyticsFieldInAncestors("adFlag", analyticsContext, false),
    false,
    v1PageContext,
  );
  const adId = parseStringField(findAnalyticsFieldInAncestors("adId", analyticsContext, ""), "");
  const heroUnitId = parseStringField(
    findAnalyticsFieldInAncestors("heroUnitId", analyticsContext, ""),
    "",
  );
  const position = parseMaybeStringNumberField(
    findAnalyticsFieldInAncestors("itemPosition", analyticsContext, -1),
    -1,
  );

  const collectionAnalyticsData = analyticsContext?.getCollectionData?.();

  const sortPosition =
    collectionAnalyticsData?.collectionPosition ??
    parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors("collectionPosition", analyticsContext, -1),
      -1,
    );
  const numberOfLoadedTiles =
    collectionAnalyticsData?.totalNumberOfItems ??
    parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors("totalNumberOfItems", analyticsContext, -1),
      -1,
    );
  const gameSetTypeId =
    collectionAnalyticsData?.collectionId ??
    parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors("collectionId", analyticsContext, -1),
      -1,
    );

  const sessionInfoKey = getSessionInfoKey(pageContext) ?? "";
  const pageSessionInfo = parseStringField(
    findAnalyticsFieldInAncestors(sessionInfoKey, analyticsContext, ""),
    "",
  );

  return {
    [EventStreamMetadata.IsAd]: isAd,
    ...(adId !== "" && {
      [EventStreamMetadata.NativeAdData]: adId,
    }),
    ...(heroUnitId !== "" && {
      [EventStreamMetadata.HeroUnitId]: heroUnitId,
    }),
    [EventStreamMetadata.Position]: position,
    [EventStreamMetadata.SortPos]: sortPosition,
    [EventStreamMetadata.NumberOfLoadedTiles]: numberOfLoadedTiles,
    [EventStreamMetadata.GameSetTypeId]: gameSetTypeId,
    [EventStreamMetadata.Page]: resolvePageForReferral(pageContext),
    ...buildSessionAnalyticsData(pageSessionInfo, pageContext),
  };
}
