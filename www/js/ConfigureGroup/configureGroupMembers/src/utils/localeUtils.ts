import Locale from '../enums/Locale';
import NativeName from '../enums/NativeName';
import RobloxLocale from '../enums/RobloxLocale';

const localeToRobloxLocaleMap: Record<Locale, RobloxLocale> = {
  [Locale.English]: RobloxLocale.English,
  [Locale.Spanish]: RobloxLocale.Spanish,
  [Locale.French]: RobloxLocale.French,
  [Locale.German]: RobloxLocale.German,
  [Locale.Italian]: RobloxLocale.Italian,
  [Locale.BrazilPortuguese]: RobloxLocale.BrazilPortuguese,
  [Locale.Korean]: RobloxLocale.Korean,
  [Locale.SimplifiedChinese]: RobloxLocale.SimplifiedChinese,
  [Locale.SimplifiedChineseJV]: RobloxLocale.SimplifiedChineseJV,
  [Locale.TraditionalChinese]: RobloxLocale.TraditionalChinese,
  [Locale.Japanese]: RobloxLocale.Japanese,
  [Locale.Russian]: RobloxLocale.Russian,
  [Locale.Indonesian]: RobloxLocale.Indonesian,
  [Locale.Polish]: RobloxLocale.Polish,
  [Locale.Vietnamese]: RobloxLocale.Vietnamese,
  [Locale.Turkish]: RobloxLocale.Turkish,
  [Locale.Arabic]: RobloxLocale.Arabic,
  [Locale.Thai]: RobloxLocale.Thai,
  [Locale.Hindi]: RobloxLocale.Hindi,
};

const robloxLocaleToLocaleMap: Record<RobloxLocale, Locale> = {
  [RobloxLocale.English]: Locale.English,
  [RobloxLocale.Spanish]: Locale.Spanish,
  [RobloxLocale.French]: Locale.French,
  [RobloxLocale.German]: Locale.German,
  [RobloxLocale.Italian]: Locale.Italian,
  [RobloxLocale.BrazilPortuguese]: Locale.BrazilPortuguese,
  [RobloxLocale.Korean]: Locale.Korean,
  [RobloxLocale.SimplifiedChinese]: Locale.SimplifiedChinese,
  [RobloxLocale.SimplifiedChineseJV]: Locale.SimplifiedChineseJV,
  [RobloxLocale.TraditionalChinese]: Locale.TraditionalChinese,
  [RobloxLocale.Japanese]: Locale.Japanese,
  [RobloxLocale.Russian]: Locale.Russian,
  [RobloxLocale.Indonesian]: Locale.Indonesian,
  [RobloxLocale.Polish]: Locale.Polish,
  [RobloxLocale.Vietnamese]: Locale.Vietnamese,
  [RobloxLocale.Turkish]: Locale.Turkish,
  [RobloxLocale.Arabic]: Locale.Arabic,
  [RobloxLocale.Thai]: Locale.Thai,
  [RobloxLocale.Hindi]: Locale.Hindi,
};

const localeToNativeNameMap: Record<Locale, NativeName> = {
  [Locale.English]: NativeName.English,
  [Locale.Spanish]: NativeName.Spanish,
  [Locale.French]: NativeName.French,
  [Locale.German]: NativeName.German,
  [Locale.Italian]: NativeName.Italian,
  [Locale.BrazilPortuguese]: NativeName.BrazilPortuguese,
  [Locale.Korean]: NativeName.Korean,
  [Locale.SimplifiedChinese]: NativeName.SimplifiedChinese,
  [Locale.SimplifiedChineseJV]: NativeName.SimplifiedChineseJV,
  [Locale.TraditionalChinese]: NativeName.TraditionalChinese,
  [Locale.Japanese]: NativeName.Japanese,
  [Locale.Russian]: NativeName.Russian,
  [Locale.Indonesian]: NativeName.Indonesian,
  [Locale.Polish]: NativeName.Polish,
  [Locale.Vietnamese]: NativeName.Vietnamese,
  [Locale.Turkish]: NativeName.Turkish,
  [Locale.Arabic]: NativeName.Arabic,
  [Locale.Thai]: NativeName.Thai,
  [Locale.Hindi]: NativeName.Hindi,
};

const robloxLocaleToNativeNameMap: Record<RobloxLocale, NativeName> = {
  [RobloxLocale.English]: NativeName.English,
  [RobloxLocale.Spanish]: NativeName.Spanish,
  [RobloxLocale.French]: NativeName.French,
  [RobloxLocale.German]: NativeName.German,
  [RobloxLocale.Italian]: NativeName.Italian,
  [RobloxLocale.BrazilPortuguese]: NativeName.BrazilPortuguese,
  [RobloxLocale.Korean]: NativeName.Korean,
  [RobloxLocale.SimplifiedChinese]: NativeName.SimplifiedChinese,
  [RobloxLocale.SimplifiedChineseJV]: NativeName.SimplifiedChineseJV,
  [RobloxLocale.TraditionalChinese]: NativeName.TraditionalChinese,
  [RobloxLocale.Japanese]: NativeName.Japanese,
  [RobloxLocale.Russian]: NativeName.Russian,
  [RobloxLocale.Indonesian]: NativeName.Indonesian,
  [RobloxLocale.Polish]: NativeName.Polish,
  [RobloxLocale.Vietnamese]: NativeName.Vietnamese,
  [RobloxLocale.Turkish]: NativeName.Turkish,
  [RobloxLocale.Arabic]: NativeName.Arabic,
  [RobloxLocale.Thai]: NativeName.Thai,
  [RobloxLocale.Hindi]: NativeName.Hindi,
};

const robloxLocaleCodeRegex = /^(\w+)_(\w+)$/;
const localeCodeRegex = /^(\w+)-(\w+)$/;

export const toRobloxLocale = (locale: Locale): RobloxLocale => localeToRobloxLocaleMap[locale];

export const toLocale = (robloxLocale: RobloxLocale): Locale =>
  robloxLocaleToLocaleMap[robloxLocale];

export const toRobloxLocaleCode = (localeCode: string): string =>
  localeCode.replace(
    localeCodeRegex,
    (_, language: string, country: string) => `${language.toLowerCase()}_${country.toLowerCase()}`,
  );

export const toLocaleCode = (robloxLocaleCode: string): string =>
  robloxLocaleCode.replace(
    robloxLocaleCodeRegex,
    (_, language: string, country: string) => `${language.toLowerCase()}-${country.toUpperCase()}`,
  );

export const toRobloxLocaleNativeName = (robloxLocale: RobloxLocale): NativeName =>
  robloxLocaleToNativeNameMap[robloxLocale];

export const toLocaleNativeName = (locale: Locale): NativeName => localeToNativeNameMap[locale];
