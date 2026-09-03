import PropTypes from 'prop-types';
import React from 'react';
import NewMyTransactionsPageAffiliateSaleTotalsDisabled from '../constants/transactionTypeConstants';
import SummaryTableRowComponent from './SummaryTableRowComponent';
import { TransactionType, transactionTypeTranslationKeys } from '../../../../ts';
import { useEconomyMetadata } from '../hooks/useEconomyMetadata';

function SummaryTable({ translate, data, transactionTypes, onTransactionTypeSelect }) {
  const tableIncomingMarkup = (
    <tr className='border-bottom'>
      <th className='incoming-robux-label'>{translate('Heading.IncomingRobux')}</th>
      <th className='amount'>{translate('Heading.Amount')}</th>
    </tr>
  );

  const tableOutgoingMarkup = (
    <tr className='border-bottom'>
      <th className='outgoing-robux-label'>{translate('Heading.OutgoingRobux')}</th>
      <th className='amount'>{translate('Heading.Amount')}</th>
    </tr>
  );

  const { metadata } = useEconomyMetadata();

  return (
    <table className='table summary'>
      <h2>{translate('Label.Summary')}</h2>
      <tbody>
        {tableIncomingMarkup}
        {/* Note transaction types aren't dynamically mapped because they don't follow the same order as the dropdown menu. This is a product decision */}
        {/* In addition, some rows have special styling and are under different headers or are not transaction types (Total rows) */}
        {TransactionType.PremiumStipend in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.PremiumStipend]
            )}
            amount={data.premiumStipendsTotal}
            translate={translate}
          />
        )}
        {TransactionType.CurrencyPurchase in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.CurrencyPurchase]
            )}
            amount={data.currencyPurchasesTotal}
            translate={translate}
          />
        )}
        {TransactionType.Sale in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(transactionTypeTranslationKeys[TransactionType.Sale])}
            amount={data.salesTotal}
            translate={translate}
          />
        )}
        {metadata?.isPublishingAdvanceRebatePageEnabled &&
          TransactionType.PublishingAdvanceRebates in transactionTypes && (
            <SummaryTableRowComponent
              transactionTypeLabel={translate(
                transactionTypeTranslationKeys[TransactionType.PublishingAdvanceRebates]
              )}
              amount={data.publishingAdvanceRebatesTotal}
              translate={translate}
            />
          )}
        {TransactionType.CreatorRewardsPayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.CreatorRewardsPayout]
            )}
            amount={data.creatorRewardsPayoutsTotal}
            translate={translate}
          />
        )}
        {TransactionType.EngagementPayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.EngagementPayout]
            )}
            amount={data.premiumPayoutsTotal}
            translate={translate}
          />
        )}
        {TransactionType.AffiliatePayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.AffiliatePayout]
            )}
            amount={data.affiliatePayoutTotal}
            translate={translate}
          />
        )}
        {TransactionType.GroupPayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.GroupPayout]
            )}
            amount={data.groupPayoutsTotal}
            translate={translate}
          />
        )}
        {TransactionType.GroupEngagementPayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.GroupEngagementPayout]
            )}
            amount={data.groupPremiumPayoutsTotal}
            translate={translate}
          />
        )}
        {TransactionType.AdsRevsharePayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.AdsRevsharePayout]
            )}
            amount={data.adsRevsharePayoutsTotal}
            translate={translate}
          />
        )}
        {TransactionType.GroupAdsRevsharePayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.GroupAdsRevsharePayout]
            )}
            amount={data.groupAdsRevsharePayoutsTotal}
            translate={translate}
          />
        )}
        {TransactionType.SubscriptionsRevsharePayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.SubscriptionsRevsharePayout]
            )}
            amount={data.subscriptionsRevshareTotal}
            translate={translate}
          />
        )}
        {TransactionType.GroupSubscriptionsRevsharePayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.GroupSubscriptionsRevsharePayout]
            )}
            amount={data.groupSubscriptionsRevshareTotal}
            translate={translate}
          />
        )}
        {TransactionType.AffiliateSale in transactionTypes &&
          data.affiliateSalesTotal !== NewMyTransactionsPageAffiliateSaleTotalsDisabled && (
            <SummaryTableRowComponent
              transactionTypeLabel={translate(
                transactionTypeTranslationKeys[TransactionType.AffiliateSale]
              )}
              amount={data.affiliateSalesTotal}
              translate={translate}
            />
          )}
        {TransactionType.TradeRobux in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.TradeRobux]
            )}
            amount={data.tradeSystemEarningsTotal}
            translate={translate}
          />
        )}
        {TransactionType.LicensingPayment in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.LicensingPayment]
            )}
            amount={data.licensingPaymentTotal}
            translate={translate}
          />
        )}
        {TransactionType.CurrencyTransfer in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate('Label.RobuxTransferReceived')}
            amount={data.incomingRobuxTransferTotal}
            onViewDetails={() => onTransactionTypeSelect(TransactionType.CurrencyTransfer)}
            translate={translate}
          />
        )}
        {TransactionType.RobloxSelectTransfer in transactionTypes &&
          data.robloxSelectIncomingTotal > 0 && (
            <SummaryTableRowComponent
              transactionTypeLabel={translate(
                transactionTypeTranslationKeys[TransactionType.RobloxSelectTransfer]
              )}
              amount={data.robloxSelectIncomingTotal}
              translate={translate}
            />
          )}
        {TransactionType.PrivateServerEngagementPayout in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.PrivateServerEngagementPayout]
            )}
            amount={data.privateServerEngagementPayoutsTotal}
            translate={translate}
          />
        )}
        {TransactionType.CsAdjustment in transactionTypes && data.csAdjustmentTotal >= 0 && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.CsAdjustment]
            )}
            amount={data.csAdjustmentTotal}
            translate={translate}
          />
        )}
        {/* Total row contains special styling */}
        <SummaryTableRowComponent
          transactionTypeLabel={translate('Heading.Total')}
          amount={data.incomingRobuxTotal}
          translate={translate}
        />
        {/* Pending Robux: current pending balance shown below Total so
            creators can see the line items add up without it. */}
        {(TransactionType.Sale in transactionTypes ||
          TransactionType.EngagementPayout in transactionTypes ||
          TransactionType.GroupEngagementPayout in transactionTypes ||
          TransactionType.AdsRevsharePayout in transactionTypes ||
          TransactionType.GroupAdsRevsharePayout in transactionTypes ||
          TransactionType.SubscriptionsRevsharePayout in transactionTypes ||
          TransactionType.GroupSubscriptionsRevsharePayout in transactionTypes ||
          TransactionType.IndividualToGroup in transactionTypes ||
          TransactionType.AffiliateSale in transactionTypes ||
          TransactionType.AffiliatePayout in transactionTypes ||
          TransactionType.CreatorRewardsPayout in transactionTypes ||
          TransactionType.CurrencyTransfer in transactionTypes ||
          TransactionType.LicensingPayment in transactionTypes) && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate('Label.TransactionTypePendingRobux')}
            amount={data.pendingRobuxTotal}
            translate={translate}
          />
        )}
        <br />
        {tableOutgoingMarkup}
        {TransactionType.Purchase in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.Purchase]
            )}
            amount={data.purchasesTotal}
            translate={translate}
          />
        )}
        {TransactionType.DevEx in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(transactionTypeTranslationKeys[TransactionType.DevEx])}
            amount={data.developerExchangeTotal}
            translate={translate}
          />
        )}
        {TransactionType.TradeRobux in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate('Label.TransactionTypeCostOfTrades')}
            amount={data.tradeSystemCostsTotal}
            translate={translate}
          />
        )}
        {TransactionType.AdSpend in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.AdSpend]
            )}
            amount={data.adSpendTotal}
            translate={translate}
          />
        )}
        {TransactionType.IndividualToGroup in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.IndividualToGroup]
            )}
            amount={data.individualToGroupTotal}
            translate={translate}
          />
        )}
        {TransactionType.CsAdjustment in transactionTypes && data.csAdjustmentTotal < 0 && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.CsAdjustment]
            )}
            amount={data.csAdjustmentTotal}
            translate={translate}
          />
        )}
        {data.subscriptionsRevshareOutgoingTotal < 0 && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.SubscriptionsRevshareClawback]
            )}
            amount={data.subscriptionsRevshareOutgoingTotal}
            translate={translate}
          />
        )}
        {data.groupSubscriptionsRevshareOutgoingTotal < 0 && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate(
              transactionTypeTranslationKeys[TransactionType.GroupSubscriptionsRevshareClawback]
            )}
            amount={data.groupSubscriptionsRevshareOutgoingTotal}
            translate={translate}
          />
        )}
        {TransactionType.CurrencyTransfer in transactionTypes && (
          <SummaryTableRowComponent
            transactionTypeLabel={translate('Label.RobuxTransferSent')}
            amount={data.outgoingRobuxTransferTotal}
            onViewDetails={() => onTransactionTypeSelect(TransactionType.CurrencyTransfer)}
            translate={translate}
          />
        )}
        {TransactionType.RobloxSelectTransfer in transactionTypes &&
          data.robloxSelectOutgoingTotal < 0 && (
            <SummaryTableRowComponent
              transactionTypeLabel={translate(
                transactionTypeTranslationKeys[TransactionType.RobloxSelectTransfer]
              )}
              amount={data.robloxSelectOutgoingTotal}
              translate={translate}
            />
          )}
        {/* Total row contains special styling */}
        <SummaryTableRowComponent
          transactionTypeLabel={translate('Heading.Total')}
          amount={data.outgoingRobuxTotal}
          translate={translate}
        />
      </tbody>
    </table>
  );
}

