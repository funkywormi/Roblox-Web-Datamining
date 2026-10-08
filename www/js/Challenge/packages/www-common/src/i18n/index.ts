/**
 * String translation for client components on both the .NET and the Next.js website.
 *
 * Components read strings through these hooks regardless of which platform they render on; only
 * the provider above them differs. Next.js pages render `TranslationProvider` from
 * `@rbx/www-nextjs/i18n/server`, which is backed by the generated locale JSON. Static Content
 * Component entries render `TranslationProviderSCC` from `@rbx/www-common/i18n/scc`, which is
 * backed by `window.Roblox.Lang`. Both end at the same `use-intl` context.
 *
 * `next-intl` is a thin wrapper over `use-intl` in the browser — its provider *is* `use-intl`'s
 * `IntlProvider` and its `useTranslations` *is* `use-intl`'s — so these hooks work under either
 * one. Import `use-intl` only from this module, so a single copy backs both platforms; a second
 * copy would have its own React context and throw at render.
 *
 * **Client only.** `use-intl` has no `react-server` build, so a Next.js Server Component must use
 * `@rbx/www-nextjs/i18n` instead; `next-intl` swaps in a request-config implementation there.
 *
 * This is about strings. For date and number formatting on components that have no provider yet,
 * see `@rbx/www-common/intl`.
 */
"use client";

import { useMemo } from "react";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { useTranslations as useTranslationsUseIntl } from "use-intl";
import { adaptTranslator, type Translator } from "./adaptor";
import type { Namespace } from "./types";
import { fromPeriodToColonDelimited } from "./util";

/**
 * Translations for one namespace, keyed by the period-delimited names used in the localization
 * service (e.g. `useTranslations("Feature.Messages")` then `t("Heading.Message")`).
 */
export const useTranslations = <N extends Namespace>(namespace: N): Translator<N> => {
  const t = useTranslationsUseIntl(fromPeriodToColonDelimited(namespace));
  return useMemo(() => adaptTranslator(t, namespace), [t, namespace]);
};

export { adaptTranslator, type Translator } from "./adaptor";
export type { HtmlTag } from "./html";
export type { Messages, Namespace, TranslationKeyInternal, TranslationsInternal } from "./types";
export {
  type FromColonToPeriodDelimited,
  type FromPeriodToColonDelimited,
  fromColonToPeriodDelimited,
  fromPeriodToColonDelimited,
} from "./util";

// eslint-disable-next-line @typescript-eslint/no-restricted-imports
export { hasLocale, useFormatter, useLocale, useNow, useTimeZone } from "use-intl";
