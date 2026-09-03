import React from 'react';
import { withTranslations } from '@rbx/core-scripts/react';
import PropTypes from 'prop-types';
import { formatNumber } from '@rbx/core-scripts/format/number';
import itemPurchaseConstants from '../constants/itemPurchaseConstants';
import translationConfig from '../translation.config';

const { resources } = itemPurchaseConstants;

function PriceLabel({ translate, price, color, useFreeText }) {
  if (price === 0 && useFreeText) {
    return <span className='text-robux text-free'>{translate(resources.freeLabel)}</span>;
  }
  return (
    <React.Fragment>
      <span className={`icon-robux${color ? `-${color}` : ''}-16x16`} />
      <span className='text-robux'>{formatNumber(price)}</span>
    </React.Fragment>
  );
}
PriceLabel.defaultProps = {
  color: '',
  useFreeText: true
};
PriceLabel.propTypes = {
  price: PropTypes.number.isRequired,
  translate: PropTypes.func.isRequired,
  color: PropTypes.string,
  useFreeText: PropTypes.bool
};

export default withTranslations(PriceLabel, translationConfig.purchasingResources);
