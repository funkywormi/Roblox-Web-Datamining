import { arrayIncludes } from "@rbx/core-lib";

/**
 * Locales fully supported on desktop and mobile.
 *
 * All used translations for these locales must be present / fully translated.
 *
 * See: https://roblox.atlassian.net/wiki/spaces/IN/pages/1557596565/Supported+Languages#Player-Experience-(Mobile,-Desktop)
 */
export const fullySupportedLocales = [
  "ar-001",
  "de-de",
  "en-us",
  "es-es",
  "fr-fr",
  "hi-in",
  "id-id",
  "it-it",
  "ja-jp",
  "ko-kr",
  "pl-pl",
  "pt-br",
  "th-th",
  "tr-tr",
  "vi-vn",
  "zh-cn",
  "zh-tw",
] as const;

/**
 * Locales fully supported on desktop and mobile.
 *
 * All used translations for these locales must be present / fully translated.
 *
 * See: https://roblox.atlassian.net/wiki/spaces/IN/pages/1557596565/Supported+Languages#Player-Experience-(Mobile,-Desktop)
 */
export type FullySupportedLocale = (typeof fullySupportedLocales)[number];

/**
 * Locales that we allow auth-ed users to switch to, but these are not fully supported on desktop and mobile.
 *
 * Missing translations for these locales fall back to another locale based off {@link fallbackLocales}.
 */
export const partiallySupportedLocales = [
  "bg-bg",
  "bn-bd",
  "bs-ba",
  "cs-cz",
  "da-dk",
  "el-gr",
  "en-gb",
  "es-mx",
  "et-ee",
  "fi-fi",
  "fil-ph",
  "fr-ca",
  "hr-hr",
  "hu-hu",
  "ka-ge",
  "kk-kz",
  "km-kh",
  "lt-lt",
  "lv-lv",
  "ms-my",
  "my-mm",
  "nb-no",
  "nl-nl",
  "pt-pt",
  "ro-ro",
  "ru-ru",
  "si-lk",
  "sk-sk",
  "sl-sl",
  "sq-al",
  "sr-rs",
  "sv-se",
  "uk-ua",
] as const;

/**
 * Additional locales that we allow auth-ed users to switch to, but these are not fully supported on desktop and mobile.
 *
 * Missing translations for these locales fall back to another locale based off {@link fallbackLocales}.
 */
export type PartiallySupportedLocale = (typeof partiallySupportedLocales)[number];

type NoIntersection<A, B> = A & B extends never ? true : never;
const _0: NoIntersection<FullySupportedLocale, PartiallySupportedLocale> = true;

/**
 * All fully and partially supported locales.
 *
 * See {@link fullySupportedLocales} and {@link partiallySupportedLocales}.
 */
export const locales = [...fullySupportedLocales, ...partiallySupportedLocales] as const;

/**
 * All fully and partially supported locales.
 *
 * See {@link FullySupportedLocale} and {@link PartiallySupportedLocale}.
 */
export type Locale = (typeof locales)[number];

export const defaultLocale = "en-us" as const satisfies Locale;
export const defaultLocaleLowercaseDash = "en-us" as const satisfies LocaleLowercaseDash;
export const defaultLocaleUppercaseDash = "en-US" as const satisfies LocaleUppercaseDash;
export const defaultLocaleLowercaseUnderscore =
  "en_us" as const satisfies LocaleLowercaseUnderscore;

export const defaultLanguage = "en" as const satisfies Language;

/** Fallback locales for {@link partiallySupportedLocales}. */
export const fallbackLocales = {
  "bg-bg": defaultLocale,
  "bn-bd": defaultLocale,
  "bs-ba": defaultLocale,
  "cs-cz": defaultLocale,
  "da-dk": defaultLocale,
  "el-gr": defaultLocale,
  "en-gb": "en-us",
  "es-mx": "es-es",
  "et-ee": defaultLocale,
  "fi-fi": defaultLocale,
  "fil-ph": defaultLocale,
  "fr-ca": "fr-fr",
  "hr-hr": defaultLocale,
  "hu-hu": defaultLocale,
  "ka-ge": defaultLocale,
  "kk-kz": defaultLocale,
  "km-kh": defaultLocale,
  "lt-lt": defaultLocale,
  "lv-lv": defaultLocale,
  "ms-my": defaultLocale,
  "my-mm": defaultLocale,
  "nb-no": defaultLocale,
  "nl-nl": defaultLocale,
  "pt-pt": "pt-br",
  "ro-ro": defaultLocale,
  "ru-ru": defaultLocale,
  "si-lk": defaultLocale,
  "sk-sk": defaultLocale,
  "sl-sl": defaultLocale,
  "sq-al": defaultLocale,
  "sr-rs": defaultLocale,
  "sv-se": defaultLocale,
  "uk-ua": defaultLocale,
} as const satisfies Record<PartiallySupportedLocale, FullySupportedLocale>;

