import React from 'react';
import { WithTranslationsProps, withTranslations } from '@rbx/core-scripts/legacy/react-utilities';
import { translationConfig } from './translation.config';
import FavoritesButtonContainer from './containers/FavoritesButtonContainer';

export function App({
  assetId,
  itemType,
  translate
}: {
  assetId: number | string;
  itemType: string;
} & WithTranslationsProps): JSX.Element {
  return <FavoritesButtonContainer translate={translate} assetId={assetId} itemType={itemType} />;
}

export default withTranslations(App, translationConfig);
