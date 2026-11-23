import type { PropBuildOptions, PropBuildRequest, ResolvedProp } from "../../types";
import { buildLazyNestedComponentListProp } from "./buildLazyNestedComponentListProp";

/**
 * Non-lazy nested component list prop builder. Mirrors lua
 * `buildNestedComponentListProp`.
 *
 * Delegates entirely to `buildLazyNestedComponentListProp` and marks the
 * result `isNestedComponentConfig`, so the renderer pre-renders the configs
 * into elements.
 */
export function buildNestedComponentListProp(
  propType: string,
  propValue: unknown,
  request: PropBuildRequest,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp {
  const result = buildLazyNestedComponentListProp(propType, propValue, request, options);
  if (result.category === "nestedConfig" || result.category === "propSignal") {
    return { ...result, isNestedComponentConfig: true };
  }
  return result;
}
