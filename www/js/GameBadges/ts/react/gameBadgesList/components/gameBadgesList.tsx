import React, { useEffect, useState, useRef } from 'react';
import { withTranslations, TranslateFunction } from 'react-utilities';
import { Button } from 'react-style-guide';
import GameBadge from './gameBadge';
import { TBadge } from '../types/gameBadgesListTypes';
import gameBadgesService from '../services/gameBadgesListService';
import gameBadgesConstants from '../constants/gameBadgesListConstants';
import { gameBadgesListTranslationConfig } from '../translation.config';

const {
  translationMap,
  minimumDisplayedBadgeCount,
  badgePageSize,
  badgePageLoadSize
} = gameBadgesConstants;

export const GameBadgesList = ({
  universeId,
  translate
}: {
  universeId: string;
  translate: TranslateFunction;
}): JSX.Element | null => {
  const [numberToShow, setNumberToShow] = useState<number>(minimumDisplayedBadgeCount);
  const [pageCursor, setPageCursor] = useState<string | undefined>(undefined);
  const [badges, setBadges] = useState<TBadge[]>([]);
  const numberToShowRef = useRef<number>(numberToShow);
  const badgesLengthRef = useRef<number>(badges.length);

  const fetchGameBadges = async (
    badgeUniverseId: string,
    isInitial: boolean,
    cursor?: string,
    limit?: number
  ) => {
    if (isInitial || (numberToShowRef.current >= badgesLengthRef.current && cursor)) {
      try {
        const { nextPageCursor, data } = await gameBadgesService.getGameBadges(
          universeId,
          cursor,
          limit
        );
        badgesLengthRef.current += data.length;
        setBadges(state => [...state, ...data]);
        setPageCursor(nextPageCursor);
        // eslint-disable-next-line no-void
        void fetchGameBadges(badgeUniverseId, false, nextPageCursor, limit);
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchGameBadges(universeId, true, undefined, badgePageLoadSize);
  }, []);

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className='stack badge-container game-badges-list'>
      <div className='container-header'>
        <h3>{translate(translationMap.HeadingGameBadges)}</h3>
      </div>
      <ul className='stack-list'>
        {badges.slice(0, numberToShow).map(badge => (
          <GameBadge key={badge.id} badge={badge} translate={translate} />
        ))}
      </ul>
      {numberToShow < badges.length && (
        <li>
          <Button
            variant={Button.variants.control}
            width={Button.widths.full}
            onClick={() => {
              setNumberToShow(count => {
                const addCount = badgePageSize - (count % badgePageSize);
                numberToShowRef.current += addCount;
                return addCount + count;
              });
              // eslint-disable-next-line no-void
              void fetchGameBadges(universeId, false, pageCursor, badgePageLoadSize);
            }}>
            {translate(translationMap.LabelSeeMore)}
          </Button>
        </li>
      )}
    </div>
  );
};

export default withTranslations<{ universeId: string }>(
  GameBadgesList,
  gameBadgesListTranslationConfig
);
