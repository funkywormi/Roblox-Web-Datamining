import SummaryTimeFrame from '../enums/SummaryTimeFrame';
import TransactionType from '../enums/TransactionType';
import TransactionOriginType from '../enums/TransactionOriginType';
import LicensedPaymentTransactionOriginType from '../enums/LicensedPaymentTransactionOriginType';

export const timeFrameTranslationKeys: { [key in SummaryTimeFrame]: string } = {
  [SummaryTimeFrame.Day]: 'Label.Day',
  [SummaryTimeFrame.Week]: 'Label.Week',
  [SummaryTimeFrame.Month]: 'Label.Month',
  [SummaryTimeFrame.Year]: 'Label.Year'
};

export const transactionTypeTranslationKeys: { [key in TransactionType]: string } = {
  [TransactionType.Sale]: 'Label.TransactionTypeSale',
  [TransactionType.AffiliateSale]: 'Label.TransactionTypeAffiliateSale',
  [TransactionType.GroupPayout]: 'Label.TransactionTypeGroupPayout',
  [TransactionType.CurrencyPurchase]: 'Label.TransactionTypeCurrencyPurchase',
  [TransactionType.TradeRobux]: 'Label.TransactionTypeTrade',
  [TransactionType.PremiumStipend]: 'Label.TransactionTypePremiumStipend',
  [TransactionType.PendingRobux]: 'Label.TransactionTypePendingRobux',
  [TransactionType.EngagementPayout]: 'Label.TransactionTypeCreatorRewardsDailyEngagement',
  [TransactionType.GroupEngagementPayout]: 'Label.TransactionTypeCommunityCreatorRewards',
  [TransactionType.AffiliatePayout]: 'Label.TransactionTypeCreatorRewardsAudienceExpansion',
  [TransactionType.AdSpend]: 'Label.TransactionTypeAdSpend',
  [TransactionType.DevEx]: 'Label.TransactionTypeDeveloperExchange',
  [TransactionType.IndividualToGroup]: 'Label.TransactionIndividualToGroup',
  [TransactionType.CsAdjustment]: 'Label.TransactionTypeCSAdjustment',
  [TransactionType.Summary]: 'Label.Summary',
  [TransactionType.Purchase]: 'Label.TransactionTypePurchase',
  [TransactionType.AdsRevsharePayout]: 'Label.AdsRevsharePayout',
  [TransactionType.GroupAdsRevsharePayout]: 'Label.GroupAdsRevsharePayout',
  [TransactionType.SubscriptionsRevsharePayout]: 'Label.SubscriptionsPayouts',
  [TransactionType.GroupSubscriptionsRevsharePayout]: 'Label.GroupSubscriptionsPayouts',
  [TransactionType.SubscriptionsRevshareClawback]: 'Label.SubscriptionsPayoutReversals',
  [TransactionType.GroupSubscriptionsRevshareClawback]: 'Label.GroupSubscriptionsPayoutReversals',
  [TransactionType.PublishingAdvanceRebates]: 'Label.PublishingAdvanceRebates',
  [TransactionType.LicensingPayment]: 'Label.LicensingPayment',
  [TransactionType.LicensingPaymentClawback]: 'Label.LicensingPaymentClawback',
  [TransactionType.CurrencyTransfer]: 'Label.CurrencyTransfers',
  [TransactionType.RobloxSelectTransfer]: 'Label.RobloxSelect',
  [TransactionType.PrivateServerEngagementPayout]: 'Label.PrivateServerEngagementPayouts',
  [TransactionType.CreatorRewardsPayout]: 'Label.TransactionTypeCreatorRewards'
};

