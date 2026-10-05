/**
 * Web-equivalent parsers for prop types that need value transformation.
 *
 * Parsers receive the active `BindingContext` so they can call `reportError`
 * with full provenance (`pageContext`, `componentType`, `propName`).
 */
import { parseFloat } from "@rbx/core-lib/number";
import { reportBindingError, SduiErrorName } from "../../../errors";
import {
  SDUI_AUTOMATIC_SIZE_VALUES,
  SDUI_SCALE_BASIS_VALUES,
  SDUI_SCALE_TYPE_VALUES,
  type SduiAutomaticSize,
  type BindingContext,
  type SduiDim,
  type SduiDim2,
  type SduiGradient,
  type SduiScaleBasis,
  type SduiScaleType,
  type SduiVector2,
  type SduiTextTruncate,
  SDUI_TEXT_TRUNCATE_TO_TAILWIND_MAP,
} from "../../../types";
import { stripEnumPrefix } from "../../../utils/enumPrefix";
import { isMemberOf, isRecord } from "../../../utils/typeGuards";

function normalizeColorToCss(color: unknown, ctx: BindingContext): string {
  if (typeof color === "string") {
    const trimmed = color.trim();
    if (trimmed.startsWith("#")) return trimmed;
    if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
    if (/^[0-9a-fA-F]{8}$/.test(trimmed)) return `#${trimmed}`;
    return trimmed;
  }
  if (isRecord(color)) {
    const { r, g, b } = color;
    if (typeof r === "number" && typeof g === "number" && typeof b === "number") {
      return `rgb(${r}, ${g}, ${b})`;
    }
  }

  reportBindingError(
    SduiErrorName.InvalidColorString,
    ctx,
    `$Expected a CSS color string or RGB object; got ${typeof color}`,
    { message: String(color) },
  );
  return "#000000";
}

/**
 * Parse icon prop value.
 * On web, icon names are passed as strings (e.g. "icons/status/games/rating_small").
 * Map supported SDUI icon paths to the CSS classes -- mirrors app behavior.
 */
const SUPPORTED_ICON_CLASSES: Record<string, string> = {
  "icons/status/games/rating_small": "sdui-icon icon-rating-16x16",
  "icons/status/games/people-playing_small": "sdui-icon icon-current-players-16x16",
  "icons/navigation/pushRight_small": "sdui-icon icon-push-right-16x16",
};

export function parseIconProp(value: unknown, ctx: BindingContext): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "object") return value;
  if (typeof value === "string") return SUPPORTED_ICON_CLASSES[value] ?? value;
  if (typeof value === "number" || typeof value === "bigint") {
    return value.toString();
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  reportBindingError(
    SduiErrorName.FailedToParseProp,
    ctx,
    `icon prop could not parse ${typeof value}`,
    { parserName: "parseIconProp", message: typeof value },
  );
  return "";
}

/**
 * Normalizes a color string for CSS consumption: trims whitespace and adds
 * a `#` prefix to bare 6/8-char hex strings. Non-string values report an
 * `InvalidColorString` error and resolve to `""`.
 *
 * Replaces the inline `makeParseColor(ctx)` helper that lived inside the
 * old `buildColorProp.ts` — now a plain `(value, ctx)` parser that can be
 * registered via `applyParser(buildDefaultProp, parseColorString)`.
 */
export function parseColorString(value: unknown, ctx: BindingContext): string {
  if (typeof value !== "string") {
    if (value !== undefined && value !== null) {
      reportBindingError(
        SduiErrorName.InvalidColorString,
        ctx,
        `color prop expected a string; got ${typeof value}`,
      );
    }
    return "";
  }
  const trimmed = value.trim();
  if (trimmed.startsWith("#")) return trimmed;
  if (/^[0-9a-fA-F]{6}$/.test(trimmed)) return `#${trimmed}`;
  if (/^[0-9a-fA-F]{8}$/.test(trimmed)) return `#${trimmed}`;
  return trimmed;
}

/**
 * Unwraps `StringArrayProp` literal values. The proto literal shape is
 * `{ items: string[] }`, while binding paths resolve directly to `string[]`.
 */
export function parseStringArrayProp(value: unknown, ctx: BindingContext): string[] | undefined {
  if (value == null) return undefined;

  const raw = isRecord(value) ? value.items : value;
  if (!Array.isArray(raw)) {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `string array prop expected an array or { items }; got ${typeof value}`,
      { parserName: "parseStringArrayProp", message: typeof value },
    );
    return undefined;
  }

  return raw.filter((item): item is string => typeof item === "string");
}

