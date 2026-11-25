import type { PropBuildOptions, PropBuildRequest, ResolvedProp } from "../../types";
import { buildNestedComponentProp } from "./buildNestedComponentProp";

/**
 * Lazy variant of `buildNestedComponentProp`. Mirrors lua
 * `buildLazyNestedComponentProp`.
 *
 * Delegates with `isLazy = true`, so neither the literal nor the conditional
 * result carries `isNestedComponentConfig`. The renderer then passes the raw
 * config to the parent as an `SduiManagedChildList` instead of rendering it.
 *
 * Used when the parent needs control over when and how the child renders,
 * e.g. a game tile passing `extraLocalProps` to its video player.
 */
export function buildLazyNestedComponentProp(
  propType: string,
  propValue: unknown,
  request: PropBuildRequest,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp {
  return buildNestedComponentProp(propType, propValue, request, options, true);
}
