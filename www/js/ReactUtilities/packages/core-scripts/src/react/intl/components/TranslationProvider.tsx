import { JSX, createContext } from "react";
import Intl from "@rbx/core-scripts/intl";
import { TranslationResourceProvider } from "@rbx/core-scripts/intl/translation";
import { OnEmptyString, TranslationConfig, WithTranslationsProps } from "../../intl";
import { validateTranslationConfig } from "../validateTranslationConfig";

const createTranslationContext = (
  translationConfig: TranslationConfig,
  onEmptyString?: OnEmptyString,
) => {
  const validatedConfig = validateTranslationConfig(translationConfig);
  const intl = new Intl();
  const translationProvider = new TranslationResourceProvider(intl);
  const translationResources = validatedConfig.map(namespace =>
    translationProvider.getTranslationResource(namespace),
  );
  const languageResources = translationProvider.mergeTranslationResources(...translationResources);

  const translate = (
    key: string,
    parameters?: Record<string, unknown>,
    fallbackString?: string,
  ): string => {
    const result = languageResources.get(key, parameters) as string | undefined;
    if (!result && onEmptyString) {
      onEmptyString(key, intl.locale);
    }

    return result && result.length > 0 ? result : (fallbackString ?? "");
  };

  return { translate, intl };
};

export const TranslationContext = createContext<WithTranslationsProps | undefined>(undefined);

/**
 * Wraps the ReactNode with `WithTranslationProps. Also see
 * ./hooks/useTranslation on how to conveniently access the context provided
 * here.
 */
export function TranslationProvider({
  config,
  children,
  onEmptyString,
}: {
  config: TranslationConfig;
  children: React.ReactNode;
  onEmptyString?: OnEmptyString;
}): JSX.Element {
  return (
    <TranslationContext.Provider value={createTranslationContext(config, onEmptyString)}>
      {children}
    </TranslationContext.Provider>
  );
}