/**
 * Parses a `GradientProp` value into a typed `SduiGradient`.
 */
export function parseGradientProp(value: unknown, ctx: BindingContext): SduiGradient | undefined {
  if (value == null) return undefined;
  if (!isRecord(value)) {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `gradient prop expected an object; got ${typeof value}`,
      { parserName: "parseGradientProp", message: typeof value },
    );
    return undefined;
  }

  const startColor = normalizeColorToCss(value.startColor, ctx);
  const endColor = normalizeColorToCss(value.endColor, ctx);
  const startOpacity = Number(value.startOpacity ?? 0);
  const endOpacity = Number(value.endOpacity ?? 1);
  const degree = Number(value.degree ?? 270);
  const midpointPercent = Number(value.midpointPercent ?? 0.5);

  if (
    !Number.isFinite(startOpacity) ||
    !Number.isFinite(endOpacity) ||
    !Number.isFinite(degree) ||
    !Number.isFinite(midpointPercent)
  ) {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `gradient prop expected finite numbers for startOpacity, endOpacity, degree, and midpointPercent`,
      { parserName: "parseGradientProp", message: JSON.stringify(value) },
    );
    return undefined;
  }

  return { startColor, endColor, startOpacity, endOpacity, degree, midpointPercent };
}

function isValidSduiDim(value: unknown): value is SduiDim {
  if (!isRecord(value)) return false;
  const { scale, offset } = value;
  return typeof scale === "number" && typeof offset === "number";
}

function convertArrayToSduiDim(value: unknown): SduiDim | undefined {
  if (!Array.isArray(value) || value.length !== 2) return undefined;
  const [scale, offset] = value.map(part => parseFloat(String(part).trim()));
  if (scale == null || !Number.isFinite(scale) || offset == null || !Number.isFinite(offset)) {
    return undefined;
  }
  return { scale, offset };
}

/**
 * Parses a `UDimProp` or `UiScaledUDimProp` literal string (`"{scale},{offset}"`),
 * a two-element array, or a bare offset number into a typed `SduiDim`.
 */
export function parseUDimProp(value: unknown, ctx: BindingContext): SduiDim | undefined {
  if (value == null) return undefined;
  if (isValidSduiDim(value)) return value;

  const convertedArray = convertArrayToSduiDim(value);
  if (convertedArray != null) return convertedArray;

  if (typeof value === "number" && Number.isFinite(value)) {
    return { scale: 0, offset: value };
  }

  if (typeof value !== "string") {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `UDim prop expected a string, number, or two-element array; got ${typeof value}`,
      { parserName: "parseUDimProp", message: typeof value },
    );
    return undefined;
  }

  const parts = value.split(",");
  if (parts.length !== 2) {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `UDim prop expected two comma-separated values`,
      { parserName: "parseUDimProp", message: value },
    );
    return undefined;
  }

  const scale = parseFloat(parts[0]?.trim() ?? "");
  const offset = parseFloat(parts[1]?.trim() ?? "");
  return {
    scale: scale != null && Number.isFinite(scale) ? scale : 0,
    offset: offset != null && Number.isFinite(offset) ? offset : 0,
  };
}

/**
 * Parses a `UDim2Prop` or `UiScaledUDim2Prop` literal string
 * (`"{xScale},{xOffset},{yScale},{yOffset}"`) into a typed `SduiDim2`.
 */
export function parseUDim2Prop(value: unknown, ctx: BindingContext): SduiDim2 | undefined {
  if (value == null) return undefined;
  if (typeof value !== "string") {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `UDim2 prop expected a string; got ${typeof value}`,
      { parserName: "parseUDim2Prop", message: typeof value },
    );
    return undefined;
  }
  const [xScale, xOffset, yScale, yOffset] = value.split(",").map(p => parseFloat(p.trim()));
  if (
    xScale == null ||
    !Number.isFinite(xScale) ||
    xOffset == null ||
    !Number.isFinite(xOffset) ||
    yScale == null ||
    !Number.isFinite(yScale) ||
    yOffset == null ||
    !Number.isFinite(yOffset)
  ) {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `UDim2 prop expected four comma-separated finite numbers`,
      { parserName: "parseUDim2Prop", message: value },
    );
    return undefined;
  }
  return { xScale, xOffset, yScale, yOffset };
}

