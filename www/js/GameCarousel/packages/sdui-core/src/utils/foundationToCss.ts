import { tokenToClassName } from "@rbx/foundation-tailwind/unstable/tokens";

type TokenClassNode = string | TokenClassMap;

// Recursive token tree: leaves are class strings, branches are token categories.
interface TokenClassMap {
  readonly [key: string]: TokenClassNode;
}

const TOKEN_CLASS_MAP: TokenClassMap = tokenToClassName;

const DEFAULT_USAGE_BY_CATEGORY: Record<string, string> = {
  Gap: "gap",
  Gutter: "gutter",
  Margin: "margin",
  Padding: "padding",
  Size: "size",
};

const USAGE_ALIASES: Record<string, readonly string[]> = {
  background: ["background", "Background", "bg"],
  bg: ["bg", "Background", "background"],
  border: ["border", "Border", "stroke"],
  content: ["content", "Foreground"],
  foreground: ["Foreground", "content"],
  stroke: ["stroke", "Border", "border"],
};

function isTokenMap(value: TokenClassNode): value is TokenClassMap {
  return typeof value === "object";
}

function getUsageKeys(usageKey: string): readonly string[] {
  return USAGE_ALIASES[usageKey] ?? [usageKey];
}

function pickClassName(node: TokenClassMap, usageKey: string | undefined): string | undefined {
  if (usageKey) {
    for (const key of getUsageKeys(usageKey)) {
      const value = node[key];
      if (typeof value === "string") return value;
    }
  }

  const stringValues = Object.values(node).filter(
    (value): value is string => typeof value === "string",
  );
  return stringValues.length === 1 ? stringValues[0] : undefined;
}

/**
 * Builds a Foundation Tailwind class from an SDUI Foundation token path.
 *
 * `usageKey` selects which class to use when a token maps to multiple classes:
 * `Padding.Medium` can resolve to padding, paddingTop, paddingX,
 * etc. Omit it only when the token maps to one class or the top-level category
 * has a default usage.
 */
export function buildFoundationTokenCss(
  tokenPath: string | undefined,
  usageKey?: string,
): string | undefined {
  if (tokenPath == null || tokenPath === "") return undefined;

  const segments = tokenPath.split(".");
  let node: TokenClassNode | undefined = TOKEN_CLASS_MAP;

  for (const segment of segments) {
    if (!isTokenMap(node)) return undefined;
    node = node[segment];
    if (node === undefined) return undefined;
  }

  if (typeof node === "string") return node;
  return pickClassName(node, usageKey ?? DEFAULT_USAGE_BY_CATEGORY[segments[0] ?? ""]);
}

/**
 * TODO: Replace with Foundation Map
 * Maps a `bg-*` Foundation Tailwind class to its backing CSS custom-property reference.
 *
 * The Foundation CSS has four distinct naming patterns, determined by analysing the
 * generated stylesheet:
 *   bg-action-*           → var(--color-action-*-background)
 *   bg-inverse-action-*   → var(--inverse-action-*-background)
 *   bg-inverse-*          → var(--inverse-*)
 *   bg-*                  → var(--color-*)
 */
function bgClassToCssVar(bgClass: string): string {
  if (bgClass.startsWith("bg-inverse-action-")) {
    return `var(--inverse-${bgClass.slice("bg-inverse-".length)}-background)`;
  }
  if (bgClass.startsWith("bg-inverse-")) {
    return `var(--inverse-${bgClass.slice("bg-inverse-".length)})`;
  }
  if (bgClass.startsWith("bg-action-")) {
    return `var(--color-${bgClass.slice(3)}-background)`;
  }
  return `var(--color-${bgClass.slice(3)})`;
}

/**
 * TODO: Replace with Foundation Map
 * Converts a Foundation `Color.*` token path to an inline CSS `var()` reference for use
 * in inline styles.
 *
 * Supports all Foundation background color tokens:
 *   "Color.Surface.Surface_0"          → "var(--color-surface-0)"
 *   "Color.ActionAlert.Background"     → "var(--color-action-alert-background)"
 *   "Color.Inverse.Surface_0"          → "var(--inverse-surface-0)"
 */
export function buildFoundationColorCssVar(tokenPath: string | undefined): string | undefined {
  if (!tokenPath?.startsWith("Color.")) return undefined;
  const className =
    buildFoundationTokenCss(tokenPath, "background") ?? buildFoundationTokenCss(tokenPath);
  if (!className?.startsWith("bg-")) return undefined;
  return bgClassToCssVar(className);
}

/** Foundation corner-radius enum values from SDUI string literals. */
export type FoundationRadius = "None" | "XSmall" | "Small" | "Medium" | "Large" | "Circle";

const DEFAULT_RADIUS: FoundationRadius = "Medium";

/**
 * Maps a Foundation radius enum to its Foundation Tailwind `radius-*` class.
 * Sourced from Foundation's generated token map (`Radius.Medium` ->
 * "radius-medium") rather than a hand-maintained copy. Defaults to the `Medium`
 * class when unset.
 */
export function buildFoundationRadiusClass(radius: FoundationRadius | undefined): string {
  return buildFoundationTokenCss(`Radius.${radius ?? DEFAULT_RADIUS}`) ?? "radius-medium";
}

/**
 * Resolves an SDUI radius token string to a Foundation Tailwind `radius-*` class.
 * Accepts either a `Radius.*` token path (e.g. "Radius.Medium") or a bare enum
 * name (e.g. "Medium"), and returns `undefined` when the token is unset or not a
 * Foundation radius (so callers can fall back to a raw px value).
 *
 * Callers extract the token string first (e.g. via `getSduiToken`) to avoid a
 * circular dependency between this module and `styleValue`.
 */
export function resolveFoundationRadiusClass(token: string | undefined): string | undefined {
  if (token == null) return undefined;
  const path = token.startsWith("Radius.") ? token : `Radius.${token}`;
  return buildFoundationTokenCss(path);
}
