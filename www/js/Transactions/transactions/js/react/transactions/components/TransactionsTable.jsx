import classNames from 'classnames';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import { authenticatedUser } from 'header-scripts';
import { Tooltip } from 'react-style-guide';
import TransactionsTableRow from './TransactionsTableRow';
import { shouldShowCurrencyTransferReport } from '../utils/currencyTransferDescription';
import { AgentType, TransactionOriginType } from '../../../../ts';
import { useEconomyMetadata } from '../hooks/useEconomyMetadata';

function TransactionsTable({ translate, targetType, transactions }) {
  const { metadata } = useEconomyMetadata();
  const amountTooltipText =
    translate('Tooltip.GroupSalesAmount') ||
    'Amount is net payout amount excluding commission, marketplace fee, and recurring group payouts.';

  const showReportColumn = useMemo(
    () => transactions.some(t => shouldShowCurrencyTransferReport(t, authenticatedUser?.id)),
    [transactions]
  );

  return (
    <table
      className={classNames('table', 'table-striped', 'transactions', {
        'transactions--has-row-actions': showReportColumn
      })}>
      <colgroup>
        <col />
        <col />
        <col />
        <col />
        {showReportColumn ? <col className='transactions-col-row-actions' /> : null}
      </colgroup>
      <tbody>
        <tr>
          <th className='date'>{translate('Heading.Date')}</th>
          <th className='user'>{translate('Heading.Source')}</th>
          <th className='item'>{translate('Heading.Description')}</th>
          <th className='amount'>
            {targetType === AgentType.Group
              ? translate('Heading.GroupAmount')
              : translate('Heading.Amount')}
            {metadata?.isGroupSalesAmountTooltipEnabled && targetType === AgentType.Group && (
              <Tooltip content={amountTooltipText} placement='bottom'>
                <span className='icon-moreinfo-16x16' />
              </Tooltip>
            )}
          </th>
          {showReportColumn ? (
            <th
              className='row-actions'
              scope='col'
              aria-label={translate('Label.ReportItemMenu') || 'Row actions'}
            />
          ) : null}
        </tr>
        {transactions.map(transaction => {
          return (
            <TransactionsTableRow
              key={transaction.idHash ?? transaction.id}
              translate={translate}
              transaction={transaction}
              showReportColumn={showReportColumn}
            />
          );
        })}
      </tbody>
    </table>
  );
}

TransactionsTable.propTypes = {
  translate: PropTypes.func.isRequired,
  targetType: PropTypes.string.isRequired,
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      idHash: PropTypes.string.isRequired,
      created: PropTypes.string.isRequired,
      isPending: PropTypes.bool,
      transactionType: TransactionOriginType,
      agent: PropTypes.shape({
        id: PropTypes.number,
        type: PropTypes.string,
        name: PropTypes.string
      }),
      details: PropTypes.shape({
        name: PropTypes.string,
        type: PropTypes.string,
        payoutDescription: PropTypes.string,
        place: PropTypes.shape({
          placeId: PropTypes.number,
          universeId: PropTypes.number,
          name: PropTypes.string
        }),
        holdTypeId: PropTypes.number,
        agreementId: PropTypes.string,
        licensingPaymentTransactionOriginType: PropTypes.string,
        creatorRewardsPayoutType: PropTypes.string,
        campaignName: PropTypes.string
      }),
      currency: PropTypes.shape({
        amount: PropTypes.number.isRequired,
        type: PropTypes.string
      }),
      o18EligibilityTag: PropTypes.string
    })
  ).isRequired
};

export default TransactionsTable;
