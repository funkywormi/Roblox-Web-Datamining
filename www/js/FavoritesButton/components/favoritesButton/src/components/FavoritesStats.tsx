import React from 'react';
import { abbreviateNumber } from '@rbx/core-scripts/legacy/core-utilities';

export function FavoritesStats({
  favoriteCount
}: {
  favoriteCount: number | undefined;
}): JSX.Element {
  return (
    <span title='' className='text-favorite favoriteCount' id='result'>
      {favoriteCount !== undefined
        ? abbreviateNumber.getAbbreviatedValue(favoriteCount, undefined, 1000)
        : ''}
    </span>
  );
}

export default FavoritesStats;
