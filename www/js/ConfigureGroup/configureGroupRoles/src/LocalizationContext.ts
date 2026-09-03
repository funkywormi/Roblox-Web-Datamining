import type { Context } from 'react';
import { createContext } from 'react';
import type Localization from './interfaces/Localization';

export type LocalizationType = Localization | undefined;

export interface TLocalizationContext extends Context<LocalizationType> {
  displayName: 'Localization';
}

const localizationContext = createContext<LocalizationType>(undefined);
localizationContext.displayName = ' Localization';

export default localizationContext;
