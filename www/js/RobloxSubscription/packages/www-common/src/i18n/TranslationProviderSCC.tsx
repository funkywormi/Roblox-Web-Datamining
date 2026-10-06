/**
 * The `use-intl` provider for Static Content Component entries on the .NET page.
 *
 * On .NET the server seeds `window.Roblox.Lang` (plus the `LangDynamic` overlays) with the
 * namespaces the component declares in its `component.json`. This reshapes that global into the
 * same colon-delimited message object `@rbx/www-nextjs` generates into its locale JSON, so the
 * component tree above reads strings through `@rbx/www-common/i18n` on both platforms.
 *
 * Import this from a component's `entry.tsx` only — never from shared component source, which must
 * stay platform-agnostic. The Next.js equivalent is `@rbx/www-nextjs/i18n/server`.
 */
import { useMemo, type ReactNode } from "react";
// eslint-disable-next-line @typescript-eslint/no-restricted-imports
import { IntlProvider } from "use-intl";
import { getLocaleFromDocument } from "../intl";
import type { Locale } from "../locale";
import type { Namespace } from "./types";
import { fromPeriodToColonDelimited } from "./util";

type LegacyResources = Record<string, Record<string, string | null> | undefined>;

type LegacyGlobals = {
  Lang?: LegacyResources;
  LangDynamic?: LegacyResources;
  LangDynamicDefault?: LegacyResources;
};

const readLegacyGlobals = (): LegacyGlobals => {
  if (typeof window === "undefined") {
    return {};
  }

  // Seeded by the .NET page; a dual-target package has no ambient type for the Roblox global.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  const { Roblox } = window as unknown as { Roblox?: LegacyGlobals };
  return Roblox ?? {};
};

/**
 * Drops untranslated keys so a `null` in one overlay doesn't shadow a translation in the one below,
 * and so a genuinely missing string reaches use-intl's missing-message handling rather than
 * rendering empty.
 */
const translated = (resources: Record<string, string | null> | undefined) =>
  Object.fromEntries(
    Object.entries(resources ?? {}).flatMap(([key, value]) =>
      value == null ? [] : [[fromPeriodToColonDelimited(key), value] as const],
    ),
  );

/** Overlay order matches `TranslationResourceProvider` in `@rbx/core-scripts`. */
const readMessages = (namespaces: readonly Namespace[]) => {
  const { Lang, LangDynamic, LangDynamicDefault } = readLegacyGlobals();

  return Object.fromEntries(
    namespaces.map(
      namespace =>
        [
          fromPeriodToColonDelimited(namespace),
          {
            ...translated(LangDynamicDefault?.[namespace]),
            ...translated(Lang?.[namespace]),
            ...translated(LangDynamic?.[namespace]),
          },
        ] as const,
    ),
  );
};

export type TranslationProviderSCCProps = {
  /** The namespaces the .NET page seeded, i.e. the component's `component.json` `translations`. */
  namespaces: readonly Namespace[];
  /** Defaults to `<html lang>`, then the .NET `locale-data` meta tag, then `en-us`. */
  locale?: Locale;
  children: ReactNode;
};

export const TranslationProviderSCC = ({
  namespaces,
  locale,
  children,
}: TranslationProviderSCCProps) => {
  // Callers pass an inline array, so key the memo on the contents rather than the identity.
  const namespaceKey = namespaces.join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const messages = useMemo(() => readMessages(namespaces), [namespaceKey]);

  return (
    <IntlProvider locale={locale ?? getLocaleFromDocument()} messages={messages}>
      {children}
    </IntlProvider>
  );
};
