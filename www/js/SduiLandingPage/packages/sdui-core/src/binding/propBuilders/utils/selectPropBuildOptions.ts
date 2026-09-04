import type { BuildPropContext, PropBuildOptions, PropDescriptorName } from "../../../types";

/**
 * Maps a descriptor to the typed `PropBuildOptions` variant its builder expects.
 * Descriptors needing a context that wasn't supplied fall through to `"none"` —
 * the builder reports a richer error from its own arm.
 *
 * Shared by `SduiBuilder.buildProp` and recursive `request.buildProp` callers
 * (e.g. action params) so nested `ActionProp` / nested-component fields see
 * the same analytics/page context.
 */
export function selectPropBuildOptions(
  descriptorName: PropDescriptorName | undefined,
  buildContext: BuildPropContext | undefined,
): PropBuildOptions {
  if (descriptorName === "ActionProp") {
    return buildContext?.action ? { kind: "action", build: buildContext.action } : { kind: "none" };
  }
  if (
    descriptorName === "NestedComponentProp" ||
    descriptorName === "LazyNestedComponentListProp" ||
    descriptorName === "NestedComponentListProp"
  ) {
    return buildContext?.nested ? { kind: "nested", build: buildContext.nested } : { kind: "none" };
  }
  return { kind: "none" };
}
