import { ActionType, type SduiActionHandlerConfig } from "@rbx/sdui-core";
import { openGameDetailsResolveHref } from "./openGameDetailsHandler";

/**
 * Discovery action-handler contributions.
 * The application composition root owns module selection and replacement policy.
 */
export const DISCOVERY_ACTION_HANDLERS: Partial<Record<ActionType, SduiActionHandlerConfig>> = {
  [ActionType.OPEN_GAME_DETAILS]: {
    resolveHref: openGameDetailsResolveHref,
  },
};
