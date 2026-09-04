import { ActionType, type SduiActionHandlerConfig } from "@rbx/sdui-core";
import { downloadAppActionHandler } from "../actions/downloadAppActionHandler";

export const DEFAULT_CLIENT_ACTION_HANDLERS: Partial<Record<ActionType, SduiActionHandlerConfig>> =
  {
    [ActionType.DOWNLOAD_APP]: downloadAppActionHandler,
  };
