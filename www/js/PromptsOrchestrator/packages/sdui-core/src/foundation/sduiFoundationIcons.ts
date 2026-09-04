import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";

import { reportBindingError, reportError, SduiErrorName } from "../errors";
import type { BindingContext } from "../types";
import { pascalOrCamelToKebab } from "../utils/caseConversion";
import { isRecord } from "../utils/typeGuards";

/**
 * Curated allowlist of Foundation Tailwind icon classes that SDUI templates
 * may reference.
 *
 * The SDUI wire contract is Foundation `IconName` + `IconVariant` tokens (see
 * `FoundationIconConfigProp` / `IconSchema`), never raw class strings. Web maps
 * those tokens to Tailwind classes here.
 *
 * Because these class names appear literally in this source file, Tailwind's
 * scan of any component importing SDUI emits them into that component's CSS
 * output — no central `foundation-css` safelist entry is required. Add icons
 * only from real template usage — do not dump the full Foundation catalog.
 *
 * `satisfies readonly TTailwindIconClass[]` makes the compiler reject any
 * string that is not a real Foundation icon class.
 */
export const SDUI_FOUNDATION_ICON_CLASSES = [
  "icon-regular-star",
  "icon-regular-facebook",
  "icon-regular-twitter",
  "icon-regular-youtube",
  "icon-regular-twitch",
  "icon-regular-discord",
  "icon-regular-guilded",
  "icon-regular-pencil-square",
  "icon-regular-bell",
  "icon-regular-image",
  "icon-regular-calendar-star",
  "icon-regular-lock-closed",
  "icon-regular-speech-bubble-align-center",
  "icon-regular-premium",
  "icon-regular-roblox-plus",
  "icon-regular-x",
  "icon-regular-x-small",
] as const satisfies readonly TTailwindIconClass[];

/** An allowlisted SDUI icon class — derived from {@link SDUI_FOUNDATION_ICON_CLASSES}. */
export type SduiFoundationIconClass = (typeof SDUI_FOUNDATION_ICON_CLASSES)[number];

const SDUI_FOUNDATION_ICON_CLASS_SET: ReadonlySet<string> = new Set(SDUI_FOUNDATION_ICON_CLASSES);

/** Type guard for allowlisted Foundation icon classes. */
export function isSduiFoundationIconClass(value: unknown): value is SduiFoundationIconClass {
  return typeof value === "string" && value.length > 0 && SDUI_FOUNDATION_ICON_CLASS_SET.has(value);
}

/**
 * Reports an unresolved icon value for monitoring. Silent when `value` is
 * missing/empty (optional props). With `ctx` it uses `reportBindingError`
 * (adds binding dimensions); without `ctx` (render-time components) it falls
 * back to `reportError`, which only `console.warn`s in non-production.
 */
function reportUnresolvedFoundationIcon(message: string, ctx?: BindingContext): void {
  if (ctx) {
    reportBindingError(SduiErrorName.UnresolvedPropValue, ctx, message);
    return;
  }
  reportError(SduiErrorName.UnresolvedPropValue, message);
}

/**
 * Foundation `IconVariant` token → Tailwind class segment. Missing/empty
 * defaults to `regular`; unknown non-empty values report and fall back to
 * `regular`.
 */
function normalizeIconVariant(
  variant: string | undefined | null,
  ctx?: BindingContext,
): "regular" | "filled" {
  if (typeof variant !== "string" || variant.length === 0) return "regular";

  const normalized = variant.toLowerCase();
  if (normalized === "regular" || normalized === "filled") {
    return normalized;
  }

  reportUnresolvedFoundationIcon(
    `Foundation IconVariant not supported: "${variant}" (expected Regular or Filled)`,
    ctx,
  );
  return "regular";
}

/**
 * Maps Foundation wire tokens (`IconName` + optional `IconVariant`) to an
 * allowlisted Tailwind icon class.
 *
 * Examples: `("Star", "Filled")` → `"icon-filled-star"`;
 * `("MagnifyingGlass")` → `"icon-regular-magnifying-glass"`.
 *
 * Does not accept Tailwind class strings as `name` — that is not the SDUI
 * contract. Returns `undefined` (and reports `UnresolvedPropValue`) when
 * `name` is non-empty but the assembled class is not on the allowlist.
 */
export function toSduiFoundationIconClass(
  name: string | undefined | null,
  variant?: string | null,
  ctx?: BindingContext,
): SduiFoundationIconClass | undefined {
  if (typeof name !== "string" || name.length === 0) return undefined;

  const className = `icon-${normalizeIconVariant(variant, ctx)}-${pascalOrCamelToKebab(name)}`;
  if (isSduiFoundationIconClass(className)) return className;

  reportUnresolvedFoundationIcon(
    `Foundation icon not on SDUI allowlist: className="${className}" (name="${name}" variant="${variant ?? "Regular"}")`,
    ctx,
  );
  return undefined;
}

/**
 * Coerces a resolved `FoundationIconConfig` value to an allowlisted class.
 *
 * Accepts either a `{ name, variant? }` table (the canonical shape) or a bare
 * `IconName` string. Used by `buildFoundationIconConfigProp` and by
 * hydration-bound icon values.
 */
export function foundationIconConfigToClass(
  config: unknown,
  ctx?: BindingContext,
): SduiFoundationIconClass | undefined {
  if (typeof config === "string") return toSduiFoundationIconClass(config, undefined, ctx);
  if (!isRecord(config)) return undefined;
  const name = typeof config.name === "string" ? config.name : undefined;
  const variant = typeof config.variant === "string" ? config.variant : undefined;
  return toSduiFoundationIconClass(name, variant, ctx);
}
