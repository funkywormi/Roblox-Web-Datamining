import type { Context } from 'react';
import { createContext } from 'react';
import type NamespacedResources from './interfaces/NamespacedResources';

export type TranslationResourceType = {
  key?: string;
  ready: boolean;
  resources: NamespacedResources | null;
};

export interface TTranslationResourceContext extends Context<TranslationResourceType> {
  displayName: 'Translation';
}

const translationResourceContext = createContext<TranslationResourceType>({
  resources: null,
  ready: false,
});
translationResourceContext.displayName = 'Translation';

export default translationResourceContext;
