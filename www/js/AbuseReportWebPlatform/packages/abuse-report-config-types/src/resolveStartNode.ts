import type { HydratedConfig, TemplateConfig } from "./configSchemas";
import { resolveConfig } from "./configResolvers";
import type { JsonValue } from "./transformJsonLeafFirst";

/**
 * The flow always starts at this node id when no `startNode` field is present
 * on the config (or when a configured `startNode` resolves to a non-string).
 */
export const DEFAULT_START_NODE_ID = "root";

/**
 * Resolves the optional top-level `startNode` field to a concrete node id.
 *
 * The `startNode` field is itself a resolvable, so it can reference
 * `$attribute` or `$switch`. (`$store` and `$resource` are accepted by the
 * schema but cannot influence the result here: the runtime store is empty
 * before the flow has pushed a node, and resources are intentionally not
 * supplied — both resolve to `undefined` and trigger the fallback below.)
 *
 * Falls back to {@link DEFAULT_START_NODE_ID} (`"root"`) when the field is
 * absent or a literal empty string, or when resolution produces a non-string.
 */
export function resolveStartNode(
  config: HydratedConfig | TemplateConfig,
  attributes: Record<string, JsonValue>,
): string {
  if (!config.startNode) {
    return DEFAULT_START_NODE_ID;
  }

  const resolved = resolveConfig<JsonValue>(config.startNode as JsonValue, {
    store: {},
    attributes,
    resources: {},
  });

  return typeof resolved === "string" ? resolved : DEFAULT_START_NODE_ID;
}
