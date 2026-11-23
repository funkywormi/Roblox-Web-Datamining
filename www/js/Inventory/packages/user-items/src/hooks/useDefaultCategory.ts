import { useTranslations, type Translator } from "@rbx/www-common/i18n";

const translateIfPresent = (translator: Translator<"Common.AssetTypes">, key: string): string =>
  translator.has(key) ? translator(key) : "";

const useDefaultCategory = (): string => {
  const label = translateIfPresent(useTranslations("Common.AssetTypes"), "Label.Accessories");
  return (label || "accessories").toLowerCase();
};

export default useDefaultCategory;
