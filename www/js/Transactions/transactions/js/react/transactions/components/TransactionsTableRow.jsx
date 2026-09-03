import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { authenticatedUser } from 'header-scripts';
import { Tooltip } from 'react-style-guide';
import { Icon } from '@rbx/foundation-ui';
import { EnvironmentUrls } from 'Roblox';
import AmountComponent from './AmountComponent';
import TransactionReportMenu from './TransactionReportMenu';
import DateComponent from './DateComponent';
import SourceCell from './SourceCell';
import DescriptionCell from './DescriptionCell';
import O18BoostBadge from './O18BoostBadge';
import {
  getCurrencyTransferRequestId,
  shouldShowCurrencyTransferReport
} from '../utils/currencyTransferDescription';
import { getO18BadgeProps } from '../utils/o18BadgeProps';
import getEffectiveTransactionOriginType from '../utils/getEffectiveTransactionOriginType';
import { TransactionOriginType } from '../../../../ts';
import FIRST_DAILY_ENGAGEMENT_PAYOUT_DATE from '../constants/dailyEngagementConstants';

function TransactionsTableRow({ translate, transaction, showReportColumn }) {
  let TooltipContent = '';
  let amount = transaction.currency?.amount || 0;

  const effectiveType = getEffectiveTransactionOriginType(transaction);

  switch (effectiveType) {
    case TransactionOriginType.Sale:
    case TransactionOriginType.AffiliateSale:
    case TransactionOriginType.GroupPayout:
    case TransactionOriginType.PrivateServerEngagementPayout:
      TooltipContent = translate('Description.PendingRobuxSaleHold');
      break;
    case TransactionOriginType.EngagementPayout:
    case TransactionOriginType.GroupEngagementPayout:
      if (
        transaction.created &&
        new Date(transaction.created) < new Date(FIRST_DAILY_ENGAGEMENT_PAYOUT_DATE)
      ) {
        TooltipContent = translate('Description.PendingRobuxEngagementHold');
      } else {
        TooltipContent = translate('Description.PendingRobuxDailyEngagementHold');
      }
      break;
    case TransactionOriginType.AdsRevsharePayout:
    case TransactionOriginType.GroupAdsRevsharePayout:
      TooltipContent = translate('Description.PendingRobuxAdsRevsharePayout');
      break;
    case TransactionOriginType.AffiliatePayout:
      TooltipContent = translate('Description.PendingAudienceExpansionHold');
      break;
    case TransactionOriginType.SubscriptionsRevsharePayout:
    case TransactionOriginType.GroupSubscriptionsRevsharePayout:
      TooltipContent = translate('Description.PendingRobuxSubscriptionsPayout');
      break;
    case TransactionOriginType.LicensingPayment:
      TooltipContent = translate('Description.PendingRobuxLicensingPayment');
      break;
    case TransactionOriginType.CurrencyTransfer:
      // Pending currency transfers use an inline sandglass + text instead of the clock tooltip.
      break;
    case TransactionOriginType.SubscriptionsRevshareClawback:
    case TransactionOriginType.GroupSubscriptionsRevshareClawback:
    case TransactionOriginType.LicensingPaymentClawback:
      // Subscription and license clawbacks (reversals) should be negative since
      // they are rendered with payouts in the same table view.
      amount = -amount;
      break;
    default:
      break;
  }

  const showCurrencyTransferReport =
    showReportColumn && shouldShowCurrencyTransferReport(transaction, authenticatedUser?.id);
  const currencyTransferReportTargetIdStr = showCurrencyTransferReport
    ? getCurrencyTransferRequestId(transaction) ?? ''
    : '';

  const o18BadgeProps = getO18BadgeProps(transaction, translate);

  return (
    <tr className={classNames({ pending: transaction.isPending })}>
      <td className='date'>
        <DateComponent date={new Date(transaction.created)} />
      </td>
      <td className='user'>
        <SourceCell transaction={transaction} translate={translate} />
      </td>
      <td className='item'>
        <DescriptionCell transaction={transaction} translate={translate} />
      </td>
      <td className='amount icon-robux-container'>
        <AmountComponent
          amount={amount}
          amountInLocalCurrency={transaction.amountInLocalCurrency}
          transaction={transaction}
        />
        {/* CurrencyTransfer pending uses a dedicated icon and tooltip because the pending state
            requires user action (accepting on the Buy Robux page), unlike other pending types
            which are system-held and resolve automatically. */}
        {transaction.transactionType === TransactionOriginType.CurrencyTransfer &&
        transaction.isPending ? (
          <Tooltip
            id='pending-robux-tooltip'
            placement='top'
            content={
              translate('Tooltip.CurrencyTransfer') ||
              'Go to the Buy Robux page to accept these Robux.'
            }>
            <a
              href={`${EnvironmentUrls.websiteUrl}/upgrades/robux`}
              className='currency-transfer-pending-link'>
              <Icon name='icon-regular-clock-dashed' className='currency-transfer-pending-icon' />
            </a>
          </Tooltip>
        ) : (
          TooltipContent &&
          transaction.isPending && (
            <Tooltip id='pending-robux-tooltip' placement='top' content={TooltipContent}>
              <span className='icon-clock' />
            </Tooltip>
          )
        )}
        {o18BadgeProps && <O18BoostBadge {...o18BadgeProps} />}
      </td>
      {showReportColumn ? (
        <td className='row-actions'>
          {showCurrencyTransferReport ? (
            <TransactionReportMenu
              translate={translate}
              abuseVector='transaction_transfer'
              reportTargetIdStr={currencyTransferReportTargetIdStr}
            />
          ) : null}
        </td>
      ) : null}
    </tr>
  );
}

TransactionsTableRow.propTypes = {
  translate: PropTypes.func.isRequired,
  showReportColumn: PropTypes.bool,
  transaction: PropTypes.shape({
    id: PropTypes.number.isRequired,
    created: PropTypes.string.isRequired,
    isPending: PropTypes.bool,
    transactionType: TransactionOriginType,
    transactionSubtype: PropTypes.string,
    agent: PropTypes.shape({
      id: PropTypes.number,
      type: PropTypes.string,
      name: PropTypes.string
    }),
    details: PropTypes.shape({
      name: PropTypes.string,
      type: PropTypes.string,
      payoutDescription: PropTypes.string,
      status: PropTypes.string,
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
    amountInLocalCurrency: PropTypes.string,
    o18EligibilityTag: PropTypes.string,
    robuxRateBreakdown: PropTypes.shape({
      o18: PropTypes.number,
      standard: PropTypes.number
    })
  }).isRequired
};

TransactionsTableRow.defaultProps = {
  showReportColumn: false
};

export default TransactionsTableRow;
