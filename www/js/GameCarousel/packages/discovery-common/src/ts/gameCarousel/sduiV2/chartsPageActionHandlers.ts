import { ActionType, type SduiActionHandlerConfig } from "@rbx/sdui-core";
import { applyChartsFilter } from "./chartsSduiRouter";
import type { ChartsRequestFilters } from "./chartsPageConfiguration";

const readFilterSelections = (
  actionParams: Record<string, unknown>,
): ChartsRequestFilters | undefined => {
  const value = actionParams.filterSelections;
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return undefined;
  }
  return value as ChartsRequestFilters;
};

/** Charts-only handlers. */
export const CHARTS_PAGE_ACTION_HANDLERS: Partial<Record<ActionType, SduiActionHandlerConfig>> = {
  [ActionType.APPLY_CHARTS_FILTER]: {
    skipUnifiedLogging: true,
    handler: ({ actionParams }) => {
      const filterSelections = readFilterSelections(actionParams);
      if (!filterSelections) {
        return;
      }
      applyChartsFilter(filterSelections);
    },
  },
};
