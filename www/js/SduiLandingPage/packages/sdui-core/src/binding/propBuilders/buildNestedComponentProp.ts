import { computed } from "@preact/signals-core";
import type {
  BindingContext,
  NestedComponentBuildContext,
  PropBuildOptions,
  PropBuildRequest,
  ResolvedProp,
} from "../../types";
import { reportFailedToParse, reportInvalidConfig, stringifyError } from "../../errors";
import { isRecord, type RecordOf } from "../../utils/typeGuards";
import { generateConditionalPropValue } from "./utils/sduiPropSignalUtils";
import { resolveInputDefs } from "./utils/resolveInputs";
import { resolveTemplate } from "./utils/resolveTemplate";
import { PROP_KIND } from "../../types/propKinds";

/**
 * Resolves a `NestedComponentProp` into a nested `SduiComponentConfig`.
 *
 * - `literal` → nestedConfig
 * - `conditional` → propSignal via `generateConditionalPropValue`
 *
 * `templateData` is one of:
 *   - `inlineComponent` (post-normalize `UiComponentSchema`): used as the
 *     template directly, with shared-scope semantics — the parent's
 *     `dataSources` are forwarded and `templateData.inputs` is ignored.
 *   - `robloxComponent` (string): looked up via `templateStore`, with the
 *     child building its own isolated scope from `templateData.inputs`.
 *
 * If both are set, `inlineComponent` wins (matches the precedence rule in
 * `ui_component_schema.proto`). Mirrors lua `buildNestedComponentProp`.
 *
 * The per-build wiring (template store, builder, builder config) arrives
 * through the `{ kind: "nested" }` variant of `PropBuildOptions`; any other
 * variant is surfaced as a missing-context error.
 */
export function buildNestedComponentProp(
  propType: string,
  propValue: unknown,
  request: PropBuildRequest,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp {
  const bindingContext: BindingContext = { ...request.ctx, parserName: propType };
  const childRequest: PropBuildRequest = { ...request, ctx: bindingContext };
  const nestedBuildContext: NestedComponentBuildContext | undefined =
    options.kind === "nested" ? options.build : undefined;

  if (propType === PROP_KIND.CONDITIONAL) {
    const conditionalPayload: RecordOf = isRecord(propValue) ? propValue : {};
    return generateConditionalPropValue(
      conditionalPayload,
      childRequest,
      buildNestedComponentProp,
      // Forward our typed options so each branch keeps the nested build wiring.
      options,
    );
  }

  if (propType !== PROP_KIND.LITERAL || !nestedBuildContext) {
    reportInvalidConfig(
      bindingContext,
      `nested component prop got propType="${propType}" without ${
        nestedBuildContext ? "literal" : "build context"
      }`,
    );
    return { value: undefined, category: "failed", error: "Invalid nested component prop" };
  }

  if (!isRecord(propValue)) {
    reportInvalidConfig(
      bindingContext,
      `nested component prop expected object payload; got ${typeof propValue}`,
    );
    return { value: undefined, category: "failed", error: "No template data" };
  }

  const templateData = propValue;
  const robloxComponent =
    typeof templateData.robloxComponent === "string" ? templateData.robloxComponent : "";
  const inlineComponentSchema = isRecord(templateData.inlineComponent)
    ? templateData.inlineComponent
    : undefined;

  const resolved = resolveTemplate(
    inlineComponentSchema,
    robloxComponent,
    bindingContext,
    nestedBuildContext.templateStore,
  );
  if (!resolved) {
    return {
      value: undefined,
      category: "failed",
      error: inlineComponentSchema
        ? "Invalid inline component schema"
        : `Template not found: ${robloxComponent}`,
    };
  }

  const { template, isInline } = resolved;

  // Inline shared-scope: forward the parent's input data, `dataSources`,
  // and analytics context (Lua `buildNestedComponentProp` parity). The
  // analytics parent is how nested collections inherit feed
  // `collectionPosition`. `templateData.inputs` and the inline schema's
  // own `shared.data` are intentionally ignored. Use `robloxComponent`
  // when an isolated scope is required.
  if (isInline) {
    const parentInputDataSignal = computed(() => request.dataSources.value.inputData);
    const nestedConfig = nestedBuildContext.builder.buildConfigForComponent(
      template,
      parentInputDataSignal,
      nestedBuildContext.builderConfig,
      nestedBuildContext.parentAnalyticsContext,
      request.dataSources,
    );
    return nestedConfig
      ? { value: nestedConfig, category: "nestedConfig" }
      : { value: undefined, category: "failed", error: "Failed to build inline nested config" };
  }

  // Isolated scope: resolve `templateData.inputs` inside a `computed` so
  // binding-path inputs re-evaluate when the parent's sources change. The
  // child's `dataBindingSourcesSignal` consumes this signal and re-resolves
  // entity IDs reactively. Matches lua's `createComputed(inputDataSlice)`.
  //
  // Lua wraps `buildInputsForNestedComponent` in `pcall` and logs
  // `FailedToParseProp` so a bad input def does not tear down the render —
  // match that defensive behavior.
  const inputDefs: RecordOf = isRecord(templateData.inputs) ? templateData.inputs : {};
  const inputDataSignal = computed(() => {
    try {
      return resolveInputDefs(inputDefs, { ...request, ctx: bindingContext });
    } catch (err) {
      reportFailedToParse(
        bindingContext,
        `failed to build inputs for nested component: ${stringifyError(err)}`,
      );
      return {};
    }
  });

  const nestedConfig = nestedBuildContext.builder.buildConfigForComponent(
    template,
    inputDataSignal,
    nestedBuildContext.builderConfig,
    nestedBuildContext.parentAnalyticsContext,
  );
  return nestedConfig
    ? { value: nestedConfig, category: "nestedConfig" }
    : { value: undefined, category: "failed", error: "Failed to build nested config" };
}
