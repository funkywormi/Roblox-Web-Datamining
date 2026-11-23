import { createContext, useContext, type ReactNode } from "react";
import type { HtmlTag } from "@rbx/www-common/i18n";

type TranslationValues = Record<string, string | number | Date>;

export type NamespaceTranslator = {
  (key: string, values?: TranslationValues): string;
  has: (key: string) => boolean;
  dynamic: (key: string, values?: TranslationValues, fallback?: string) => string;
  html: (key: string, tags: readonly HtmlTag[], values?: TranslationValues) => ReactNode;
};

export type ItemsTranslate = {
  (key: string, values?: TranslationValues): string;
  has: (key: string) => boolean;
  html: (key: string, tags: readonly HtmlTag[], values?: TranslationValues) => ReactNode;
};

export const createItemsTranslate = (
  translators: readonly NamespaceTranslator[],
): ItemsTranslate => {
  const find = (key: string) => translators.find(translator => translator.has(key));

  const translate = (key: string, values?: TranslationValues) => {
    const translator = find(key);
    if (translator) {
      return translator(key, values);
    }
    return translators[0]?.dynamic(key, values, key) ?? key;
  };

  const html = (key: string, tags: readonly HtmlTag[], values?: TranslationValues) =>
    (find(key) ?? translators[0])?.html(key, tags, values) ?? null;

  const has = (key: string) => find(key) !== undefined;

  return Object.assign(translate, { has, html });
};

const ItemsTranslateContext = createContext<ItemsTranslate>(createItemsTranslate([]));

export const ItemsTranslateProvider = ItemsTranslateContext.Provider;

export const useItemsTranslate = (): ItemsTranslate => useContext(ItemsTranslateContext);
