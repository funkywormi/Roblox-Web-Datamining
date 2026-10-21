import { reportBindingError, SduiErrorName } from "../../errors";
import type {
  BindingContext,
  Parser,
  PropBuilder,
  PropBuildOptions,
  PropBuildRequest,
  ResolvedProp,
  TranslationRef,
} from "../../types";
import { camelToSnake } from "../../utils/caseConversion";
import { isRecord } from "../../utils/typeGuards";

import { resolveLocalizedLiteral } from "../localizedLiterals";
import { unwrapOneOf } from "../../utils/oneOfHelper";
import { PROP_KIND } from "../../types/propKinds";
import { resolveBindingPath } from "../SduiDataBinder";
import { buildDefaultProp } from "./buildDefaultProp";
import { resolveFormatter } from "./utils/resolveFormatter";
import {
  generateConditionalPropValue,
  generateFormatStringPropValue,
  type StatusCollector,
} from "./utils/sduiPropSignalUtils";

/**
 * Re-enters `buildStringProp` with the active parser so every conditional
 * branch keeps the registered parser. Mirrors `makeSelfBranchBuilder` in
 * `buildDefaultProp.ts`.
 *
 * Web/Lua note: lua keeps a 6-arg signature here because Luau lacks
 * discriminated unions. Web threads parser via the typed
 * `{ kind: "string", parser }` variant of `PropBuildOptions`.
 */
function makeStringBranchBuilder(parser?: Parser): PropBuilder {
  return (propType, propValue, request) =>
    // eslint-disable-next-line @typescript-eslint/no-use-before-define -- self-branch builder; main fn declared below for readability, hoisted at runtime.
    buildStringProp(propType, propValue, request, { kind: "string", parser });
}

/**
 * Stringifies an unknown value for placement inside a format-arg substitution.
 * Returns `""` for nullish, non-primitive (object/function), or symbol values
 * to avoid leaking `"[object Object]"`-style fallbacks into rendered text.
 * Primitives flow through `String()` and match lua's `tostring` semantics.
 */
