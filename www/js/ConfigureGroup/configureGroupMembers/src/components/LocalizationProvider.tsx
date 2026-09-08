import type { FunctionComponent } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type LocaleInfo from '../interfaces/LocaleInfo';
import type TranslationResourceProvider from '../interfaces/TranslationResourceProvider';
import type { LocalizationType } from '../LocalizationContext';
import LocalizationContext from '../LocalizationContext';
import type { TranslationResourceProviderType } from '../TranslationResourceProviderContext';
import TranslationResourceProviderContext from '../TranslationResourceProviderContext';

export interface LocalizationProviderProps {
  provider: TranslationResourceProvider;
  children?: React.ReactNode;
}

const LocalizationProvider: FunctionComponent<
  React.PropsWithChildren<LocalizationProviderProps>
> = ({ provider, children }) => {
  const [ready, setReady] = useState<boolean>(false);
  const [localeInfo, setLocaleInfo] = useState<LocaleInfo>(provider.defaultLocaleInfo);

  const localizationContextValue = useMemo<LocalizationType>(
    () => ({
      ready,
      localeInfo,
      setLocaleInfo,
    }),
    [ready, localeInfo],
  );
  const translationResourceProviderContextValue = useMemo<TranslationResourceProviderType>(
    () => ({
      provider,
    }),
    [provider],
  );

  // NOTE (@mbae, 07/17/23): Changing providers can cause a race condition because
  // the order of the `setLocale` calls is not guaranteed to be in order between
  // the old and new provider. This is because loadRuntimeLocale is async and
  // there is an awaited async call before setLocale within loadRuntimeLocale.
  useEffect(() => {
    async function loadRuntimeLocale() {
      try {
        const { locale, nativeName } = await provider.loadRuntimeLocaleInfo();
        // * NOTE (@zwang, 08/02/24): intentionally copy the object to avoid reference problems
        setLocaleInfo({ locale, nativeName });
      } catch {
        // eslint-disable-next-line no-console
        console.warn('Failed to load runtime locale info, fallback to default locale info');
      } finally {
        setReady(true);
      }
    }

    loadRuntimeLocale();
  }, [provider]);

  return (
    <LocalizationContext.Provider value={localizationContextValue}>
      <TranslationResourceProviderContext.Provider value={translationResourceProviderContextValue}>
        {children}
      </TranslationResourceProviderContext.Provider>
    </LocalizationContext.Provider>
  );
};

export default LocalizationProvider;