export const transactionOriginTypeTranslationKeys: { [key in TransactionOriginType]: string } = {
  [TransactionOriginType.Sale]: 'Description.SoldItem', // Has item details
  [TransactionOriginType.Purchase]: 'Description.PurchasedItem', // Has item details
  [TransactionOriginType.IndividualToGroup]: 'Description.IndividualToGroup',
  [TransactionOriginType.AffiliatePayout]: 'Description.CreatorRewardsAudienceExpansion', // Has item details
  [TransactionOriginType.AffiliateSale]: 'Description.AffiliateSale', // Has item details
  [TransactionOriginType.PendingRobuxSaleHold]: 'Description.PendingRobuxSaleHold', // Has item details
  [TransactionOriginType.PendingRobuxEngagementPayoutHold]:
    'Description.PendingRobuxDailyEngagementHold', // Custom description
  [TransactionOriginType.PendingRobux]: 'Description.PendingRobux', // Custom description
  [TransactionOriginType.GroupPayout]: 'Description.GroupPayout', // Custom description
  [TransactionOriginType.EngagementPayout]: 'Description.DailyEngagementPayout', // Custom description
  [TransactionOriginType.GroupEngagementPayout]: 'Description.DailyEngagementPayoutFromCommunity', // Custom description
  [TransactionOriginType.TradeRobux]: 'Description.Trade', // Custom description
  [TransactionOriginType.PremiumStipend]: 'Description.PremiumStipend', // Custom description
  [TransactionOriginType.AmbassadorAward]: 'Description.AmbassadorAward',
  [TransactionOriginType.CurrencyPurchase]: 'Description.CurrencyPurchase',
  [TransactionOriginType.CurrencyTrade]: 'Description.CurrencyTrade',
  [TransactionOriginType.MiscellaneousAdjustment]: 'Description.MiscellaneousAdjustment',
  [TransactionOriginType.PlaceTrafficAward]: 'Description.PlaceTrafficAward',
  [TransactionOriginType.VideoRefund]: 'Description.VideoRefund',
  [TransactionOriginType.RefundFromItemHold]: 'Description.RefundFromItemHold',
  [TransactionOriginType.CashOut]: 'Description.CashOut',
  [TransactionOriginType.AdjustmentByAdmin]: 'Description.AdjustmentByRobloxAdmin',
  [TransactionOriginType.InGameAdImpressionPayout]: 'Description.InGameAdImpressionPayout',
  [TransactionOriginType.EndorsedAssetReward]: 'Description.EndorsedAssetReward',
  [TransactionOriginType.CsAdjustment]: 'Description.CSAdjustment',
  [TransactionOriginType.Contest]: 'Description.Contest',
  [TransactionOriginType.SurveyWinner]: 'Description.SurveyWinner',
  [TransactionOriginType.Retexture]: 'Description.Retexture',
  [TransactionOriginType.AdvertisingPromotion]: 'Description.AdvertisingPromotion',
  [TransactionOriginType.NewEmployee]: 'Description.NewEmployee',
  [TransactionOriginType.Testing]: 'Description.Testing',
  [TransactionOriginType.AccountRestore]: 'Description.AccountRestores',
  [TransactionOriginType.AdSpend]: 'Description.AdSpend',
  [TransactionOriginType.AdSpendAdjustment]: 'Description.AdSpendAdjustment',
  [TransactionOriginType.AdsRevsharePayout]: 'Description.AdsRevsharePayout',
  [TransactionOriginType.GroupAdsRevsharePayout]: 'Description.GroupAdsRevsharePayout',
  [TransactionOriginType.PendingRobuxSubscriptionsRevsharePayout]:
    'Description.PendingRobuxSubscriptionsPayout',
  [TransactionOriginType.SubscriptionsRevsharePayout]: 'Description.SubscriptionsPayout',
  [TransactionOriginType.GroupSubscriptionsRevsharePayout]: 'Description.GroupSubscriptionsPayout',
  [TransactionOriginType.SubscriptionsRevshareClawback]: 'Description.SubscriptionsReversal',
  [TransactionOriginType.GroupSubscriptionsRevshareClawback]:
    'Description.GroupSubscriptionsReversal',
  [TransactionOriginType.Renewal]: 'Description.RenewedItem',
  [TransactionOriginType.PendingRobuxAdsRevsharePayout]:
    'Description.PendingRobuxAdsRevsharePayout',
  [TransactionOriginType.PublishingAdvanceRebates]: 'Description.PublishingAdvanceRebates',
  [TransactionOriginType.LicensingPayment]: 'Description.LicensingPayment',
  [TransactionOriginType.LicensingPaymentClawback]: 'Description.LicensingPaymentClawback',
  [TransactionOriginType.CurrencyTransfer]: 'Description.CurrencyTransfers',
  [TransactionOriginType.RobloxSelectTransfer]: 'Description.RobloxSelect',
  // Rendered exactly like a Private Server sale: "Sold Private Server" (item name set in the
  // data service) plus the game icon and place link.
  [TransactionOriginType.PrivateServerEngagementPayout]: 'Description.SoldItem',
  [TransactionOriginType.CreatorRewardsPayout]: 'Description.CreatorRewards'
};

export const licensedPaymentTransactionOriginTypeTranslationKeys: {
  [key in LicensedPaymentTransactionOriginType]: string;
} = {
  [LicensedPaymentTransactionOriginType.AdRevSharePayout]: 'Description.AdsRevsharePayout',
  [LicensedPaymentTransactionOriginType.SubscriptionRevSharePayout]:
    'Description.SubscriptionsPayout',
  [LicensedPaymentTransactionOriginType.SubscriptionRevShareClawback]:
    'Description.SubscriptionsReversal',
  [LicensedPaymentTransactionOriginType.VirtualSale]: 'Label.TransactionTypeSale',
  [LicensedPaymentTransactionOriginType.EngagementBasedPayout]: 'Description.DailyEngagementPayout'
};

export const PURCHASE_REFUND_TRANSLATION_KEY = 'Description.RefundedItem';

export const CFT_TRANSLATION_KEY = 'Description.CFT';

export const CreatorRewardsPayoutType = {
  DailyEngagement: 'DailyEngagement',
  AudienceExpansionUniverse: 'AudienceExpansionUniverse',
  AudienceExpansionAffiliatelink: 'AudienceExpansionAffiliatelink'
};
