import type { CSSProperties } from "react";
import type { SduiTokenOrLiteral } from "../types";
import { buildFoundationTokenCss } from "./foundationToCss";

export function getSduiNumeric(value: SduiTokenOrLiteral | undefined): number | undefined {
  return value?.kind === "numeric" ? value.value : undefined;
}

export function getSduiToken(value: SduiTokenOrLiteral | undefined): string | undefined {
  return value?.kind === "token" ? value.value : undefined;
}

export function buildSduiNumericStyle(
  value: SduiTokenOrLiteral | undefined,
  buildStyle: (numericValue: number) => CSSProperties,
): CSSProperties {
  const numericValue = getSduiNumeric(value);
  // Only add the numeric style when the numeric value is defined.
  return numericValue !== undefined ? buildStyle(numericValue) : {};
}

export function buildSduiTokenClass(
  value: SduiTokenOrLiteral | undefined,
  usageKey?: string,
): string | undefined {
  return buildFoundationTokenCss(getSduiToken(value), usageKey);
}
