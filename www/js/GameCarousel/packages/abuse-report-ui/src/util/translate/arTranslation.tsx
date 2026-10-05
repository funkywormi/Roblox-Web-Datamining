import { createContext, useContext, useMemo } from "react";
import { Intl } from "@rbx/core-scripts/legacy/Roblox";

import { translate, translateToStringOnly, TranslateInputOrString } from "./translate";

interface ArTranslationContextValue {
  translate: (input: TranslateInputOrString) => string | React.ReactNode[];
  translateToStringOnly: (input: TranslateInputOrString) => string;
}

export const ArTranslationContext = createContext<ArTranslationContextValue | undefined>(undefined);

interface ArTranslationProviderProps {
  translations: Record<string, string>;
  intl?: Intl;
  children: React.ReactNode;
}

/**
 * Provider for the ArTranslationContext.
 * Expects a set of translations to be provided, which should be provided by the
 * config that also drives the UI/Flow.
 */
export const ArTranslationProvider = ({
  translations,
  intl: providedIntl,
  children,
}: ArTranslationProviderProps): React.ReactElement => {
  const intl = useMemo(() => providedIntl ?? new Intl(), [providedIntl]);

  const methods = useMemo(() => {
    const boundTranslate = (input: TranslateInputOrString) => translate(translations, intl, input);
    const boundTranslateToStringOnly = (input: TranslateInputOrString) =>
      translateToStringOnly(translations, intl, input);

    return { translate: boundTranslate, translateToStringOnly: boundTranslateToStringOnly };
  }, [translations, intl]);

  return <ArTranslationContext.Provider value={methods}>{children}</ArTranslationContext.Provider>;
};

export const useArTranslation = (): ArTranslationContextValue => {
  const context = useContext(ArTranslationContext);

  if (!context) {
    throw new Error(
      "Invalid use of `useArTranslation` hook. Ensure your component has an ancestor wrapped in `ArTranslationProvider`",
    );
  }

  return context;
};
