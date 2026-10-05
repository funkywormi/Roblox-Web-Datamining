import type { AnalyticsContext } from "@rbx/sdui-core";
import { parseMaybeStringNumberField } from "../../utils/analyticsParsingUtils";
import { findAnalyticsFieldInAncestors } from "./findAnalyticsFieldInAncestors";

export type FilterPillsCollectionContext = {
  collectionId: number;
  collectionPosition: number;
  gameSetTargetId: number;
};

export function readFilterPillsCollectionContext(
  analyticsContext: AnalyticsContext | undefined,
): FilterPillsCollectionContext {
  return {
    collectionId: parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors("collectionId", analyticsContext, -1),
      -1,
    ),
    collectionPosition: parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors("collectionPosition", analyticsContext, -1),
      -1,
    ),
    gameSetTargetId: parseMaybeStringNumberField(
      findAnalyticsFieldInAncestors("gameSetTargetId", analyticsContext, -1),
      -1,
    ),
  };
}
