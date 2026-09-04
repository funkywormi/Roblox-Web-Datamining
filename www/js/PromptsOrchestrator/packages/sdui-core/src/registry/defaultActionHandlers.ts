import { AUTH_CONTENT_TYPE } from "../binding/stores/contentStores/AuthStore";
import { readParam } from "../actions/readParam";
import type {
  ActionConfig,
  ActionType,
  AnalyticsContext,
  SduiActionContext,
  SduiActionHandlerConfig,
} from "../types";
import { ActionType as ActionTypeEnum } from "../types";
import {
  actionSequenceHandler,
  resolveActionSequenceHref,
} from "./action-definitions/actionSequence";
import { loadMoreFromApiHandler } from "./action-definitions/loadMoreFromApi";
import { refreshFeedEntryFromApiHandler } from "./action-definitions/refreshFeedEntryFromApi";

type ActionHandler = NonNullable<SduiActionHandlerConfig["handler"]>;

/**
 * Wraps `handler` so it no-ops in non-browser environments.
 */
export function clientOnly(handler: ActionHandler): ActionHandler {
  return (
    actionConfig: ActionConfig,
    analyticsContext: AnalyticsContext,
    ctx: SduiActionContext,
  ) => {
    if (typeof window === "undefined") return;
    return handler(actionConfig, analyticsContext, ctx);
  };
}

/**
 * Default action handlers shared by all SDUI pages.
 *
 * Navigation handlers also expose `resolveHref` so the renderer emits
 * `<a href>` for crawlable, right-clickable links; the `handler` runs at
 * click time (e.g. for programmatic navigation after analytics).
 *
 * Browser-dependent handlers are wrapped with `clientOnly()`, so this
 * module is safe to import in SSR. Consumers add page-specific handlers
 * through named registry modules before constructing the service graph.
 */
export const DEFAULT_ACTION_HANDLERS: Partial<Record<ActionType, SduiActionHandlerConfig>> = {
  [ActionTypeEnum.LINK]: {
    resolveHref: params => {
      const url = readParam(params, "url");
      if (!url) return undefined;
      return url;
    },
  },

  [ActionTypeEnum.OPEN_GAME_DETAILS]: {
    resolveHref: params => {
      const placeId = readParam(params, "placeId", "place_id");
      return placeId ? `/games/${placeId}` : undefined;
    },
  },

  [ActionTypeEnum.OPEN_BADGE_DETAILS]: {
    resolveHref: params => {
      const badgeId = readParam(params, "badgeId", "badge_id");
      return badgeId ? `/badges/${badgeId}` : undefined;
    },
  },

  // Pure-navigation: there is no click-time side effect to run, so the
  // `<a href>` produced by `resolveHref` does the entire job.
  [ActionTypeEnum.OPEN_ABUSE_REPORT]: {
    resolveHref: (params, ctx) => {
      const targetId = readParam(params, "targetId", "target_id");
      const abuseVector = readParam(params, "abuseVector", "abuse_vector");
      if (!targetId || !abuseVector) return undefined;

      const searchParams = new URLSearchParams({ targetId, abuseVector });
      // Source the current user from the registered auth store
      const submitterId = ctx.dataBinder.getField(AUTH_CONTENT_TYPE, ["userId"], "").value;
      if (typeof submitterId === "string" && submitterId) {
        searchParams.set("submitterId", submitterId);
      }
      const universeId = readParam(params, "universeId", "universe_id");
      if (universeId) searchParams.set("universeId", universeId);

      return `/report-abuse?${searchParams}`;
    },
  },

  // Play button fires its own telemetry; skip the default ItemAction event to avoid double-counting.
  [ActionTypeEnum.PLAY_BUTTON_CLICK]: {
    skipUnifiedLogging: true,
  },
  [ActionTypeEnum.LOAD_MORE_FROM_API]: {
    handler: clientOnly(loadMoreFromApiHandler),
    skipUnifiedLogging: true,
  },
  [ActionTypeEnum.REFRESH_FEED_ENTRY_FROM_API]: {
    handler: clientOnly(refreshFeedEntryFromApiHandler),
  },

  // Each child action logs independently; the sequence itself has no unified itemAction.
  [ActionTypeEnum.ACTION_SEQUENCE]: {
    handler: clientOnly(actionSequenceHandler),
    skipUnifiedLogging: true,
    resolveHref: resolveActionSequenceHref,
  },
};
