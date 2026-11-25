import { SDUI_UI_FLEX_MODE_VALUES, type SduiUIFlexMode } from "../types";
import { stripEnumPrefix } from "./enumPrefix";
import { isMemberOf } from "./typeGuards";

/**
 * Normalizes a flex-mode string.
 * e.g., `"Shrink"` and `"UI_FLEX_MODE_SHRINK"` both become `"shrink"`.
 * `""`, `"Custom"`, and unknown strings return `undefined`.
 * */
export function parseUIFlexMode(value: unknown): SduiUIFlexMode | undefined {
  if (typeof value !== "string" || value.length === 0) return undefined;

  const normalized = stripEnumPrefix(value, "UI_FLEX_MODE_").toLowerCase();
  return isMemberOf(SDUI_UI_FLEX_MODE_VALUES, normalized) ? normalized : undefined;
}

/** Maps a parsed flex mode to the Foundation utility class with the same flex shorthand. */
export function buildUIFlexModeCss(mode: SduiUIFlexMode): string {
  switch (mode) {
    case "none":
      return "shrink-0 width-fit";
    case "grow":
      return "grow";
    case "shrink":
      return "shrink width-fit";
    case "fill":
      return "fill";
  }
}
