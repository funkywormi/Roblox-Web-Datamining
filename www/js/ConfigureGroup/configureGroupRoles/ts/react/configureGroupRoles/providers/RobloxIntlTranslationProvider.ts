import { EnvironmentUrls } from 'Roblox';
import {
  Locale,
  LocaleInfo,
  RobloxLocale,
  TranslationResource,
  TranslationResourceProviderBase,
  toLocale,
  toLocaleNativeName,
  toRobloxLocaleCode
} from '@rbx/intl';

const isRobloxLocale = (value: string): value is RobloxLocale =>
  (Object.values(RobloxLocale) as string[]).includes(value);

// 10 is the BaristaFrontend consumer enum value used by the translations pipeline.
const TRANSLATIONS_CDN_CONSUMER = '10';

type SupportedLocalesResponse = {
  generalExperience?: {
    locale?: string;
  };
};

type CdnTranslationResponse = Record<string, { localizedString: string } | null>;

/**
 * Concrete `@rbx/intl` translation provider for the Groups WebApp.
 *
 * Modeled after creator-hub's `TranslationResourceProvider`, but adapted for the
 * web-frontend runtime: the current locale is resolved from the Roblox locale API
 * (via `EnvironmentUrls`) rather than a generated client, and translation resources
 * are fetched from the translations CDN keyed off the current site domain.
 */
export default class RobloxIntlTranslationProvider extends TranslationResourceProviderBase {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor -- the inherited constructor is protected
  constructor(defaultLocaleInfo: LocaleInfo, fallbackLocale?: Locale) {
    super(defaultLocaleInfo, fallbackLocale);
  }

  async loadRuntimeLocaleInfo(): Promise<LocaleInfo> {
    try {
      const url = `${EnvironmentUrls.localeApi}/v1/locales/user-localization-locus-supported-locales`;
      const response = await fetch(url, { credentials: 'include' });
      if (!response.ok) {
        return this.defaultLocaleInfo;
      }

      const data = (await response.json()) as SupportedLocalesResponse;
      const robloxLocale = data.generalExperience?.locale;

      if (typeof robloxLocale === 'undefined') {
        return this.defaultLocaleInfo;
      }

      if (isRobloxLocale(robloxLocale)) {
        const locale = toLocale(robloxLocale);
        return {
          locale,
          nativeName: toLocaleNativeName(locale)
        };
      }

      // eslint-disable-next-line no-console -- intended logging for unexpected locales
      console.warn(`Unexpected locale ${robloxLocale} received, fallback to default locale`);
      return this.defaultLocaleInfo;
    } catch {
      return this.defaultLocaleInfo;
    }
  }

  // eslint-disable-next-line class-methods-use-this -- concrete implementation for fetching translation resources
  protected async fetchTranslationResource(
    namespace: string,
    locale: Locale
  ): Promise<TranslationResource> {
    const cdnLocale = toRobloxLocaleCode(locale); // 'en-US' → 'en_us'
    const cdnDomain = EnvironmentUrls.domain;
    const url = `https://translations-cdn.${cdnDomain}/${TRANSLATIONS_CDN_CONSUMER}/latest/${cdnLocale}/${namespace}.json`;

    const cdnResponse = (await fetch(url).then(res => res.json())) as CdnTranslationResponse;

    const result: TranslationResource = {};
    Object.keys(cdnResponse).forEach(key => {
      result[key] = cdnResponse[key]?.localizedString ?? null;
    });

    return result;
  }
}
