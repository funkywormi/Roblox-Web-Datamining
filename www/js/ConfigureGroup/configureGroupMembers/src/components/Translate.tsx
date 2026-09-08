import type { ReactNode } from 'react';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import useTranslation from '../hooks/useTranslation';
import type NamespacedResources from '../interfaces/NamespacedResources';
import LocalizationContext from '../LocalizationContext';
import type { TranslationResourceType } from '../TranslationResourceContext';
import TranslationResourceContext from '../TranslationResourceContext';
import translationResourceProviderContext from '../TranslationResourceProviderContext';
import type { TranslationKey, TranslationNamespace } from '../types/TranslationRegistry';
import { buildNamespacedResources } from '../utils/buildNamespacedResources';

interface TranslateInnerProps {
  namespace: string;
  translationKey: string;
  args?: { [key: string]: string };
  fallback?: ReactNode;
}

const TranslateInner = ({
  namespace,
  translationKey,
  args,
  fallback = null,
}: TranslateInnerProps) => {
  const { translateWithNamespace, ready } = useTranslation();

  if (!ready) {
    return fallback;
  }

  const result = translateWithNamespace(namespace, translationKey, args);
  return result || fallback;
};

export interface TranslateProps<NS extends TranslationNamespace = TranslationNamespace> {
  namespace: NS;
  translationKey: TranslationKey<NS>;
  args?: { [key: string]: string };
  fallback?: ReactNode;
}

export default function Translate<NS extends TranslationNamespace>({
  namespace,
  translationKey,
  args,
  fallback,
}: TranslateProps<NS>) {
  const { provider } = useContext(translationResourceProviderContext);
  const localization = useContext(LocalizationContext);

  const [resources, setResources] = useState<NamespacedResources | null>(null);

  useEffect(() => {
    if (provider === null || !localization?.ready) {
      return;
    }
    const {
      localeInfo: { locale },
    } = localization;
    void provider.loadTranslationResources([namespace], locale).then((translationResources) => {
      setResources(buildNamespacedResources(translationResources, [namespace]));
    });
  }, [localization, provider, namespace]);

  const translationResourceContextValue = useMemo<TranslationResourceType>(
    () => ({ key: `Translate-${namespace}`, resources, ready: resources !== null }),
    [namespace, resources],
  );

  // StaticTranslationProvider doesn't have a provider, render TranslateInner directly.
  if (provider === null) {
    return (
      <TranslateInner
        namespace={namespace}
        translationKey={translationKey}
        args={args}
        fallback={fallback}
      />
    );
  }

  return (
    <TranslationResourceContext.Provider value={translationResourceContextValue}>
      <TranslateInner
        namespace={namespace}
        translationKey={translationKey}
        args={args}
        fallback={fallback}
      />
    </TranslationResourceContext.Provider>
  );
}
