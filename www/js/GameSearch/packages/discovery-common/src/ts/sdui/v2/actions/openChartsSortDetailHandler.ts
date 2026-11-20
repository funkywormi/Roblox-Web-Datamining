import { ActionType, actionTypeName } from "@rbx/sdui-core";

import { readSortIdFromAction } from "../utils/readSortIdFromAction";
import { chartsSortDetailRequest } from "./chartsSortDetailRequest";
import { makeSortDetailResolvers } from "./sortDetailDestination";

const { resolveHref, resolveRoutePath } = makeSortDetailResolvers(
  {
    name: "OPEN_CHARTS_SORT_DETAIL",
    actionType: actionTypeName(ActionType.OPEN_CHARTS_SORT_DETAIL),
    sortIdParamName: "sortId",
    readTarget: actionParams => {
      const sortId = readSortIdFromAction(actionParams);
      if (sortId === undefined) {
        return undefined;
      }
      return {
        sortId,
        gameSetTargetId: actionParams.secondarySortId ?? actionParams.secondary_sort_id,
      };
    },
  },
  chartsSortDetailRequest,
);

export const openChartsSortDetailResolveHref = resolveHref;
export const openChartsSortDetailResolveRoutePath = resolveRoutePath;
