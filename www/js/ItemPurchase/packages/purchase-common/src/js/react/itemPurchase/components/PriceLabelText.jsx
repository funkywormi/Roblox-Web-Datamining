import React from 'react';
import PropTypes from 'prop-types';
import { withTranslations } from '@rbx/core-scripts/react';
import translationConfig from '../translation.config';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';

const { resources } = itemPurchaseConstants;
function PriceLabelText({ translate, isLimited, resellerAvailable }) {
  const showPriceLabelText = isLimited && resellerAvailable;

  return (
    <div className='text-label field-label price-label'>
      <span>
        {showPriceLabelText ? translate(resources.bestPriceLabel) : translate(resources.priceLabel)}
      </span>
    </div>
  );
}

PriceLabelText.propTypes = {
  translate: PropTypes.func.isRequired,
  isLimited: PropTypes.bool.isRequired,
  resellerAvailable: PropTypes.bool.isRequired
};

export default withTranslations(PriceLabelText, translationConfig.itemResources);
