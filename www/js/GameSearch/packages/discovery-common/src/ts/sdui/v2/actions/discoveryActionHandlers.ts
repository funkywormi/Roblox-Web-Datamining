import { ActionType, clientOnly, type SduiActionHandlerConfig } from "@rbx/sdui-core";
import { openGameDetailsResolveHref } from "./openGameDetailsHandler";
import { openSongDetailsResolveHref } from "./openSongDetailsHandler";
import {
  openChartsSortDetailResolveHref,
  openChartsSortDetailResolveRoutePath,
} from "./openChartsSortDetailHandler";
import { openSeeAllResolveHref, openSeeAllResolveRoutePath } from "./openSeeAllHandler";
import { type SortDetailResolver } from "./sortDetailDestination";
import { pushSduiRoutePath } from "../navigation/sduiClientRouter";

// Sort detail is a route transition wherever it is triggered from, so the
// in-app push lives here rather than in a per-surface override. Surfaces whose
// router does not render sort detail fall through to the absolute href.
function sortDetailHandler(
  resolveHref: SortDetailResolver,
  resolveRoutePath: SortDetailResolver,
): SduiActionHandlerConfig {
  return {
    resolveHref,
    clientNavigation: true,
    handler: clientOnly(({ actionParams }, analyticsContext, ctx) => {
      const routePath = resolveRoutePath(actionParams, ctx, analyticsContext);
      if (routePath === undefined) {
        return;
      }

      // Expects the consuming app to register a router via registerSduiClientRouter
      // while its routes can render this path. No registration → document load below.
      if (pushSduiRoutePath(routePath)) {
        return;
      }

      const href = resolveHref(actionParams, ctx, analyticsContext);
      if (href !== undefined) {
        window.location.assign(href);
      }
    }),
  };
}

/**
 * Discovery action-handler contributions.
 * The application composition root owns module selection and replacement policy.
 */
export const DISCOVERY_ACTION_HANDLERS: Partial<Record<ActionType, SduiActionHandlerConfig>> = {
  [ActionType.OPEN_GAME_DETAILS]: {
    resolveHref: openGameDetailsResolveHref,
  },
  [ActionType.OPEN_SEE_ALL]: sortDetailHandler(openSeeAllResolveHref, openSeeAllResolveRoutePath),
  [ActionType.OPEN_SONG_DETAIL]: {
    resolveHref: openSongDetailsResolveHref,
  },
  [ActionType.OPEN_CHARTS_SORT_DETAIL]: sortDetailHandler(
    openChartsSortDetailResolveHref,
    openChartsSortDetailResolveRoutePath,
  ),
};
