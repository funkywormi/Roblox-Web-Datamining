import { useCallback, useMemo } from 'react';
import type {
  TranslationArgs,
  TranslationHTMLArgs,
  TranslationHTMLTag,
} from '../types/TranslationArgsTypes';
import type { TranslationKey, TranslationNamespace } from '../types/TranslationRegistry';
import useTranslation from './useTranslation';

export type UseTranslationWithNamespaceResult<
  NS extends TranslationNamespace = TranslationNamespace,
> = {
  ready: boolean;
  translate: (key: TranslationKey<NS>, args?: TranslationArgs) => string;
  translateHTML: (
    key: TranslationKey<NS>,
    tags?: TranslationHTMLTag[] | null,
    args?: TranslationHTMLArgs,
  ) => React.ReactNode;
};

function useTranslationWithNamespace<NS extends TranslationNamespace>(
  namespace: NS,
): UseTranslationWithNamespaceResult<NS> {
  const { ready, translateWithNamespace, translateWithNamespaceHTML } = useTranslation();

  const translate = useCallback(
    (key: TranslationKey<NS>, args?: TranslationArgs) =>
      translateWithNamespace(namespace, key, args),
    [namespace, translateWithNamespace],
  );

  const translateHTML = useCallback(
    (key: TranslationKey<NS>, tags?: TranslationHTMLTag[] | null, args?: TranslationHTMLArgs) =>
      translateWithNamespaceHTML(namespace, key, tags, args),
    [namespace, translateWithNamespaceHTML],
  );

  return useMemo(
    () => ({
      ready,
      translate,
      translateHTML,
    }),
    [ready, translate, translateHTML],
  );
}

export default useTranslationWithNamespace;
