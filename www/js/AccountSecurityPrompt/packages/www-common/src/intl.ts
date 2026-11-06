/**
 * Locale-aware formatting for dual-platform www (.NET MVC + Next.js).
 *
 * Mirrors the next-intl {@link useFormatter} surface for legacy component islands that
 * cannot import next-intl. Next Tier-0 pages should use `useFormatter` from
 * `@rbx/www-nextjs/i18n` instead.
 *
 * ## Locale resolution
 *
 * Legacy bundles rarely receive locale props. {@link getLocaleFromDocument} reads:
 * 1. `<html lang>` (same catalog check as `@rbx/www-nextjs/i18n/client` `getLocale`)
 * 2. `<meta name="locale-data">` on .NET (`internationalCore`)
 * 3. {@link defaultLocale}
 *
 * Prefer passing locale from the Next `[locale]` param via {@link createFormatter} or
 * {@link useFormatter} when mounting on Next.js.
 */
import { useMemo } from "react";
import { arrayIncludes } from "@rbx/core-lib";
import {
  defaultLocale,
  localeFromLowercaseUnderscore,
  localeFromUppercaseDash,
  localesLowercaseUnderscore,
  localesUppercaseDash,
  localeToUppercaseDash,
  type Locale,
} from "./locale";

export type DateTimeFormatOptions = Intl.DateTimeFormatOptions;
export type NumberFormatOptions = Intl.NumberFormatOptions;

/** Matches `@rbx/core-scripts/intl` meta selector (`localeConstants.js`). */
const localeMetaTagSelector = 'meta[name="locale-data"]';

function readLocaleFromHtmlLang(): Locale | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const { lang } = document.documentElement;
  if (!lang) {
    return undefined;
  }

  return arrayIncludes(localesUppercaseDash, lang) ? localeFromUppercaseDash(lang) : undefined;
}

function readLocaleFromMetaTag(): Locale | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const metaElement = document.querySelector(localeMetaTagSelector);
  if (!(metaElement instanceof HTMLMetaElement)) {
    return undefined;
  }

  const robloxLocaleCode = metaElement.dataset.languageCode;
  if (!robloxLocaleCode) {
    return undefined;
  }

  if (!arrayIncludes(localesLowercaseUnderscore, robloxLocaleCode)) {
    return undefined;
  }

  return localeFromLowercaseUnderscore(robloxLocaleCode);
}

/** Client document locale; matches `@rbx/www-nextjs/i18n/client` `getLocale`. */
export function getLocaleFromDocument(): Locale {
  return readLocaleFromHtmlLang() ?? readLocaleFromMetaTag() ?? defaultLocale;
}

function resolveLocaleForFormatting(explicit?: Locale): Locale {
  if (explicit) {
    return explicit;
  }

  return getLocaleFromDocument();
}

function toDate(value: Date | number): Date {
  return value instanceof Date ? value : new Date(value);
}

export type Formatter = {
  dateTime: (value: Date | number, options?: DateTimeFormatOptions) => string;
  number: (value: number, options?: NumberFormatOptions) => string;
};

/** Build a formatter for an explicit {@link Locale}. Use on the server or at the Next mount boundary. */
export function createFormatter(locale: Locale): Formatter {
  const formatDateTime = (value: Date | number, options?: DateTimeFormatOptions): string => {
    try {
      return new Intl.DateTimeFormat(localeToUppercaseDash(locale), options).format(toDate(value));
    } catch {
      return "";
    }
  };

  const formatNumberValue = (value: number, options?: NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(localeToUppercaseDash(locale), options).format(value);
    } catch {
      return String(value);
    }
  };

  return {
    dateTime: formatDateTime,
    number: formatNumberValue,
  };
}

/** Standalone formatter; resolves locale from the document on each call. */
export const format: Formatter = {
  dateTime: (value, options) =>
    createFormatter(resolveLocaleForFormatting()).dateTime(value, options),
  number: (value, options) => createFormatter(resolveLocaleForFormatting()).number(value, options),
};

/**
 * React hook with the same shape as next-intl `useFormatter`, for legacy component islands.
 * Pass an explicit {@link Locale} from the Next mount boundary when available.
 */
export function useFormatter(explicitLocale?: Locale): Formatter {
  const locale = explicitLocale ?? getLocaleFromDocument();
  return useMemo(() => createFormatter(locale), [locale]);
}
