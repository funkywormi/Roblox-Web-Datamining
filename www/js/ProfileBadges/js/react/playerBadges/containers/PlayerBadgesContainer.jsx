import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { Loading } from 'react-style-guide';
import { translationConfig } from '../../profileBadges/translation.config';
import BadgeContainerHeader from '../../profileBadges/components/BadgeContainerHeader';
import ListOfBadgesComponent from '../../profileBadges/components/ListOfBadgesComponent';
import playerBadgeLayout from '../constants/playerBadgesLayout';
import badgesServices from '../../badgeData/services/badgesService';
import userInfo from '../../utils/userInfo';
import badgeTypes from '../../badgeData/constants/badgeTypes';

function PlayerBadgesContainer(props) {
  const screenXsMax = 767; // media query value for $screen-xs-max
  const screenSmMax = 991; // media query value for $screen-sm-max

  const { translate } = props;
  const [isInitializedLoading, setInitializedLoading] = useState(false);
  const [badgesData, setBadgesData] = useState([]);
  const [numBadges, setNumBadges] = useState(0);
  const [nextPageCursor, setNextPageCursor] = useState(false);
  const [isSeeAllShown, setIsSeeAllShown] = useState(false);
  const profileUserId = userInfo.getProfileUserId();
  const inventoryUrl = playerBadgeLayout.getInventoryUrlForBadge(profileUserId);

  const loadPlayerBadges = useCallback(() => {
    setInitializedLoading(true);
    badgesServices
      .getPlayerBadges(profileUserId)
      .then(result => {
        if (result?.data) {
          setNextPageCursor(!!result.nextPageCursor);
          setNumBadges(result.data.length);
          const dataToDisplay = result.data.slice(0, playerBadgeLayout.limitOfBadgesToDisplay);
          setBadgesData(
            dataToDisplay.map(badge => ({
              ...badge,
              name: badge.displayName || badge.name,
              description: badge.displayDescription || badge.description,
              iconImageId: badge.displayIconImageId || badge.iconImageId
            }))
          );
        }
      })
      .catch(console.debug)
      .finally(() => {
        setInitializedLoading(false);
      });
  }, [profileUserId]);

  const updateLimitOfBadgesBasedOnViewport = useCallback(() => {
    if (window.matchMedia(`(max-width: ${screenXsMax}px)`).matches) {
      setIsSeeAllShown(nextPageCursor || numBadges > playerBadgeLayout.limitOfBadgesToDisplayXS);
    } else if (window.matchMedia(`(max-width: ${screenSmMax}px)`).matches) {
      setIsSeeAllShown(nextPageCursor || numBadges > playerBadgeLayout.limitOfBadgesToDisplaySM);
    } else {
      setIsSeeAllShown(nextPageCursor || numBadges > playerBadgeLayout.limitOfBadgesToDisplay);
    }
  }, [nextPageCursor, numBadges]);

  useEffect(() => {
    updateLimitOfBadgesBasedOnViewport();
    window.addEventListener('resize', updateLimitOfBadgesBasedOnViewport);

    return () => window.removeEventListener('resize', updateLimitOfBadgesBasedOnViewport);
  }, [updateLimitOfBadgesBasedOnViewport]);

  useEffect(() => {
    loadPlayerBadges();
    return () => {};
  }, [loadPlayerBadges]);

  return (
    <React.Fragment>
      {isInitializedLoading ? <Loading /> : null}
      {badgesData.length > 0 && (
        <React.Fragment>
          <BadgeContainerHeader
            headerLabel={translate(playerBadgeLayout.title)}
            isSeeAllShown={isSeeAllShown}
            url={inventoryUrl}
            {...props}
          />
          <ListOfBadgesComponent
            badgesData={badgesData}
            isInitializedLoading={isInitializedLoading}
            badgeType={badgeTypes.player}
            {...props}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

PlayerBadgesContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(PlayerBadgesContainer, translationConfig);
export { PlayerBadgesContainer as PlayerBadgesContainerWithoutTranslations };
