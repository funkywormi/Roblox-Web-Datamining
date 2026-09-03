// TODO: parity with lua — `getLazyComponent` (dynamic import) support.
import type { ComponentType } from "react";
import type { SduiComponentDefinition, UiComponentType } from "../types";
import { DEFAULT_COMPONENTS } from "./defaultComponents";

export interface SduiComponentRegistry {
  registerComponentDefinition(
    componentType: UiComponentType,
    definition: SduiComponentDefinition,
  ): void;
  registerComponentDefinitions(
    definitions: Partial<Record<UiComponentType, SduiComponentDefinition>>,
  ): void;
  getComponent(componentType: UiComponentType): ComponentType<Record<string, unknown>> | undefined;
  getComponentDefinition(componentType: UiComponentType): SduiComponentDefinition | undefined;
  doesComponentManageChildren(componentType: UiComponentType): boolean;
  hasComponent(componentType: UiComponentType): boolean;
  getRegisteredTypes(): UiComponentType[];
}

/** Seeds the registry from `DEFAULT_COMPONENTS`. Missing types stay unregistered. */
function buildDefaultComponentDefinitions(): Map<UiComponentType, SduiComponentDefinition> {
  const definitions = new Map<UiComponentType, SduiComponentDefinition>();
  for (const [typeKey, definition] of Object.entries(DEFAULT_COMPONENTS)) {
    definitions.set(Number(typeKey) as UiComponentType, definition);
  }
  return definitions;
}

/**
 * Component registry seeded with the SSR-safe default leaf components.
 * Client/server packages override entries with their environment-specific
 * implementations; unregistered types render `null`.
 */
export function createSduiComponentRegistry(): SduiComponentRegistry {
  const definitions = buildDefaultComponentDefinitions();

  return {
    registerComponentDefinition(componentType, definition) {
      definitions.set(componentType, definition);
    },

    registerComponentDefinitions(overrides) {
      for (const [typeKey, definition] of Object.entries(overrides)) {
        definitions.set(Number(typeKey) as UiComponentType, definition);
      }
    },

    getComponentDefinition(componentType) {
      return definitions.get(componentType);
    },

    doesComponentManageChildren(componentType) {
      return definitions.get(componentType)?.doesManageChildren ?? false;
    },

    getComponent(componentType) {
      return definitions.get(componentType)?.component;
    },

    hasComponent(componentType) {
      return definitions.has(componentType);
    },

    getRegisteredTypes() {
      return [...definitions.keys()];
    },
  };
}
