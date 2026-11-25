import { ActionType, actionTypeName } from "@rbx/sdui-core";

import type { AnalyticsFieldValue } from "../utils/filterInvalidEventParams";
import { homeSortDetailRequest } from "./homeSortDetailRequest";
import { makeSortDetailResolvers } from "./sortDetailDestination";

function readStringParam(
  actionParams: Record<string, AnalyticsFieldValue>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const raw = actionParams[key];
    if (typeof raw === "string" || typeof raw === "number") {
      const value = String(raw).trim();
      if (value !== "") {
        return value;
      }
    }
  }
  return undefined;
}

// `collectionId` is the topic id. The sort page path is the sort name, so
// `collectionName` wins when the template sends one.
const { resolveHref, resolveRoutePath } = makeSortDetailResolvers(
  {
    name: "OPEN_SEE_ALL",
    actionType: actionTypeName(ActionType.OPEN_SEE_ALL),
    sortIdParamName: "collectionId",
    readTarget: actionParams => {
      const sortId =
        readStringParam(actionParams, "collectionName", "collection_name") ??
        readStringParam(actionParams, "collectionId", "collection_id");
      if (sortId === undefined) {
        return undefined;
      }
      return {
        sortId,
        gameSetTargetId: actionParams.gameSetTargetId ?? actionParams.game_set_target_id,
      };
    },
  },
  homeSortDetailRequest,
);

export const openSeeAllResolveHref = resolveHref;
export const openSeeAllResolveRoutePath = resolveRoutePath;
