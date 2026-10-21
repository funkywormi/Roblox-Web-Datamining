import { ActionType, clientOnly, type SduiActionHandlerConfig } from "@rbx/sdui-core";
import { openGameDetailsResolveHref } from "./openGameDetailsHandler";
import { openSongDetailsResolveHref } from "./openSongDetailsHandler";
import {
  openChartsSortDetailResolveHref,
  openChartsSortDetailResolveRoutePath,
} from "./openChartsSortDetailHandler";
import { pushSduiRoutePath } from "../navigation/sduiClientRouter";

/**
 * Discovery action-handler contributions.
 * The application composition root owns module selection and replacement policy.
 */
export const DISCOVERY_ACTION_HANDLERS: Partial<Record<ActionType, SduiActionHandlerConfig>> = {
  [ActionType.OPEN_GAME_DETAILS]: {
    resolveHref: openGameDetailsResolveHref,
  },
  [ActionType.OPEN_SONG_DETAIL]: {
    resolveHref: openSongDetailsResolveHref,
  },
  // Sort detail is a route transition wherever it is triggered from, so the
  // in-app push lives here rather than in a per-surface override. Surfaces whose
  // router does not render sort detail fall through to the absolute href.
  [ActionType.OPEN_CHARTS_SORT_DETAIL]: {
    resolveHref: openChartsSortDetailResolveHref,
    clientNavigation: true,
    handler: clientOnly(({ actionParams }, analyticsContext, ctx) => {
      const routePath = openChartsSortDetailResolveRoutePath(actionParams, ctx, analyticsContext);
      if (routePath === undefined) {
        return;
      }

      // Expects the consuming app to register a router via registerSduiClientRouter
      // while its routes can render this path. No registration → document load below.
      if (pushSduiRoutePath(routePath)) {
        return;
      }

      const href = openChartsSortDetailResolveHref(actionParams, ctx, analyticsContext);
      if (href !== undefined) {
        window.location.assign(href);
      }
    }),
  },
};
