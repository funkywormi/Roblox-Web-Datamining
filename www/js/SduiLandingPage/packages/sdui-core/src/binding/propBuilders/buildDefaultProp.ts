import { reportBindingError, SduiErrorName } from "../../errors";
import type {
  BindingContext,
  Parser,
  PropBuilder,
  PropBuildOptions,
  PropBuildRequest,
  ResolvedProp,
} from "../../types";
import { isRecord } from "../../utils/typeGuards";
import { PROP_KIND } from "../../types/propKinds";
import {
  generateConditionalPropValue,
  generateDynamicBindingPropValue,
} from "./utils/sduiPropSignalUtils";

/**
 * Builds a `PropBuilder` that re-enters `buildDefaultProp` with the given
 * parser baked in. Forwards whatever `options` arrive on the recursive call
 * as `downstream` so a nested conditional inside an action / nested context
 * keeps that context all the way down.
 */
function makeSelfBranchBuilder(parser?: Parser): PropBuilder {
  return (propType, propValue, request, options) =>
    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- self-branch builder; main fn declared below for readability, hoisted at runtime.
    buildDefaultProp(propType, propValue, request, {
      kind: "default",
      parser,
      downstream: options,
    });
}

/**
 * Default prop builder. Used directly for primitive props (`BoolProp`,
 * `Int32Prop`, …) and as the recursion target for the dedicated wrappers.
 *
 * - `literal`      → `(parser?(value) ?? value, literal)`
 * - `token`        → `(raw token path, literal)` — render-phase resolved (web divergence from lua)
 * - `binding_path` → `(reactive value signal, propSignal)`
 * - `conditional`  → `(signal that picks the matching branch, propSignal)`
 * - anything else  → `failed` (`UnknownPropKind` telemetry)
 *
 * Reads its per-call knobs from the `{ kind: "default" }` variant of
 * `PropBuildOptions`. Other variants are treated as `{ kind: "none" }` for
 * direct-call ergonomics; conditional branches forward whatever options
 * arrived as `downstream` so action/nested context can ride along through
 * a default-prop conditional.
 */
export function buildDefaultProp(
  propType: string,
  propValue: unknown,
  request: PropBuildRequest,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp {
  const ctx: BindingContext = { ...request.ctx, parserName: propType };
  const childRequest: PropBuildRequest = { ...request, ctx };

  const defaultOpts = options.kind === "default" ? options : undefined;
  const parser: Parser | undefined = defaultOpts?.parser;
  const branchBuilder: PropBuilder | undefined = defaultOpts?.branchBuilder;

  switch (propType) {
    case PROP_KIND.LITERAL: {
      const value = parser ? parser(propValue, ctx) : propValue;
      return { value, category: "literal" };
    }

    case PROP_KIND.BINDING_PATH_SNAKE:
    case PROP_KIND.BINDING_PATH: {
      if (typeof propValue !== "string" || !propValue) {
        reportBindingError(
          SduiErrorName.InvalidBindingPath,
          ctx,
          `default prop received non-string bindingPath: ${typeof propValue}`,
          { bindingPath: String(propValue) },
        );
        return { value: undefined, category: "failed", error: "Invalid binding path" };
      }
      return generateDynamicBindingPropValue(propValue, childRequest, parser);
    }

    case PROP_KIND.TOKEN: {
      // Web resolves tokens at render time (Foundation maps the path to a CSS
      // class).
      if (typeof propValue !== "string" || !propValue) {
        reportBindingError(
          SduiErrorName.InvalidTokenPropShape,
          ctx,
          `default prop token path must be a non-empty string; got ${typeof propValue}`,
        );
        return { value: undefined, category: "failed", error: "Invalid token path" };
      }
      return { value: propValue, category: "literal" };
    }

    case PROP_KIND.CONDITIONAL: {
      const conditionalOptions = isRecord(propValue) ? propValue : {};
      // Forward `downstream` from default-options if present; otherwise pass
      // the original `options` through unchanged so non-default kinds (e.g.
      // an opportunistic `{ kind: "action", build }` that arrived here)
      // continue to ride along into the branches.
      const downstream: PropBuildOptions | undefined =
        defaultOpts !== undefined
          ? defaultOpts.downstream
          : options.kind === "none"
            ? undefined
            : options;
      const branchBuilderToUse: PropBuilder = branchBuilder ?? makeSelfBranchBuilder(parser);
      // Branches may resolve to a `SduiComponentConfig` (nested-component
      // conditional). Lua flags this on the resolved `PropSignal` via
      // `isNestedComponentConfig` and the wrapper checks the flag explicitly.
      // Web instead relies on `isSduiConfig` (renderer/typeGuards.ts) to
      // structurally detect configs at render time, preferring the
      // `__sduiKind: "config"` brand set by `buildConfigForComponent`.
      return generateConditionalPropValue(
        conditionalOptions,
        childRequest,
        branchBuilderToUse,
        downstream,
      );
    }

    default: {
      reportBindingError(
        SduiErrorName.UnknownPropKind,
        ctx,
        `unknown propType="${propType}" for default prop builder`,
      );
      return { value: undefined, category: "failed", error: `Unknown propType: ${propType}` };
    }
  }
}
