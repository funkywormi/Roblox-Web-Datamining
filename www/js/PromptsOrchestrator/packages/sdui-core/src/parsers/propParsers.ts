import type { PropParserContext } from "../types/binding";
import type { SduiTokenOrLiteral } from "../types";

/**
 * Prop parser for props that accept either a numeric literal or a token string,
 * e.g. padding or gap that can be `{ literal: 20 }` or `{ token: "Gap.XXLarge" }`.
 *
 * An optional fallback is returned when the server omits the prop:
 *   makeTokenOrLiteralPropParser("Gap.Small")   // token fallback
 *   makeTokenOrLiteralPropParser(16)            // numeric fallback
 */
export function makeTokenOrLiteralPropParser(fallback?: string | number) {
  return (value: unknown, _ctx: PropParserContext): SduiTokenOrLiteral | null => {
    if (typeof value === "number") return { kind: "numeric", value };
    // TODO (sshetty): this makes an assumption that a string value is a token. Builder
    // needs to brand tokens, so we can check for it here.
    if (typeof value === "string" && value) {
      return { kind: "token", value };
    }
    if (typeof fallback === "number") return { kind: "numeric", value: fallback };
    if (typeof fallback === "string") return { kind: "token", value: fallback };
    return null;
  };
}