function safeToString(value: unknown): string {
  if (value === undefined || value === null) return "";
  const valueType = typeof value;
  if (valueType === "object" || valueType === "function" || valueType === "symbol") {
    return "";
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- narrowed to primitives above.
  return String(value);
}

/**
 * Default parser applied when no explicit parser is registered.
 * Mirrors lua's `SduiClientBindingParsers.parseToString`: `nil`/non-primitive
 * inputs pass through as `undefined` (so the prop reports an unset value
 * rather than the literal string `"undefined"` or `"[object Object]"`);
 * primitives are stringified via `String()`.
 */
function parseToString(value: unknown, _ctx: BindingContext): string | undefined {
  if (value === undefined || value === null) return undefined;
  const valueType = typeof value;
  if (valueType === "object" || valueType === "function" || valueType === "symbol") {
    return undefined;
  }
  // eslint-disable-next-line @typescript-eslint/no-base-to-string -- narrowed to primitives above.
  return String(value);
}

/**
 * Resolves a single `FormatArg` to its string substitution. Reads the inner
 * `kind` (literal or binding-path) for the raw value, then optionally runs it
 * through the sibling `formatter` (number abbreviation, date formatting, …).
 * On formatter failure, falls through to the stringified raw value so the
 * surrounding format template still renders.
 *
 * When `statusCollector` is provided, every binding-path arg appends its
 * `DataStatus` so the caller can roll up a single status across all
 * substituted values.
 */
function resolveFormatArg(
  arg: unknown,
  request: PropBuildRequest,
  statusCollector?: StatusCollector,
): string {
  const inner = unwrapOneOf(arg);
  if (!inner) return "";

  const { dataSources, dataBinder, ctx } = request;

  let rawValue: unknown;
  switch (inner.propType) {
    case PROP_KIND.LITERAL:
      rawValue = inner.propValue;
      break;
    case PROP_KIND.BINDING_PATH_SNAKE:
    case PROP_KIND.BINDING_PATH: {
      if (typeof inner.propValue !== "string") {
        reportBindingError(
          SduiErrorName.InvalidStringFormatProp,
          ctx,
          `format arg bindingPath must be string; got ${typeof inner.propValue}`,
          { bindingPath: safeToString(inner.propValue) },
        );
        return "";
      }
      const read = resolveBindingPath(inner.propValue, dataSources, dataBinder, ctx);
      statusCollector?.push(read.status);
      rawValue = read.value;
      break;
    }
    default:
      return "";
  }

  // `formatter` is a sibling on the parent FormatArg message — it lives
  // alongside the `kind` oneOf, not inside it — so we read it off the
  // original record rather than the unwrapped inner result.
  const formatter = isRecord(arg) ? arg.formatter : undefined;
  if (formatter !== undefined && formatter !== null) {
    const formatted = resolveFormatter(rawValue, formatter, ctx);
    if (formatted !== undefined) return formatted;
  }

  return safeToString(rawValue);
}

/**
 * Resolves a `StringFormat` body to a single string. Walks `args` and replaces
 * each `{key}` placeholder (and its snake_case alias) with the formatted arg.
 *
 * Web-only extension: when `str` is empty and `translation` is set, the
 * translated string is used as the format template before substitution.
 * Lua honors `str` only.
 */
export function resolveStringFormat(
  format: Record<string, unknown>,
  request: PropBuildRequest,
  statusCollector?: StatusCollector,
): string {
  const { dataBinder, ctx } = request;
  let result = typeof format.str === "string" ? format.str : "";
  if (result === "" && isRecord(format.translation)) {
    result =
      resolveLocalizedLiteral(format.translation as Partial<TranslationRef>, dataBinder, ctx) ?? "";
  }

  const rawArgs = format.args;
  if (!isRecord(rawArgs)) {
    if (rawArgs !== undefined && rawArgs !== null) {
      reportBindingError(
        SduiErrorName.InvalidStringFormatProp,
        ctx,
        `format.args must be an object; got ${typeof rawArgs}`,
      );
    }
    return result;
  }

  for (const [key, arg] of Object.entries(rawArgs)) {
    const replacement = resolveFormatArg(arg, request, statusCollector);
    result = result.replace(`{${key}}`, replacement);
    const snakeKey = camelToSnake(key);
    if (snakeKey !== key) {
      result = result.replace(`{${snakeKey}}`, replacement);
    }
  }
  return result;
}

/**
 * String prop builder. Mirrors lua `buildStringProp.lua`:
 * - `format` → reactive format-string signal
 * - `conditional` → reactive branch-selection signal that recurses back into
 *   `buildStringProp` so each branch keeps the active parser
 * - `translation` → eagerly-resolved literal via `resolveLocalizedLiteral`
 * - everything else → delegate to `buildDefaultProp`
 *
 * The active parser (`options.parser ?? parseToString`) is threaded into every
 * branch so each terminal value is run through it exactly once — matching
 * lua's `effectiveParser = propParser or parseToString` plus
 * `buildDefaultProp(..., effectiveParser, buildStringProp)`. A parser-less
 * `StringProp` therefore always emits stringified primitives by default.
 *
 * Reads its parser from the `{ kind: "string" }` variant of
 * `PropBuildOptions`. Other variants are treated as `{ kind: "string" }`
 * with no parser.
 */
export function buildStringProp(
  propType: string,
  propValue: unknown,
  request: PropBuildRequest,
  options: PropBuildOptions = { kind: "none" },
): ResolvedProp {
  const { ctx, dataBinder } = request;
  const stringOpts = options.kind === "string" ? options : undefined;
  const parser = stringOpts?.parser;
  const effectiveParser = parser ?? parseToString;
  const branchBuilder = makeStringBranchBuilder(parser);

  if (propType === PROP_KIND.FORMAT) {
    let formatBody: Record<string, unknown> = {};
    if (isRecord(propValue)) {
      formatBody = propValue;
    } else {
      reportBindingError(
        SduiErrorName.InvalidStringFormatProp,
        ctx,
        `format prop expected an object body; got ${typeof propValue}`,
      );
    }
    return generateFormatStringPropValue(formatBody, request, resolveStringFormat, effectiveParser);
  }

  if (propType === PROP_KIND.CONDITIONAL) {
    const conditionalBody = isRecord(propValue) ? propValue : {};
    return generateConditionalPropValue(conditionalBody, request, branchBuilder);
  }

  if (propType === PROP_KIND.TRANSLATION) {
    const translationRef = isRecord(propValue) ? (propValue as Partial<TranslationRef>) : undefined;
    const resolved = resolveLocalizedLiteral(translationRef, dataBinder, ctx);
    if (resolved === undefined) {
      return {
        value: undefined,
        category: "failed",
        error: "Failed to resolve translation",
      };
    }
    // `?? resolved` keeps the prop populated if a custom parser returns
    // `undefined`; `parseToString(string)` always returns the input as-is.
    return { value: effectiveParser(resolved, ctx) ?? resolved, category: "literal" };
  }

  // For literal / binding_path: forward `effectiveParser` (so literals are
  // coerced inside `buildDefaultProp`'s literal handler and binding-path reads
  // apply it at signal-read time) and the self-branch builder (so any nested
  // conditional re-enters `buildStringProp`, preserving format/translation
  // semantics).
  return buildDefaultProp(propType, propValue, request, {
    kind: "default",
    parser: effectiveParser,
    branchBuilder,
  });
}
