import React from 'react';
import PropTypes from 'prop-types';
import { CFT_TRANSLATION_KEY } from '../../../../ts';

const commissionIconContainerStyle = {
  backgroundColor: 'var(--cft-icon-bg, rgba(208, 217, 251, 0.12))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

const commissionIconStyle = {
  paddingTop: '60%',
  backgroundColor: 'transparent'
};

function CommissionItemComponent({ translate }) {
  const formattedDescription = translate(CFT_TRANSLATION_KEY) || 'Lorem Ipsum';

  return (
    <div className='item-format item-sale-format'>
      <span className='item-card-image' style={commissionIconContainerStyle}>
        <span className='thumbnail-2d-container icon-robux-28x28' style={commissionIconStyle} />
      </span>
      <div className='item-description'>
        <div>{formattedDescription}</div>
      </div>
    </div>
  );
}

CommissionItemComponent.propTypes = {
  translate: PropTypes.func.isRequired
};

export default CommissionItemComponent;
