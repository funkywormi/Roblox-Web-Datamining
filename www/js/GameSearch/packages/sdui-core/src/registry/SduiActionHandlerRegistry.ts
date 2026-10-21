import type { ActionType, SduiActionHandlerConfig } from "../types";
import { createBaseRegistry } from "./createBaseRegistry";

export interface SduiActionHandlerRegistry {
  registerActionHandler(actionType: ActionType, config: SduiActionHandlerConfig): void;
  registerActionHandlers(configs: Partial<Record<ActionType, SduiActionHandlerConfig>>): void;
  getActionHandler(actionType: ActionType): SduiActionHandlerConfig | undefined;
  hasActionHandler(actionType: ActionType): boolean;
  lock(): void;
  isLocked(): boolean;
}

/**
 * Creates an empty action-handler registry. Composition roots register
 * definitions from their selected modules.
 */
export function createSduiActionHandlerRegistry(): SduiActionHandlerRegistry {
  const registry = createBaseRegistry<ActionType, SduiActionHandlerConfig>({
    lockedMessage: "SDUI action handler registry is locked",
    parseKey: rawKey => Number(rawKey) as ActionType,
  });

  return {
    registerActionHandler(actionType, config) {
      registry.register(actionType, config);
    },
    registerActionHandlers(configs) {
      registry.registerAll(configs);
    },
    getActionHandler(actionType) {
      return registry.get(actionType);
    },
    hasActionHandler(actionType) {
      return registry.has(actionType);
    },
    lock() {
      registry.lock();
    },
    isLocked() {
      return registry.isLocked();
    },
  };
}
