import type { Context } from 'react';
import { createContext } from 'react';
import type TranslationResourceProvider from './interfaces/TranslationResourceProvider';

export type TranslationResourceProviderType = {
  provider: TranslationResourceProvider | null;
};

export interface TTranslationResourceProviderContext extends Context<TranslationResourceProviderType> {
  displayName: 'TranslationProvider';
}

const translationResourceProviderContext = createContext<TranslationResourceProviderType>({
  provider: null,
});
translationResourceProviderContext.displayName = 'TranslationProvider';

export default translationResourceProviderContext;
