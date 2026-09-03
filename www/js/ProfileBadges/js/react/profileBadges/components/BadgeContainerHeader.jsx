import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-style-guide';
import playerBadgesLayout from '../../playerBadges/constants/playerBadgesLayout';
import robloxBadgesLayout from '../../robloxBadges/constants/robloxBadgesLayout';

function BadgeContainerHeader({
  translate,
  headerLabel,
  isSeeAllShown,
  url,
  seeMoreLessCallback,
  seeMore,
  isSeeMoreShown
}) {
  let labelOfSeeMoreLess = null;
  if (seeMoreLessCallback) {
    labelOfSeeMoreLess = seeMore
      ? robloxBadgesLayout.seeLessLabel
      : robloxBadgesLayout.seeMoreLabel;
  }
  return (
    <div className='container-header'>
      <h2>{headerLabel}</h2>
      {isSeeAllShown && (
        <Link url={url} class='btn-fixed-width btn-secondary-xs btn-more see-all-link-icon'>
          {translate(playerBadgesLayout.seeAllLabel)}
        </Link>
      )}
      {isSeeMoreShown && (
        <Link
          onClick={seeMoreLessCallback}
          class='btn-fixed-width btn-secondary-xs btn-more see-all-link'>
          {translate(labelOfSeeMoreLess)}
        </Link>
      )}
    </div>
  );
}

BadgeContainerHeader.defaultProps = {
  isSeeAllShown: false,
  url: '',
  seeMoreLessCallback: null,
  seeMore: false,
  isSeeMoreShown: false
};

BadgeContainerHeader.propTypes = {
  translate: PropTypes.func.isRequired,
  headerLabel: PropTypes.string.isRequired,
  isSeeAllShown: PropTypes.bool,
  url: PropTypes.string,
  seeMoreLessCallback: PropTypes.func,
  seeMore: PropTypes.bool,
  isSeeMoreShown: PropTypes.bool
};

export default BadgeContainerHeader;
