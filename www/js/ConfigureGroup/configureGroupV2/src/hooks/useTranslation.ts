import type { ReactNode } from 'react';
import { useCallback, useContext, useMemo } from 'react';
import LocalizationContext from '../LocalizationContext';
import TranslationResourceContext from '../TranslationResourceContext';
import type {
  TranslationArgs,
  TranslationHTMLArgs,
  TranslationHTMLTag,
} from '../types/TranslationArgsTypes';
import type { TranslationKey, TranslationNamespace } from '../types/TranslationRegistry';
import {
  buildHTMLTranslation,
  classifyArgs,
  substituteStringArgs,
} from '../utils/translationUtils';

export type UseTranslationResult = {
  ready: boolean;
  translateWithNamespace: <NS extends TranslationNamespace>(
    namespace: NS,
    key: TranslationKey<NS>,
    args?: TranslationArgs,
  ) => string;
  translateWithNamespaceHTML: <NS extends TranslationNamespace>(
    namespace: NS,
    key: TranslationKey<NS>,
    tags?: TranslationHTMLTag[] | null,
    args?: TranslationHTMLArgs,
  ) => ReactNode;
  /** @deprecated Use `translateWithNamespace` instead for unambiguous namespace-qualified lookups. */
  translate: (key: string, args?: TranslationArgs) => string;
  /** @deprecated Use `translateWithNamespaceHTML` instead for unambiguous namespace-qualified lookups. */
  translateHTML: (
    key: string,
    tags?: TranslationHTMLTag[] | null,
    args?: TranslationHTMLArgs,
  ) => ReactNode;
};

function useTranslation(): UseTranslationResult {
  const localization = useContext(LocalizationContext);
  const { key: resourceKey = 'Unknown', resources, ready } = useContext(TranslationResourceContext);

  const translate = useCallback(
    (key: string, args?: TranslationArgs): string => {
      if (typeof localization === 'undefined') {
        // eslint-disable-next-line no-console
        console.warn(
          'Localization context is missing, useTranslation cannot work outside of the LocalizationProvider',
        );
        return '';
      }

      const { localeInfo } = localization;

      if (resources !== null) {
        // O(n) scan over namespaces; last-wins mirrors old Object.assign behavior
        let translation: string | null | undefined;
        for (const ns of Object.values(resources)) {
          if (Object.hasOwn(ns, key)) {
            translation = ns[key];
          }
        }

        if (typeof translation !== 'undefined') {
          if (translation != null) {
            return substituteStringArgs(translation, args);
          }

          // if the key exists but the translation is null
          // eslint-disable-next-line no-console
          console.warn(
            `[From context - ${resourceKey}] The translation of key '${key}' for locale '${localeInfo.locale}' does not exist!`,
          );
        } else {
          // if the key doesn't exist
          // eslint-disable-next-line no-console
          console.warn(
            `[From context - ${resourceKey}] The translation key '${key}' doesn't exist for locale '${localeInfo.locale}'!`,
          );
        }
      }

      return '';
    },
    [localization, resourceKey, resources],
  );

  const translateWithNamespace = useCallback(
    (namespace: string, key: string, args?: TranslationArgs): string => {
      if (typeof localization === 'undefined') {
        // eslint-disable-next-line no-console
        console.warn(
          'Localization context is missing, useTranslation cannot work outside of the LocalizationProvider',
        );
        return '';
      }

      const { localeInfo } = localization;

      if (resources !== null) {
        const ns = resources[namespace];

        if (ns !== undefined && Object.hasOwn(ns, key)) {
          const translation = ns[key];

          if (translation != null) {
            return substituteStringArgs(translation, args);
          }

          // if the key exists but the translation is null
          // eslint-disable-next-line no-console
          console.warn(
            `[From context - ${resourceKey}] The translation of key '${namespace}::${key}' for locale '${localeInfo.locale}' does not exist!`,
          );
        } else {
          // if the key doesn't exist
          // eslint-disable-next-line no-console
          console.warn(
            `[From context - ${resourceKey}] The translation key '${namespace}::${key}' doesn't exist for locale '${localeInfo.locale}'!`,
          );
        }
      }

      return '';
    },
    [localization, resourceKey, resources],
  );

  const translateHTML = useCallback(
    (key: string, tags?: TranslationHTMLTag[] | null, args?: TranslationHTMLArgs): ReactNode => {
      if (typeof localization === 'undefined') {
        // eslint-disable-next-line no-console
        console.warn(
          'Localization context is missing, useTranslation cannot work outside of the LocalizationProvider',
        );
        return '';
      }

      const { localeInfo } = localization;

      // If only the key is specified, handle it with the normal translate function
      if (typeof tags === 'undefined' && typeof args === 'undefined') {
        return translate(key);
      }

      // Classify args into plain string arguments and html arguments, handle string arguments using normal translate function
      const { stringArgs, htmlArgs } = classifyArgs(args);
      const translation = translate(key, stringArgs);

      // Early return if the translation cannot be found
      if (!translation) {
        return translation;
      }

      return buildHTMLTranslation(translation, key, resourceKey, localeInfo.locale, tags, htmlArgs);
    },
    [localization, resourceKey, translate],
  );

  const translateWithNamespaceHTML = useCallback(
    (
      namespace: string,
      key: string,
      tags?: TranslationHTMLTag[] | null,
      args?: TranslationHTMLArgs,
    ): ReactNode => {
      if (typeof localization === 'undefined') {
        // eslint-disable-next-line no-console
        console.warn(
          'Localization context is missing, useTranslation cannot work outside of the LocalizationProvider',
        );
        return '';
      }

      const { localeInfo } = localization;

      // If only the key is specified, handle it with the normal translateWithNamespace function
      if (typeof tags === 'undefined' && typeof args === 'undefined') {
        return translateWithNamespace(namespace, key);
      }

      // Classify args into plain string arguments and html arguments, handle string arguments using normal translateWithNamespace function
      const { stringArgs, htmlArgs } = classifyArgs(args);
      const translation = translateWithNamespace(namespace, key, stringArgs);

      // Early return if the translation cannot be found
      if (!translation) {
        return translation;
      }

      return buildHTMLTranslation(translation, key, resourceKey, localeInfo.locale, tags, htmlArgs);
    },
    [localization, resourceKey, translateWithNamespace],
  );

  return useMemo(
    () => ({
      ready,
      translate,
      translateWithNamespace,
      translateHTML,
      translateWithNamespaceHTML,
    }),
    [ready, translate, translateWithNamespace, translateHTML, translateWithNamespaceHTML],
  );
}

export default useTranslation;