export const fullySupportedLocalesLowercaseDash = fullySupportedLocales;
export const partiallySupportedLocalesLowercaseDash = partiallySupportedLocales;
export const localesLowercaseDash = locales;

export const fullySupportedLocalesLowercaseUnderscore = [
  "ar_001",
  "de_de",
  "en_us",
  "es_es",
  "fr_fr",
  "hi_in",
  "id_id",
  "it_it",
  "ja_jp",
  "ko_kr",
  "pl_pl",
  "pt_br",
  "th_th",
  "tr_tr",
  "vi_vn",
  "zh_cn",
  "zh_tw",
] as const;

export const partiallySupportedLocalesLowercaseUnderscore = [
  "bg_bg",
  "bn_bd",
  "bs_ba",
  "cs_cz",
  "da_dk",
  "el_gr",
  "en_gb",
  "es_mx",
  "et_ee",
  "fi_fi",
  "fil_ph",
  "fr_ca",
  "hr_hr",
  "hu_hu",
  "ka_ge",
  "kk_kz",
  "km_kh",
  "lt_lt",
  "lv_lv",
  "ms_my",
  "my_mm",
  "nb_no",
  "nl_nl",
  "pt_pt",
  "ro_ro",
  "ru_ru",
  "si_lk",
  "sk_sk",
  "sl_sl",
  "sq_al",
  "sr_rs",
  "sv_se",
  "uk_ua",
] as const;

export const localesLowercaseUnderscore = [
  ...fullySupportedLocalesLowercaseUnderscore,
  ...partiallySupportedLocalesLowercaseUnderscore,
] as const;

export const fullySupportedLocalesUppercaseDash = [
  "ar-001",
  "de-DE",
  "en-US",
  "es-ES",
  "fr-FR",
  "hi-IN",
  "id-ID",
  "it-IT",
  "ja-JP",
  "ko-KR",
  "pl-PL",
  "pt-BR",
  "th-TH",
  "tr-TR",
  "vi-VN",
  "zh-CN",
  "zh-TW",
] as const;

export const partiallySupportedLocalesUppercaseDash = [
  "bg-BG",
  "bn-BD",
  "bs-BA",
  "cs-CZ",
  "da-DK",
  "el-GR",
  "en-GB",
  "es-MX",
  "et-EE",
  "fi-FI",
  "fil-PH",
  "fr-CA",
  "hr-HR",
  "hu-HU",
  "ka-GE",
  "kk-KZ",
  "km-KH",
  "lt-LT",
  "lv-LV",
  "ms-MY",
  "my-MM",
  "nb-NO",
  "nl-NL",
  "pt-PT",
  "ro-RO",
  "ru-RU",
  "si-LK",
  "sk-SK",
  "sl-SL",
  "sq-AL",
  "sr-RS",
  "sv-SE",
  "uk-UA",
] as const;

export const localesUppercaseDash = [
  ...fullySupportedLocalesUppercaseDash,
  ...partiallySupportedLocalesUppercaseDash,
] as const;

type LengthMatches<A, B> = A extends { readonly length: infer L1 }
  ? B extends { readonly length: L1 }
    ? B extends { readonly length: infer L2 }
      ? A extends { readonly length: L2 }
        ? true
        : never
      : never
    : never
  : never;
const _1: LengthMatches<typeof fullySupportedLocales, typeof fullySupportedLocalesLowercaseDash> =
  true;
const _2: LengthMatches<
  typeof partiallySupportedLocales,
  typeof partiallySupportedLocalesLowercaseDash
> = true;
const _3: LengthMatches<typeof locales, typeof localesLowercaseDash> = true;

const _4: LengthMatches<
  typeof fullySupportedLocales,
  typeof fullySupportedLocalesLowercaseUnderscore
> = true;
const _5: LengthMatches<
  typeof partiallySupportedLocales,
  typeof partiallySupportedLocalesLowercaseUnderscore
> = true;
const _6: LengthMatches<typeof locales, typeof localesLowercaseUnderscore> = true;

const _7: LengthMatches<typeof locales, typeof localesUppercaseDash> = true;
const _8: LengthMatches<typeof fullySupportedLocales, typeof fullySupportedLocalesUppercaseDash> =
  true;
