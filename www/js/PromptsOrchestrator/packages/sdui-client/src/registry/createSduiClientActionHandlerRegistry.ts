import {
  createSduiActionHandlerRegistry,
  type ActionType,
  type SduiActionHandlerConfig,
  type SduiActionHandlerRegistry,
} from "@rbx/sdui-core";
import { DEFAULT_CLIENT_ACTION_HANDLERS } from "./defaultActionHandlers";

/**
 * Creates an action registry pre-populated with all SDUI action handlers for
 * client-side rendering. Starts from the isomorphic base and adds client-only handlers on top.
 *
 * Feature teams can pass additional handlers to register on top of the
 * defaults — these override any existing registration for the same type.
 */
export function createSduiClientActionHandlerRegistry(
  additionalHandlers?: Partial<Record<ActionType, SduiActionHandlerConfig>>,
): SduiActionHandlerRegistry {
  const registry = createSduiActionHandlerRegistry();
  registry.registerActionHandlers(DEFAULT_CLIENT_ACTION_HANDLERS);

  if (additionalHandlers) {
    registry.registerActionHandlers(additionalHandlers);
  }

  return registry;
}
