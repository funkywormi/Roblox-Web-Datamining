import type { ComponentType } from 'react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import type NamespacedResources from '../interfaces/NamespacedResources';
import LocalizationContext from '../LocalizationContext';
import type { TranslationResourceType } from '../TranslationResourceContext';
import TranslationResourceContext from '../TranslationResourceContext';
import translationResourceProviderContext from '../TranslationResourceProviderContext';
import { buildNamespacedResources } from '../utils/buildNamespacedResources';

// TODO: this could support a fallback UI while the translation resources
// is loading for better user experience
export default function withTranslation<T extends object>(
  WrappedComponent: ComponentType<T>,
  namespaces: string[],
) {
  const displayName = WrappedComponent.displayName ?? WrappedComponent.name ?? 'Component';

  const WithTranslation = (props: T) => {
    const localization = useContext(LocalizationContext);
    const { provider } = useContext(translationResourceProviderContext);

    // store translation resources in state
    const [resources, setResources] = useState<NamespacedResources | null>(() => {
      let initialTranslationResource: NamespacedResources | null = null;
      if (localization?.ready && provider !== null) {
        const {
          localeInfo: { locale },
        } = localization;
        const translationResources = provider.getTranslationResources(namespaces, locale);

        if (translationResources !== null) {
          initialTranslationResource = buildNamespacedResources(translationResources, namespaces);
        }
      } else {
        if (typeof localization === 'undefined') {
          // eslint-disable-next-line no-console
          console.warn(
            'Localization context is missing, withTranslation cannot work outside of the LocalizationProvider',
          );
        }

        if (provider === null) {
          // eslint-disable-next-line no-console
          console.warn(
            'TranslationResourceProvider context is missing, withTranslation cannot work outside of the TranslationResourceProvider',
          );
        }
      }
      return initialTranslationResource;
    });

    const translationResourceContextValue = useMemo<TranslationResourceType>(
      () => ({ key: displayName, resources, ready: resources !== null }),
      [resources],
    );

    useEffect(() => {
      if (localization?.ready && provider !== null) {
        const {
          localeInfo: { locale },
        } = localization;

        void provider
          .loadTranslationResources(namespaces, locale)
          // this will not fail, and will return {} in place where failure occurred
          .then((translationResources) => {
            setResources(buildNamespacedResources(translationResources, namespaces));
          });
      }
      // shallow comparison here is intended as localization context value is
      // properly memorized, read more in `LocalizationProvider`
    }, [localization, provider]);

    return (
      <TranslationResourceContext.Provider value={translationResourceContextValue}>
        <WrappedComponent {...props} />
      </TranslationResourceContext.Provider>
    );
  };
  WithTranslation.displayName = `WithTranslation(${displayName})`;

  return WithTranslation;
}
