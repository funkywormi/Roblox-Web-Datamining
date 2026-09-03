import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import AmountComponent from './AmountComponent';

function SummaryTableRowComponent({ transactionTypeLabel, amount, onViewDetails, translate }) {
  const pendingRobuxString = translate('Label.TransactionTypePendingRobux');
  const totalString = translate('Heading.Total');

  return (
    <tr>
      {transactionTypeLabel !== pendingRobuxString && (
        <td
          className={classNames('summary-transaction-label', {
            'font-bold': transactionTypeLabel === totalString
          })}>
          {transactionTypeLabel}
          {onViewDetails && (
            <button type='button' className='btn-link summary-view-details' onClick={onViewDetails}>
              {translate('Action.ViewDetails')}
            </button>
          )}
        </td>
      )}
      {transactionTypeLabel === pendingRobuxString && (
        <td className='summary-transaction-pending-text text-disabled'>{transactionTypeLabel}</td>
      )}
      <td
        className={classNames('amount', 'icon-robux-container', {
          'text-disabled': transactionTypeLabel === pendingRobuxString,
          'font-bold': transactionTypeLabel === totalString
        })}>
        <AmountComponent amount={amount} />
      </td>
    </tr>
  );
}

SummaryTableRowComponent.propTypes = {
  transactionTypeLabel: PropTypes.string.isRequired,
  amount: PropTypes.number,
  onViewDetails: PropTypes.func,
  translate: PropTypes.func.isRequired
};
SummaryTableRowComponent.defaultProps = {
  amount: 0,
  onViewDetails: null
};

export default SummaryTableRowComponent;
