import React, { createContext, useContext, useMemo, PropsWithChildren } from 'react';
import { TranslationConfig } from "@rbx/core-scripts/legacy/react-utilities";
import { translateHtmlLegacy } from '@rbx/translation-utils';
import { TranslateFn, TranslateHtml, TranslationResource } from './types';
import { createTranslationBase } from './createBase';

/**
 * Creates a translation instance that we'll use in the provider and hook for
 * translation through the app. Generally, we'll only have one of these.
 */
export const createTranslationProvider = (config: TranslationConfig): TranslationResource => {
  const { resource, intl } = createTranslationBase(config);

  const translate: TranslateFn = (key, params = {}) => {
    // Return empty string if the translation key is not given
    if (key === '') {
      return '';
    }

    const humanLabel = resource.get(key, params);
    if (!humanLabel) {
      return `${key} ${Object.values(params).join(',')}`;
    }
    return humanLabel;
  };

  const translateHtml: TranslateHtml = (key, params) =>
    translateHtmlLegacy(translate, key, params);

  return {
    translate,
    intl,
    translateHtml
  };
};

/**
 * Context to pass the translation provider around.
 * Note: There is a global one in react-utilities that we could look at using
 * once (or if) it gets deployed.
 */
const TranslationContext = createContext<TranslationResource | undefined>(undefined);

/**
 * Provider for the translation provider
 */
export const TranslationProvider: React.FC<
  PropsWithChildren<{ translationConfig: TranslationConfig }>
> = ({ translationConfig, children }) => {
  const resource = useMemo(() => createTranslationProvider(translationConfig), []);
  return <TranslationContext.Provider value={resource}>{children}</TranslationContext.Provider>;
};

/**
 * Access the translation provider in components
 */
export const useTranslations = (): TranslationResource => {
  const resource = useContext(TranslationContext);
  if (!resource) {
    throw new Error('useTranslations must be used within a TranslationProvider');
  }
  return resource;
};
