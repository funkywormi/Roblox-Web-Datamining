import PropTypes from 'prop-types';
import React from 'react';
import { Intl } from 'Roblox';
import { TransactionOriginType } from '../../../../ts';

function AmountComponent({ amount, amountInLocalCurrency, transaction }) {
  const intl = new Intl();

  if (amountInLocalCurrency) {
    return <span className='amount-display'>{amountInLocalCurrency}</span>;
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
