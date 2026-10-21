import { DEFERRED_ITEM_BUILD_ALLOWED_COMPONENT_TYPE_SET } from "../../../consts/deferredItemBuild";

/**
 * Whether a component list should emit deferred shells for its entries.
 *
 * Requires both the template opt-in (`deferItemBuild`) and a parent
 * component type listed in {@link DEFERRED_ITEM_BUILD_ALLOWED_COMPONENT_TYPE_SET}.
 */
export function shouldEmitDeferredListItemShells(
  deferItemBuild: boolean | undefined,
  componentType: string | undefined,
): boolean {
  return (
    deferItemBuild === true &&
    componentType !== undefined &&
    DEFERRED_ITEM_BUILD_ALLOWED_COMPONENT_TYPE_SET.has(componentType)
  );
}
