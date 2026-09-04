// TODO: parity with lua — `getLazyComponent` (dynamic import) support.
import type { ComponentType } from "react";
import type { SduiComponentDefinition, UiComponentType } from "../types";
import { createBaseRegistry } from "./createBaseRegistry";

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
  lock(): void;
  isLocked(): boolean;
}

/**
 * Creates an empty component registry. Composition roots register definitions
 * from their selected modules; unregistered types render `null`.
 */
export function createSduiComponentRegistry(): SduiComponentRegistry {
  const registry = createBaseRegistry<UiComponentType, SduiComponentDefinition>({
    lockedMessage: "SDUI component registry is locked",
    parseKey: rawKey => Number(rawKey) as UiComponentType,
  });

  return {
    registerComponentDefinition(componentType, definition) {
      registry.register(componentType, definition);
    },
    registerComponentDefinitions(definitions) {
      registry.registerAll(definitions);
    },
    getComponentDefinition(componentType) {
      return registry.get(componentType);
    },
    hasComponent(componentType) {
      return registry.has(componentType);
    },
    getRegisteredTypes() {
      return registry.keys();
    },
    lock() {
      registry.lock();
    },
    isLocked() {
      return registry.isLocked();
    },
    getComponent(componentType) {
      return registry.get(componentType)?.component;
    },
    doesComponentManageChildren(componentType) {
      return registry.get(componentType)?.doesManageChildren ?? false;
    },
  };
}
