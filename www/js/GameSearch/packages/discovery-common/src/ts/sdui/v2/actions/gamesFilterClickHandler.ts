import { sendEvent } from "@rbx/core-scripts/event-stream";
import { buildCustomAnalyticsEventParams } from "@rbx/sdui-common";
import type { SduiActionTelemetryHandler } from "@rbx/sdui-core";
import eventStreamConstants, {
  TGamesFilterButton,
} from "../../../common/constants/eventStreamConstants";
import { buildFilterPillsAnalyticsContextFields } from "../analytics/buildFilterPillsAnalyticsContextFields";
import { filterInvalidEventParams } from "../utils/filterInvalidEventParams";

function isGamesFilterButtonKey(value: unknown): value is keyof typeof TGamesFilterButton {
  return typeof value === "string" && value in TGamesFilterButton;
}

function normalizeFilterButtonName(value: unknown): unknown {
  return isGamesFilterButtonKey(value) ? TGamesFilterButton[value] : value;
}

export const gamesFilterClickTelemetryHandler: SduiActionTelemetryHandler = (
  actionConfig,
  analyticsContext,
  ctx,
): void => {
  const clickParams = buildCustomAnalyticsEventParams(actionConfig.actionParams);
  if (clickParams.buttonName !== undefined) {
    clickParams.buttonName = normalizeFilterButtonName(clickParams.buttonName);
  }

  const fields = filterInvalidEventParams({
    ...buildFilterPillsAnalyticsContextFields(analyticsContext, ctx.pageContext),
    ...clickParams,
  });
  const eventParams = eventStreamConstants.gamesFilterClick(fields);
  if (eventParams) {
    sendEvent(...eventParams);
  }
};
