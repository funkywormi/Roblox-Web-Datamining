import { getZeroBasedPosition, type AnalyticsContext, type SduiPageContext } from "@rbx/sdui-core";
import { EventStreamMetadata } from "../../../common/constants/eventStreamConstants";
import type { AnalyticsFieldValue } from "../utils/filterInvalidEventParams";
import { readFilterPillsCollectionContext } from "../utils/readFilterPillsCollectionContext";
import { resolvePageForReferral } from "../utils/pageReferralUtils";

export function readFilterPillsSortPos(analyticsContext: AnalyticsContext | undefined): number {
  return getZeroBasedPosition(
    readFilterPillsCollectionContext(analyticsContext).collectionPosition,
  );
}

export function buildFilterPillsAnalyticsContextFields(
  analyticsContext: AnalyticsContext | undefined,
  pageContext: SduiPageContext,
): Record<string, AnalyticsFieldValue> {
  const { collectionId, gameSetTargetId } = readFilterPillsCollectionContext(analyticsContext);

  return {
    [EventStreamMetadata.GameSetTypeId]: collectionId,
    ...(gameSetTargetId > 0 && {
      [EventStreamMetadata.GameSetTargetId]: gameSetTargetId,
    }),
    [EventStreamMetadata.SortPos]: readFilterPillsSortPos(analyticsContext),
    [EventStreamMetadata.Page]: resolvePageForReferral(pageContext),
  };
}
