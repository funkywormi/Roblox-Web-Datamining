import React from 'react';
import { Dropdown } from 'react-style-guide';
import PropTypes from 'prop-types';
import {
  PRICING_TYPE_FIAT_PAID_ACCESS,
  PRICING_TYPE_PAID_AND_LIMITED,
  PRICING_TYPE_ALL
} from '../constants/itemPricingTypeConstants';

const PaidItemSelectionDropdown = ({
  itemPricingType,
  setItemPricingType,
  translate,
  isFiatPaidAccessEnabled
}) => {
  let currSelectionLabel;
  if (itemPricingType === PRICING_TYPE_PAID_AND_LIMITED) {
    currSelectionLabel = translate('Label.PaidAndLimited') || 'Paid & Limited Items';
  } else if (itemPricingType === PRICING_TYPE_ALL) {
    currSelectionLabel = translate('Label.AllItems') || 'All Items';
  }

  if (isFiatPaidAccessEnabled && itemPricingType === PRICING_TYPE_FIAT_PAID_ACCESS) {
    currSelectionLabel = translate('Label.FiatPaidAccess') || 'Paid Access in Local Currency';
  }

  return (
    <div className='transaction-paid-items-dropdown dropdown-btn'>
      <label
        id='items-selection-label'
        htmlFor='items-selection'
        className='font-caption-header text'>
        {translate('Label.SaleType') || 'Sale Type'}
      </label>
      <Dropdown currSelectionLabel={currSelectionLabel} id='paid-items-selection'>
        <Dropdown.Item
          key='paidAndLimited'
          onClick={() => setItemPricingType(PRICING_TYPE_PAID_AND_LIMITED)}
          active={itemPricingType === PRICING_TYPE_PAID_AND_LIMITED}>
          {translate('Label.PaidAndLimited') || 'Paid & Limited Items'}
        </Dropdown.Item>
        {isFiatPaidAccessEnabled && (
          <Dropdown.Item
            key='fiatPaidAccess'
            onClick={() => setItemPricingType(PRICING_TYPE_FIAT_PAID_ACCESS)}
            active={itemPricingType === PRICING_TYPE_FIAT_PAID_ACCESS}>
            {translate('Label.FiatPaidAccess') || 'Paid Access in Local Currency'}
          </Dropdown.Item>
        )}
        <Dropdown.Item
          key='all'
          onClick={() => setItemPricingType(PRICING_TYPE_ALL)}
          active={itemPricingType === PRICING_TYPE_ALL}>
          {translate('Label.AllItems') || 'All Items'}
        </Dropdown.Item>
      </Dropdown>
    </div>
  );
};

PaidItemSelectionDropdown.propTypes = {
  itemPricingType: PropTypes.string.isRequired,
  setItemPricingType: PropTypes.func.isRequired,
  translate: PropTypes.func.isRequired,
  isFiatPaidAccessEnabled: PropTypes.bool
};

PaidItemSelectionDropdown.defaultProps = {
  isFiatPaidAccessEnabled: false
};

export default PaidItemSelectionDropdown;