const _9: LengthMatches<
  typeof partiallySupportedLocales,
  typeof partiallySupportedLocalesUppercaseDash
> = true;

export type PartiallySupportedLocaleLowercaseDash =
  (typeof partiallySupportedLocalesLowercaseDash)[number];
export type FullySupportedLocaleLowercaseDash = (typeof fullySupportedLocalesLowercaseDash)[number];
export type LocaleLowercaseDash = (typeof localesLowercaseDash)[number];

export type PartiallySupportedLocaleLowercaseUnderscore =
  (typeof partiallySupportedLocalesLowercaseUnderscore)[number];
export type FullySupportedLocaleLowercaseUnderscore =
  (typeof fullySupportedLocalesLowercaseUnderscore)[number];
export type LocaleLowercaseUnderscore = (typeof localesLowercaseUnderscore)[number];

export type LocaleUppercaseDash = (typeof localesUppercaseDash)[number];
export type PartiallySupportedLocaleUppercaseDash =
  (typeof partiallySupportedLocalesUppercaseDash)[number];
export type FullySupportedLocaleUppercaseDash = (typeof fullySupportedLocalesUppercaseDash)[number];

const _10: NoIntersection<
  FullySupportedLocaleLowercaseDash,
  PartiallySupportedLocaleLowercaseDash
> = true;
const _11: NoIntersection<
  FullySupportedLocaleLowercaseUnderscore,
  PartiallySupportedLocaleLowercaseUnderscore
> = true;
const _12: NoIntersection<
  FullySupportedLocaleUppercaseDash,
  PartiallySupportedLocaleUppercaseDash
> = true;

export const localeToLowercaseDash = (locale: Locale): LocaleLowercaseDash => locale;

export const localeToLowercaseUnderscore = (locale: Locale): LocaleLowercaseUnderscore =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  locale.replace("-", "_").toLowerCase() as LocaleLowercaseUnderscore;

export const localeToUppercaseDash = (locale: Locale): LocaleUppercaseDash => {
  const [lang, country] = locale.split("-");
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return `${lang}-${country?.toUpperCase()}` as LocaleUppercaseDash;
};

export const localeFromLowercaseDash = (locale: LocaleLowercaseDash): Locale => locale;

export const localeFromLowercaseUnderscore = (locale: LocaleLowercaseUnderscore): Locale =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  locale.replace("_", "-") as Locale;

export const localeFromUppercaseDash = (locale: LocaleUppercaseDash): Locale =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  locale.toLowerCase() as Locale;

/**
 * Locales that we allow as a prefix in URLs.
 *
 * Users (both auth and un-auth) will be permanently redirected to the same page with a language code prefix.
 * E.g., `/de-de` becomes `/de` and `/home` becomes `/de/home`.
 */
export const urlLocalePrefixes = [
  "ar-001",
  "de-de",
  "es-es",
  "fr-fr",
  "hi-in",
  "id-id",
  "it-it",
  "ja-jp",
  "ko-kr",
  "pl-pl",
  "pt-br",
  "th-th",
  "tr-tr",
  "vi-vn",
] as const satisfies Locale[];

/**
 * Locales that we allow as a prefix in URLs.
 *
 * See {@link urlLocalePrefixes}.
 */
export type UrlLocalePrefix = (typeof urlLocalePrefixes)[number];

/** The mapping from {@link UrlLocalePrefix} to {@link UrlLanguagePrefix}. */
export const urlLocalePrefixToLanguage = {
  "ar-001": "ar",
  "de-de": "de",
  "es-es": "es",
  "fr-fr": "fr",
  "hi-in": "hi",
  "it-it": "it",
  "id-id": "id",
  "ko-kr": "ko",
  "ja-jp": "ja",
  "th-th": "th",
  "pl-pl": "pl",
  "pt-br": "pt",
  "tr-tr": "tr",
  "vi-vn": "vi",
} as const satisfies Record<UrlLocalePrefix, UrlLanguagePrefix>;

/** Language codes that we allow as a prefix in URLs. */
export const urlLanguagePrefixes = [
  "ar",
  "de",
  "es",
  "fr",
  "hi",
  "id",
  "it",
  "ja",
  "ko",
  "pl",
  "pt",
  "th",
  "tr",
  "vi",
] as const satisfies Language[];

/**
 * Language codes that we allow as a prefix in URLs.
 *
 * See {@link urlLanguagePrefixes}.
 */
export type UrlLanguagePrefix = (typeof urlLanguagePrefixes)[number];

