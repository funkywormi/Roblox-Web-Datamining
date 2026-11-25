import { ActionType, type SduiActionHandlerConfig } from "@rbx/sdui-core";
import { downloadAppActionHandler } from "../actions/downloadAppActionHandler";
import {
  openMarketplaceTryOnResolveHref,
  openMarketplaceTryOnTelemetryHandler,
} from "../actions/openMarketplaceTryOnHandler";
import { openProfileResolveHref } from "../actions/openProfileHandler";

export const DEFAULT_CLIENT_ACTION_HANDLERS: Partial<Record<ActionType, SduiActionHandlerConfig>> =
  {
    [ActionType.DOWNLOAD_APP]: downloadAppActionHandler,
    [ActionType.OPEN_MARKETPLACE_TRY_ON]: {
      resolveHref: openMarketplaceTryOnResolveHref,
      telemetryHandler: openMarketplaceTryOnTelemetryHandler,
      skipUnifiedLogging: false,
    },
    [ActionType.OPEN_PROFILE]: {
      resolveHref: openProfileResolveHref,
      skipUnifiedLogging: false,
    },
  };