/**
 * Parses a `Vector2Prop` literal string (`"{x},{y}"`) into a typed `SduiVector2`.
 */
export function parseVector2Prop(value: unknown, ctx: BindingContext): SduiVector2 | undefined {
  if (value == null) return undefined;
  if (typeof value !== "string") {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `Vector2 prop expected a string; got ${typeof value}`,
      { parserName: "parseVector2Prop", message: typeof value },
    );
    return undefined;
  }
  const [x, y] = value.split(",").map(p => parseFloat(p.trim()));
  if (x == null || !Number.isFinite(x) || y == null || !Number.isFinite(y)) {
    reportBindingError(
      SduiErrorName.FailedToParseProp,
      ctx,
      `Vector2 prop expected two comma-separated finite numbers`,
      { parserName: "parseVector2Prop", message: value },
    );
    return undefined;
  }
  return { x, y };
}

/**
 * Parses an `AutomaticSizeProp` proto enum string (e.g. `"AUTOMATIC_SIZE_XY"`)
 * into a typed `SduiAutomaticSize` by stripping the `AUTOMATIC_SIZE_` prefix.
 */
export function parseAutomaticSizeProp(
  value: unknown,
  ctx: BindingContext,
): SduiAutomaticSize | undefined {
  if (value == null) return undefined;
  const stripped = stripEnumPrefix(value, "AUTOMATIC_SIZE_");
  if (isMemberOf(SDUI_AUTOMATIC_SIZE_VALUES, stripped)) {
    return stripped;
  }

  reportBindingError(
    SduiErrorName.FailedToParseProp,
    ctx,
    `automatic size prop expected one of ${SDUI_AUTOMATIC_SIZE_VALUES.join(", ")}`,
    {
      parserName: "parseAutomaticSizeProp",
      message: typeof value === "string" ? value : typeof value,
    },
  );
  return undefined;
}

/**
 * Parses a `ScaleTypeProp` proto enum string (e.g. `"SCALE_TYPE_CROP"`)
 * into a typed `SduiScaleType` by stripping the `SCALE_TYPE_` prefix.
 */
export function parseScaleTypeProp(value: unknown, ctx: BindingContext): SduiScaleType | undefined {
  if (value == null) return undefined;
  const stripped = stripEnumPrefix(value, "SCALE_TYPE_");
  if (isMemberOf(SDUI_SCALE_TYPE_VALUES, stripped)) {
    return stripped;
  }

  reportBindingError(
    SduiErrorName.FailedToParseProp,
    ctx,
    `scale type prop expected one of ${SDUI_SCALE_TYPE_VALUES.join(", ")}`,
    {
      parserName: "parseScaleTypeProp",
      message: typeof value === "string" ? value : typeof value,
    },
  );
  return undefined;
}

/**
 * Parses a `ScaleBasisProp` proto enum string (e.g. `"SCALE_BASIS_VIEWPORT"`)
 * into a typed `SduiScaleBasis` by stripping the `SCALE_BASIS_` prefix.
 */
export function parseScaleBasisProp(
  value: unknown,
  ctx: BindingContext,
): SduiScaleBasis | undefined {
  if (value == null) return undefined;
  const stripped = stripEnumPrefix(value, "SCALE_BASIS_");
  if (isMemberOf(SDUI_SCALE_BASIS_VALUES, stripped)) {
    return stripped;
  }

  reportBindingError(
    SduiErrorName.FailedToParseProp,
    ctx,
    `scale basis prop expected one of ${SDUI_SCALE_BASIS_VALUES.join(", ")}`,
    {
      parserName: "parseScaleBasisProp",
      message: typeof value === "string" ? value : typeof value,
    },
  );
  return undefined;
}

export function parseTextTruncateProp(
  value: unknown,
  ctx: BindingContext,
): SduiTextTruncate | undefined {
  if (value == null) return undefined;
  if (typeof value === "string" && SDUI_TEXT_TRUNCATE_TO_TAILWIND_MAP[value]) {
    return SDUI_TEXT_TRUNCATE_TO_TAILWIND_MAP[value];
  }
  reportBindingError(
    SduiErrorName.FailedToParseProp,
    ctx,
    `text truncate prop expected one of ${Object.keys(SDUI_TEXT_TRUNCATE_TO_TAILWIND_MAP).join(", ")}`,
    {
      parserName: "parseTextTruncateProp",
      message: typeof value === "string" ? value : typeof value,
    },
  );
  return undefined;
}
