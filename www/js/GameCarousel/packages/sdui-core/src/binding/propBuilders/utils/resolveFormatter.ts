/**
 * `StringFormat.FormatArg.formatter` resolver — applies a typed formatter
 * (`NUMBER_ABBREVIATE`, `NUMBER_LOCALIZE`, `DATE_FORMAT`) to a resolved arg
 * value before placeholder substitution.
 *
 * TODO (SSR): inject an explicit locale from context (e.g. request locale)
 * into `dayjs.locale(...)` and `Intl.NumberFormat` once sdui-core has a
 * locale provider — otherwise server renders use ambient defaults and can
 * mismatch hydrated client output.
 */
import dayjs from "dayjs";
import localizedFormat from "dayjs/plugin/localizedFormat.js";
import {
  StringFormat_FormatArg_Formatter_Type as formatterTypeEnum,
  type StringFormat_FormatArg_Formatter_Type as FormatterType,
} from "@rbx/service-contracts-proto/roblox/apppageplatform/shared/v1beta1/prop_types_pb.js";

import { reportFailedToParse } from "../../../errors";
import type { BindingContext } from "../../../types";
import { isRecord } from "../../../utils/typeGuards";

// eslint-disable-next-line import-x/no-named-as-default-member -- localizedFormat plugin attaches via `.extend`
dayjs.extend(localizedFormat);

type ValidFormatterType = Exclude<FormatterType, FormatterType.INVALID>;

/** Wire discriminators for supported formatter kinds — values match `formatterTypeEnum` / proto `Formatter.Type`. */
const SUPPORTED_FORMATTER_TYPE_VALUES: ReadonlySet<number> = new Set<number>([
  formatterTypeEnum.NUMBER_ABBREVIATE,
  formatterTypeEnum.NUMBER_LOCALIZE,
  formatterTypeEnum.DATE_FORMAT,
]);

function isSupportedFormatterType(n: number): n is ValidFormatterType {
  return SUPPORTED_FORMATTER_TYPE_VALUES.has(n);
}

/** Lua's `DEFAULT_DATE_FORMAT_PATTERN` — locale-aware numeric date (e.g. 09/04/1986). */
const DEFAULT_DATE_PATTERN = "L";

/** Non-`INVALID` members only — labels align with generated tsEnum names. */
const FORMATTER_TYPE_LABELS = {
  [formatterTypeEnum.NUMBER_ABBREVIATE]: "NUMBER_ABBREVIATE",
  [formatterTypeEnum.NUMBER_LOCALIZE]: "NUMBER_LOCALIZE",
  [formatterTypeEnum.DATE_FORMAT]: "DATE_FORMAT",
} as const satisfies Record<ValidFormatterType, string>;

/**
 * Coerce to a finite number. Accepts numbers and numeric strings — proto
 * JSON serializes int64 as strings, and binding paths often return strings.
 */
function coerceNumber(value: unknown): number | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string" && value.length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

/**
 * Coerce to a `Date` for `TYPE_DATE_FORMAT`. Accepts:
 * - unix seconds (number or numeric string)
 * - ISO 8601 strings (incl. .NET-style fractional seconds like `2026-04-13T22:20:23.2930000Z`)
 * - `{ seconds: <number | numeric string | ISO string> }` (proto `Timestamp` shape)
 */
function coerceDate(value: unknown): Date | undefined {
  if (typeof value === "number") {
    return Number.isFinite(value) ? new Date(value * 1000) : undefined;
  }
  if (typeof value === "string" && value.length > 0) {
    const unixSeconds = Number(value);
    if (Number.isFinite(unixSeconds)) {
      return new Date(unixSeconds * 1000);
    }
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  if (isRecord(value) && "seconds" in value) {
    return coerceDate(value.seconds);
  }
  return undefined;
}

/**
 * Reads `dateConfig.pattern` off a normalized `Formatter.config` oneof —
 * `{ kind: "dateConfig", value: { pattern } }`. Returns `DEFAULT_DATE_PATTERN`
 * when absent or empty (parity with lua).
 */
function readDatePattern(config: unknown): string {
  if (!isRecord(config) || config.kind !== "dateConfig") return DEFAULT_DATE_PATTERN;
  const { value: inner } = config;
  if (!isRecord(inner)) return DEFAULT_DATE_PATTERN;
  const { pattern } = inner;
  return typeof pattern === "string" && pattern.length > 0 ? pattern : DEFAULT_DATE_PATTERN;
}

function reportFormatterError(message: string, ctx: BindingContext): void {
  reportFailedToParse(ctx, message);
}

function reportIncompatibleValue(
  formatterType: keyof typeof FORMATTER_TYPE_LABELS,
  value: unknown,
  ctx: BindingContext,
): void {
  const label = FORMATTER_TYPE_LABELS[formatterType];
  reportFormatterError(`Formatter ${label} received incompatible type '${typeof value}'`, ctx);
}

/**
 * Apply the formatter on a `FormatArg` to a resolved value. Returns
 * `undefined` when the formatter is malformed or the value can't be
 * coerced — callers should fall back to the raw stringified value so the
 * surrounding format template still renders.
 */
export function resolveFormatter(
  value: unknown,
  formatter: unknown,
  ctx: BindingContext,
): string | undefined {
  if (!isRecord(formatter)) return undefined;

  const rawType = formatter.type;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- `formatter.type` is wire JSON (number) vs INVALID sentinel until narrowed
  if (typeof rawType !== "number" || rawType === formatterTypeEnum.INVALID) {
    reportFormatterError(`Formatter specified without a valid type (got ${String(rawType)})`, ctx);
    return undefined;
  }

  if (!isSupportedFormatterType(rawType)) {
    reportFormatterError(`Unknown formatter type (got ${String(rawType)})`, ctx);
    return undefined;
  }

  const formatterType = rawType;

  switch (formatterType) {
    case formatterTypeEnum.NUMBER_ABBREVIATE: {
      const numericValue = coerceNumber(value);
      if (numericValue === undefined) {
        reportIncompatibleValue(formatterType, value, ctx);
        return undefined;
      }
      return new Intl.NumberFormat(undefined, {
        notation: "compact",
        maximumFractionDigits: 1,
      }).format(numericValue);
    }
    case formatterTypeEnum.NUMBER_LOCALIZE: {
      const numericValue = coerceNumber(value);
      if (numericValue === undefined) {
        reportIncompatibleValue(formatterType, value, ctx);
        return undefined;
      }
      return new Intl.NumberFormat().format(numericValue);
    }
    case formatterTypeEnum.DATE_FORMAT: {
      const date = coerceDate(value);
      if (!date) {
        reportIncompatibleValue(formatterType, value, ctx);
        return undefined;
      }
      return dayjs(date).format(readDatePattern(formatter.config));
    }
    default: {
      const exhaustive: never = formatterType;
      reportFormatterError(`Unhandled formatter type '${String(exhaustive)}'`, ctx);
      return undefined;
    }
  }
}
