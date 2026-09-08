import type { FunctionComponent } from 'react';
import React, { useCallback, useMemo } from 'react';
import type LocaleInfo from '../interfaces/LocaleInfo';
import type TranslationResource from '../interfaces/TranslationResource';
import type { LocalizationType } from '../LocalizationContext';
import LocalizationContext from '../LocalizationContext';
import type { TranslationResourceType } from '../TranslationResourceContext';
import TranslationResourceContext from '../TranslationResourceContext';
import { buildNamespacedResources } from '../utils/buildNamespacedResources';

export interface StaticTranslationProviderProps {
  resourceKey?: string;
  localeInfo: LocaleInfo;
  resources: TranslationResource[];
  namespaces?: string[];
}

const StaticTranslationProvider: FunctionComponent<
  React.PropsWithChildren<StaticTranslationProviderProps>
> = ({ resourceKey, localeInfo, resources, namespaces, children }) => {
  // locale context
  const setLocaleInfo = useCallback(() => {
    // eslint-disable-next-line no-console
    console.warn('setLocale is not supported under StaticTranslationProvider.');
  }, []);

  const localizationContextValue = useMemo<LocalizationType>(
    () => ({ ready: true, localeInfo, setLocaleInfo }),
    [localeInfo, setLocaleInfo],
  );

  // translation resource content
  const translationResourceContextValue = useMemo<TranslationResourceType>(
    () => ({
      key: resourceKey,
      ready: true,
      resources: buildNamespacedResources(resources, namespaces),
    }),
    [resourceKey, resources, namespaces],
  );

  return (
    <LocalizationContext.Provider value={localizationContextValue}>
      <TranslationResourceContext.Provider value={translationResourceContextValue}>
        {children}
      </TranslationResourceContext.Provider>
    </LocalizationContext.Provider>
  );
};

export default StaticTranslationProvider;
