import {
  SDUI_TEXT_TRUNCATE_MODE_VALUES,
  SDUI_TEXT_X_ALIGNMENT_VALUES,
  SDUI_TEXT_Y_ALIGNMENT_VALUES,
  type SduiTextTruncate,
  type SduiTextTruncateMode,
  type SduiTextXAlignment,
  type SduiTextYAlignment,
} from "../types";
import { stripEnumPrefix } from "./enumPrefix";
import { isMemberOf } from "./typeGuards";
import { camelToSnake } from "./caseConversion";

/**
 * Given a prefix like `TEXT_TRUNCATE`, add it to the value if it doesn't already have it.
 */
function withEnumPrefix(value: string, prefix: string): string {
  if (value.startsWith(prefix)) return value;
  // We need to remove any leading underscore off the snake case value, since prefix
  // already has a trailing underscore.
  const snake = camelToSnake(value).replace(/^_/, "").toUpperCase();
  return `${prefix}${snake}`;
}

function parsePrefixedEnum<T extends string>(
  value: unknown,
  prefix: string,
  allowed: readonly T[],
): T | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;
  // Defensively expect that we could receive a prefixed string like
  // "TEXT_TRUNCATE_AT_END" or a raw value like "AtEnd".
  // We add the prefix to the value if it doesn't already have it, so that
  // `stripEnumPrefix` doesn't early return.
  const normalized = stripEnumPrefix(withEnumPrefix(value, prefix), prefix);
  return isMemberOf(allowed, normalized) ? normalized : undefined;
}

/** `"Left"` and `"TEXT_X_ALIGNMENT_LEFT"` both become `"left"`. */
export function parseTextXAlignment(value: unknown): SduiTextXAlignment | undefined {
  return parsePrefixedEnum(value, "TEXT_X_ALIGNMENT_", SDUI_TEXT_X_ALIGNMENT_VALUES);
}

/** `"Top"` and `"TEXT_Y_ALIGNMENT_TOP"` both become `"top"`. */
export function parseTextYAlignment(value: unknown): SduiTextYAlignment | undefined {
  return parsePrefixedEnum(value, "TEXT_Y_ALIGNMENT_", SDUI_TEXT_Y_ALIGNMENT_VALUES);
}

/** `"None"`, `"AtEnd"`, `"SplitWord"`, and the `TEXT_TRUNCATE_*` names. */
export function parseTextTruncate(value: unknown): SduiTextTruncateMode | undefined {
  return parsePrefixedEnum(value, "TEXT_TRUNCATE_", SDUI_TEXT_TRUNCATE_MODE_VALUES);
}

export function buildTextXAlignmentCss(alignment: SduiTextXAlignment): string {
  switch (alignment) {
    case "left":
      return "text-align-x-left";
    case "center":
      return "text-align-x-center";
    case "right":
      return "text-align-x-right";
  }
}

/**
 * Cross-axis alignment for a text box. This places the glyphs
 * inside the text element's height.
 * This requires a flex parent container.
 */
export function buildTextYAlignmentCss(alignment: SduiTextYAlignment): string {
  switch (alignment) {
    case "top":
      return "items-start text-align-y-top";
    case "center":
      return "items-center text-align-y-center";
    case "bottom":
      return "items-end text-align-y-bottom";
  }
}

export function buildTextTruncateCss(mode: SduiTextTruncateMode): SduiTextTruncate {
  switch (mode) {
    case "none":
      return "text-truncate-none";
    case "atEnd":
      return "text-truncate-end";
    case "splitWord":
      return "text-truncate-split";
  }
}
