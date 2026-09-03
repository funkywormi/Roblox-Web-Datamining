import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ClassNames from 'classnames';
import BadgeCardComponent from '../../badgeCards/components/BadgeCardComponent';

function ListOfBadgesComponent({ badgesData, badgeType, isSectionHeightAuto }) {
  const badgesListClasses = ClassNames('hlist badge-list', {
    'badge-list-more': isSectionHeightAuto
  });

  const [listOfBadges, setListOfBadges] = useState([]);

  useEffect(() => {
    if (badgesData?.length) {
      setListOfBadges(badgesData);
    }
    return () => {};
  }, [badgesData]);

  return (
    <div className='section-content remove-panel'>
      <ul className={badgesListClasses}>
        {listOfBadges?.length > 0 &&
          listOfBadges.map(badge => {
            return <BadgeCardComponent badgeData={badge} badgeType={badgeType} />;
          })}
      </ul>
    </div>
  );
}
ListOfBadgesComponent.defaultProps = {
  isSectionHeightAuto: false
};

ListOfBadgesComponent.propTypes = {
  badgesData: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  badgeType: PropTypes.string.isRequired,
  isSectionHeightAuto: PropTypes.bool
};

export default ListOfBadgesComponent;
