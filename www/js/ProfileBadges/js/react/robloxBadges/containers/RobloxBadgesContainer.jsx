import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from 'react-utilities';
import { Loading } from 'react-style-guide';
import { translationConfig } from '../../profileBadges/translation.config';
import BadgeContainerHeader from '../../profileBadges/components/BadgeContainerHeader';
import ListOfBadgesComponent from '../../profileBadges/components/ListOfBadgesComponent';
import robloxBadgesLayout from '../constants/robloxBadgesLayout';
import badgesServices from '../../badgeData/services/badgesService';
import userInfo from '../../utils/userInfo';
import badgeTypes from '../../badgeData/constants/badgeTypes';

function RobloxBadgesContainer(props) {
  const screenXsMax = 767; // media query value for $screen-xs-max
  const screenSmMax = 991; // media query value for $screen-sm-max

  const { translate } = props;
  const [isInitializedLoading, setInitializedLoading] = useState(false);
  const [badgesData, setBadgesData] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [isSeeMoreLabelShown, setSeeMoreLabelShown] = useState(false);
  const profileUserId = userInfo.getProfileUserId();

  const loadRobloxBadges = useCallback(() => {
    setInitializedLoading(true);
    badgesServices
      .getRobloxBadges(profileUserId)
      .then(result => {
        if (result) {
          setBadgesData(result);
        }
      })
      .catch(console.debug)
      .finally(() => {
        setInitializedLoading(false);
      });
  }, [profileUserId]);

  const updateLimitOfBadgesBasedOnViewport = useCallback(() => {
    if (window.matchMedia(`(max-width: ${screenXsMax}px)`).matches) {
      // media query for $screen-xs-max
      setSeeMoreLabelShown(badgesData.length > robloxBadgesLayout.thresholdNumShowSeeMoreLabelXS);
    } else if (window.matchMedia(`(max-width: ${screenSmMax}px)`).matches) {
      // media query for $screen-sm-max
      setSeeMoreLabelShown(badgesData.length > robloxBadgesLayout.thresholdNumShowSeeMoreLabelSM);
    } else {
      setSeeMoreLabelShown(badgesData.length > robloxBadgesLayout.thresholdNumShowSeeMoreLabel);
    }
  }, [badgesData]);

  const isMoreBadgesShown = () => {
    setShowMore(currentValue => !currentValue);
  };

  useEffect(() => {
    updateLimitOfBadgesBasedOnViewport();
    window.addEventListener('resize', updateLimitOfBadgesBasedOnViewport);

    return () => window.removeEventListener('resize', updateLimitOfBadgesBasedOnViewport);
  }, [updateLimitOfBadgesBasedOnViewport]);

  useEffect(() => {
    loadRobloxBadges();
    return () => {};
  }, [loadRobloxBadges]);

  return (
    <React.Fragment>
      {isInitializedLoading ? <Loading /> : null}
      {badgesData.length > 0 && (
        <React.Fragment>
          <BadgeContainerHeader
            headerLabel={translate(robloxBadgesLayout.title)}
            seeMoreLessCallback={isMoreBadgesShown}
            seeMore={showMore}
            isSeeMoreShown={isSeeMoreLabelShown}
            {...props}
          />
          <ListOfBadgesComponent
            badgesData={badgesData}
            isInitializedLoading={isInitializedLoading}
            isSectionHeightAuto={showMore}
            badgeType={badgeTypes.roblox}
            {...props}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
}

RobloxBadgesContainer.propTypes = {
  translate: PropTypes.func.isRequired
};

export default withTranslations(RobloxBadgesContainer, translationConfig);
export { RobloxBadgesContainer as RobloxBadgesContainerWithoutTranslations };
