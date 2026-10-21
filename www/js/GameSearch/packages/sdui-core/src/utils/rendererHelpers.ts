/**
 * Renderer-only helpers used by `SduiRenderer` to decide how to walk a
 * `SduiComponentConfig` tree.
 */
import type React from "react";
import { extractDescriptorName } from "../binding/propBuilders/resolveDescriptorName";
import type { SduiComponentConfig, SduiManagedChildList } from "../types";

import { hasPropSignals } from "./builderHelpers";
import { isOneOf } from "./oneOfHelper";
import { isRecord, isSduiManagedChildList } from "./typeGuards";

/** Prop oneof before or after `normalizeProtoValue`. */
function isProtoPropValueShell(obj: Record<string, unknown>): boolean {
  if ("$typeName" in obj && "kind" in obj && "value" in obj) return true;
  if (extractDescriptorName(obj) === undefined) return false;
  return isOneOf(obj.kind) || isOneOf(obj.oneofProp);
}

/**
 * Skip unresolved proto prop wrappers in `props` — avoids React #31.
 * Nested `TemplateData` (`robloxComponent` + `inputs`) should only reach React via builders.
 */
export function isUnresolvedTemplateData(value: unknown): value is Record<string, unknown> {
  return isRecord(value) && isProtoPropValueShell(value);
}

/**
 * Expands a prop that may be a `SduiManagedChildList` (when `doesManageChildren` is true)
 * or an already-rendered `ReactNode`. Calling `renderItem` for every config is the default
 * eager strategy — client wrappers can call `renderItem` selectively for virtualization.
 */
export function expandManagedList(
  node: React.ReactNode | SduiManagedChildList | undefined,
): React.ReactNode {
  if (node == null) return undefined;
  if (isSduiManagedChildList(node)) {
    return node.configs.map((childConfig, index) =>
      node.renderItem(
        childConfig,
        index,
        childConfig.reactKey ?? childConfig.identifier ?? `${index}`,
      ),
    );
  }
  return node;
}

/**
 * Needs client wrapper + `useSignals()` when reactive props or filter signal exist.
 * Parity: Lua `SduiDataBindingWrapper` when `propSignals` / `isComponentFilteredSignal`.
 */
export function needsInteractiveWrapper(config: SduiComponentConfig): boolean {
  const hasReactiveProps = hasPropSignals(config);
  const hasFilterSignal = config.isComponentFilteredSignal != null;
  return hasReactiveProps || hasFilterSignal;
}
