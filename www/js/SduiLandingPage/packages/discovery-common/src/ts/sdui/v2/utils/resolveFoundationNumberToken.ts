import { getSduiNumeric, getSduiToken, type SduiTokenOrLiteral } from "@rbx/sdui-core";

/**
 * Resolves a V2 TokenOrLiteral into a numeric foundation token value.
 * Reports via onInvalidToken when a token path is present but does not resolve to a number.
 */
export function resolveFoundationNumberToken(
  value: SduiTokenOrLiteral | undefined,
  tokens: object,
  onInvalidToken?: (tokenPath: string, detail: string) => void,
): number | undefined {
  const numeric = getSduiNumeric(value);
  if (numeric !== undefined) {
    return numeric;
  }

  const tokenPath = getSduiToken(value);
  if (tokenPath == null) {
    return undefined;
  }

  let tokenValue: unknown = tokens;
  for (const segment of tokenPath.split(".")) {
    if (typeof tokenValue !== "object" || tokenValue == null || !(segment in tokenValue)) {
      onInvalidToken?.(tokenPath, `invalid path segment "${segment}"`);
      return undefined;
    }
    tokenValue = (tokenValue as Record<string, unknown>)[segment];
  }

  if (typeof tokenValue !== "number") {
    onInvalidToken?.(tokenPath, `expected number, got ${typeof tokenValue}`);
    return undefined;
  }

  return tokenValue;
}
