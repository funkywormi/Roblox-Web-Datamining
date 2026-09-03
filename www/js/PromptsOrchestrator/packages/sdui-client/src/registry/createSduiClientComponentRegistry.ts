import {
  UiComponentType,
  createSduiComponentRegistry,
  type SduiComponentDefinition,
  type SduiComponentRegistry,
} from "@rbx/sdui-core";
import { DEFAULT_CLIENT_COMPONENTS } from "./defaultComponents";

/**
 * Creates a component registry pre-populated with all SDUI components for
 * client-side rendering. Starts from the isomorphic base and adds client-only components on top.
 *
 * Feature teams can pass additional components to register on top of
 * the defaults — these override any existing registration for the same type.
 */
export function createSduiClientComponentRegistry(
  additionalComponents?: Partial<Record<UiComponentType, SduiComponentDefinition>>,
): SduiComponentRegistry {
  const registry = createSduiComponentRegistry();
  registry.registerComponentDefinitions(DEFAULT_CLIENT_COMPONENTS);

  if (additionalComponents) {
    registry.registerComponentDefinitions(additionalComponents);
  }

  return registry;
}