SummaryTable.propTypes = {
  translate: PropTypes.func.isRequired,
  data: PropTypes.shape({
    affiliatePayoutTotal: PropTypes.number.isRequired,
    premiumStipendsTotal: PropTypes.number.isRequired,
    currencyPurchasesTotal: PropTypes.number.isRequired,
    salesTotal: PropTypes.number.isRequired,
    publishingAdvanceRebatesTotal: PropTypes.number.isRequired,
    premiumPayoutsTotal: PropTypes.number.isRequired,
    groupPayoutsTotal: PropTypes.number.isRequired,
    groupPremiumPayoutsTotal: PropTypes.number.isRequired,
    affiliateSalesTotal: PropTypes.number.isRequired,
    tradeSystemEarningsTotal: PropTypes.number.isRequired,
    pendingRobuxTotal: PropTypes.number.isRequired,
    purchasesTotal: PropTypes.number.isRequired,
    developerExchangeTotal: PropTypes.number.isRequired,
    tradeSystemCostsTotal: PropTypes.number.isRequired,
    adSpendTotal: PropTypes.number.isRequired,
    individualToGroupTotal: PropTypes.number.isRequired,
    csAdjustmentTotal: PropTypes.number.isRequired,
    incomingRobuxTotal: PropTypes.number.isRequired,
    outgoingRobuxTotal: PropTypes.number.isRequired,
    groupAdsRevsharePayoutsTotal: PropTypes.number.isRequired,
    adsRevsharePayoutsTotal: PropTypes.number.isRequired,
    subscriptionsRevshareTotal: PropTypes.number.isRequired,
    groupSubscriptionsRevshareTotal: PropTypes.number.isRequired,
    subscriptionsRevshareOutgoingTotal: PropTypes.number.isRequired,
    groupSubscriptionsRevshareOutgoingTotal: PropTypes.number.isRequired,
    licensingPaymentTotal: PropTypes.number.isRequired,
    incomingRobuxTransferTotal: PropTypes.number.isRequired,
    outgoingRobuxTransferTotal: PropTypes.number.isRequired,
    robloxSelectIncomingTotal: PropTypes.number.isRequired,
    robloxSelectOutgoingTotal: PropTypes.number.isRequired,
    privateServerEngagementPayoutsTotal: PropTypes.number.isRequired,
    creatorRewardsPayoutsTotal: PropTypes.number.isRequired
  }).isRequired,
  transactionTypes: PropTypes.shape({}).isRequired,
  onTransactionTypeSelect: PropTypes.func.isRequired
};

export default SummaryTable;
