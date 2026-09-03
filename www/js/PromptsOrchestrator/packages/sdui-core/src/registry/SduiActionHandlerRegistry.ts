import type { ActionType, SduiActionHandlerConfig } from "../types";
import { DEFAULT_ACTION_HANDLERS } from "./defaultActionHandlers";

export interface SduiActionHandlerRegistry {
  registerActionHandler(actionType: ActionType, config: SduiActionHandlerConfig): void;
  registerActionHandlers(configs: Partial<Record<ActionType, SduiActionHandlerConfig>>): void;
  getActionHandler(actionType: ActionType): SduiActionHandlerConfig | undefined;
  hasActionHandler(actionType: ActionType): boolean;
}

/** Seeds the registry from `DEFAULT_ACTION_HANDLERS`. Missing types stay unregistered. */
function buildDefaultActionHandlers(): Map<ActionType, SduiActionHandlerConfig> {
  const handlers = new Map<ActionType, SduiActionHandlerConfig>();
  for (const [typeKey, config] of Object.entries(DEFAULT_ACTION_HANDLERS)) {
    handlers.set(Number(typeKey) as ActionType, config);
  }
  return handlers;
}

/**
 * Action handler registry seeded with the default handlers. Browser-only
 * handlers are wrapped in `clientOnly`, so it's safe to instantiate from SSR.
 * Feature handlers layer on via `registerActionHandlers({ ... })`.
 */
export function createSduiActionHandlerRegistry(): SduiActionHandlerRegistry {
  const handlers = buildDefaultActionHandlers();

  return {
    registerActionHandler(actionType, config) {
      handlers.set(actionType, config);
    },

    registerActionHandlers(configs) {
      for (const [type, config] of Object.entries(configs)) {
        handlers.set(Number(type) as ActionType, config);
      }
    },

    getActionHandler(actionType) {
      return handlers.get(actionType);
    },

    hasActionHandler(actionType) {
      return handlers.has(actionType);
    },
  };
}
