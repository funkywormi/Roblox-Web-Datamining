import { asianLocaleList } from "../constants/localeConstants";

export const toRobloxLocale = localeCode => localeCode.replace(/-/g, "_");

export const toISOLocale = localeCode => localeCode.replace(/_/g, "-");

export const isAsianLanguage = locale => Boolean(locale && asianLocaleList.includes(locale));