/** The mapping from {@link UrlLanguagePrefix} to {@link UrlLocalePrefix}. */
export const urlLanguagePrefixToLocale = {
  ar: "ar-001",
  de: "de-de",
  es: "es-es",
  fr: "fr-fr",
  hi: "hi-in",
  it: "it-it",
  id: "id-id",
  ko: "ko-kr",
  ja: "ja-jp",
  th: "th-th",
  pl: "pl-pl",
  pt: "pt-br",
  tr: "tr-tr",
  vi: "vi-vn",
} as const satisfies Record<UrlLanguagePrefix, UrlLocalePrefix>;

/**
 * All language codes and locales that we allow as URL prefixes.
 *
 * See {@link urlLanguagePrefixes} and {@link urlLocalePrefixes}.
 */
export const urlLanguageOrLocalePrefixes = [...urlLanguagePrefixes, ...urlLocalePrefixes] as const;

/**
 * All language codes and locales that we allow as URL prefixes.
 *
 * See {@link urlLanguageOrLocalePrefixes}.
 */
export type UrlLanguageOrLocalePrefix = (typeof urlLanguageOrLocalePrefixes)[number];

/**
 * Removes a supported language prefix from a pathname.
 *
 * @example stripLocalePrefix("/fr/home") returns "/home".
 * @example stripLocalePrefix("/home") returns "/home".
 */
export const stripLocalePrefix = (pathname: string): string => {
  if (!pathname.startsWith("/")) {
    return pathname;
  }

  const separatorIndex = pathname.indexOf("/", 1);
  const firstSegment =
    separatorIndex === -1 ? pathname.substring(1) : pathname.substring(1, separatorIndex);
  const normalizedFirstSegment = firstSegment.toLowerCase();
  // Locale and default-language prefixes are redirected to a language prefix or
  // no prefix by the web platform.
  const hasLocalePrefix = arrayIncludes(urlLanguagePrefixes, normalizedFirstSegment);

  if (!hasLocalePrefix) {
    return pathname;
  }

  return separatorIndex === -1 ? "/" : pathname.substring(separatorIndex);
};

/** Language code-like strings found in the `robloxctx-account-language-code` header. */
export const languages = [
  "ar",
  "bg",
  "bn",
  "bs",
  "cs",
  "da",
  "de",
  "el",
  "en",
  "es",
  "et",
  "fi",
  "fil",
  "fr",
  "hi",
  "hr",
  "hu",
  "id",
  "it",
  "ja",
  "ka",
  "kk",
  "km",
  "ko",
  "lt",
  "lv",
  "ms",
  "my",
  "nb",
  "nl",
  "pl",
  "pt",
  "ro",
  "ru",
  "si",
  "sk",
  "sl",
  "sq",
  "sr",
  "sv",
  "th",
  "tr",
  "uk",
  "vi",
  "zh-hans",
  "zh-hant",
] as const;

export type Language = (typeof languages)[number];

// TODO: how does this handle multiple locales in a language? E.g., fr-ca, en-uk, es-mx, or pt-pt?

/** The mapping from {@link Language}s to {@link Locale}s. */
export const languageToLocale = {
  ar: "ar-001",
  bg: "bg-bg",
  bn: "bn-bd",
  bs: "bs-ba",
  cs: "cs-cz",
  da: "da-dk",
  de: "de-de",
  el: "el-gr",
  en: "en-us",
  es: "es-es",
  et: "et-ee",
  fi: "fi-fi",
  fil: "fil-ph",
  fr: "fr-fr",
  hi: "hi-in",
  hr: "hr-hr",
  hu: "hu-hu",
  id: "id-id",
  it: "it-it",
  ja: "ja-jp",
  ka: "ka-ge",
  kk: "kk-kz",
  km: "km-kh",
  ko: "ko-kr",
  lt: "lt-lt",
  lv: "lv-lv",
  ms: "ms-my",
  my: "my-mm",
  nb: "nb-no",
  nl: "nl-nl",
  pl: "pl-pl",
  pt: "pt-br",
  ro: "ro-ro",
  ru: "ru-ru",
  si: "si-lk",
  sk: "sk-sk",
  sl: "sl-sl",
  sq: "sq-al",
  sr: "sr-rs",
  sv: "sv-se",
  th: "th-th",
  tr: "tr-tr",
  uk: "uk-ua",
  vi: "vi-vn",
  "zh-hans": "zh-cn",
  "zh-hant": "zh-tw",
} as const satisfies Record<Language, Locale>;

export const rtlLocales = ["ar-001"] as const satisfies Locale[];
