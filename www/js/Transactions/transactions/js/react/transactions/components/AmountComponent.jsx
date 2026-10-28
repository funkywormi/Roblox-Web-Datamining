import PropTypes from 'prop-types';
import React from 'react';
import { Intl } from 'Roblox';
import {
  EMPTY_AMOUNT_PLACEHOLDER,
  TransactionOriginType,
  TransactionSubType
} from '../../../../ts';

function AmountComponent({ amount, amountInLocalCurrency, transaction }) {
  const intl = new Intl();

  if (amountInLocalCurrency) {
    return <span className='amount-display'>{amountInLocalCurrency}</span>;
  }

  // A gift receipt records an item received, not Robux moved, so its amount is always 0. Showing
  // "R$ 0" reads as a free purchase; a dash says the column does not apply to this row.
  if (transaction?.transactionSubtype === TransactionSubType.GiftReceipt) {
    return <span className='amount-display'>{EMPTY_AMOUNT_PLACEHOLDER}</span>;
  }

  return (
    <span className='amount-display'>
      <span>{amount < 0 ? '-' : ''}</span>
      <span className='icon-robux-16x16' />
      <span
        className={`${
          transaction?.details?.status === 'Rejected' &&
          transaction?.transactionType === TransactionOriginType.CashOut
            ? 'rejected-amount'
            : ''
        }`}>
        {intl.n(Math.abs(amount))}
      </span>
    </span>
  );
}

AmountComponent.propTypes = {
  amount: PropTypes.number,
  amountInLocalCurrency: PropTypes.string,
  transaction: PropTypes.shape({
    transactionType: TransactionOriginType,
    transactionSubtype: PropTypes.string,
    details: PropTypes.shape({
      status: PropTypes.string
    })
  })
};
AmountComponent.defaultProps = {
  amount: 0,
  amountInLocalCurrency: '',
  transaction: {
    transactionType: '',
    details: {
      status: 'Invalid'
    }
  }
};

export default AmountComponent;
