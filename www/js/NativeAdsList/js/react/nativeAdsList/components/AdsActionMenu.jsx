import React from 'react';
import PropTypes from 'prop-types';

function AdsActionMenu({ translate, onItemClicked, adSetId }) {
  return (
    <li>
      <button
        type='button'
        cssClasses='rbx-menu-item'
        onClick={() => {
          onItemClicked(adSetId);
        }}>
        {translate('Action.StopAd')}
      </button>
    </li>
  );
}

AdsActionMenu.propTypes = {
  translate: PropTypes.func.isRequired,
  onItemClicked: PropTypes.func.isRequired,
  adSetId: PropTypes.number.isRequired
};
export default AdsActionMenu;
