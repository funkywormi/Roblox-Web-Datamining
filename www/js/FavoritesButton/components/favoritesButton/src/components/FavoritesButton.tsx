import React from 'react';
import { TranslateFunction } from '@rbx/core-scripts/legacy/react-utilities';
import FavoritesStats from './FavoritesStats';

export function FavoritesButton({
  showFavoriteCount,
  isFavorited,
  favoriteCount,
  onFavoriteChange,
  translate
}: {
  showFavoriteCount: boolean;
  isFavorited: boolean;
  favoriteCount: number | undefined;
  onFavoriteChange: () => void;
  translate: TranslateFunction;
}): JSX.Element {
  return (
    <li className='favorite-button-container'>
      <div
        className='tooltip-container'
        title={
          isFavorited ? translate('ActionRemoveFromFavorites') : translate('ActionAddToFavorites')
        }>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
        <a id='toggle-favorite' onClick={onFavoriteChange}>
          {showFavoriteCount && <FavoritesStats favoriteCount={favoriteCount} />}
          <div id='favorite-icon' className={`icon-favorite ${isFavorited ? 'favorited' : ''}`} />
        </a>
      </div>
    </li>
  );
}

export default FavoritesButton;
