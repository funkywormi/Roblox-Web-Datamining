import type { AnalyticsContext } from "@rbx/sdui-core";

import { parseMaybeStringNumberField } from "../../utils/analyticsParsingUtils";
import { findAnalyticsFieldInAncestors } from "./findAnalyticsFieldInAncestors";

export function readUniverseId(
  actionParams: Record<string, unknown>,
  analyticsContext?: AnalyticsContext,
): number | undefined {
  const rawUniverseId =
    actionParams.universeId ??
    actionParams.universe_id ??
    findAnalyticsFieldInAncestors("universeId", analyticsContext, -1);
  const parsedUniverseId = parseMaybeStringNumberField(
    rawUniverseId as string | number | boolean | undefined,
    -1,
  );

  if (parsedUniverseId !== -1) {
    return parsedUniverseId;
  }

  return undefined;
}
