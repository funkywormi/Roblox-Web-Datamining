import { UiComponentType } from "../types";

/**
 * Parent `UiComponentType`s that may honor `ComponentList.deferItemBuild`.
 *
 * Web-only safety gate: lua trusts the template flag alone and does not
 * restrict deferral by parent type. Add a type here when a new parent
 * component is ready to consume deferred list shells.
 */
export const DEFERRED_ITEM_BUILD_ALLOWED_COMPONENT_TYPES = [UiComponentType.VERTICAL_FEED] as const;

export type DeferredItemBuildAllowedComponentType =
  (typeof DEFERRED_ITEM_BUILD_ALLOWED_COMPONENT_TYPES)[number];

/** String forms of {@link DEFERRED_ITEM_BUILD_ALLOWED_COMPONENT_TYPES} for `BindingContext.componentType` checks. */
export const DEFERRED_ITEM_BUILD_ALLOWED_COMPONENT_TYPE_SET: ReadonlySet<string> = new Set(
  DEFERRED_ITEM_BUILD_ALLOWED_COMPONENT_TYPES.map(componentType => String(componentType)),
);
