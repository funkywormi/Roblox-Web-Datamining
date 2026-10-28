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
  [TransactionType.CreatorRewardsPayout]: 'Label.TransactionTypeCreatorRewards',
  [TransactionType.SubscriptionReferralPayout]: 'Label.ReferralPayouts',
  [TransactionType.Gifts]: 'Label.TransactionTypeGifts'
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
  [TransactionOriginType.CreatorRewardsPayout]: 'Description.CreatorRewards',
  [TransactionOriginType.SubscriptionReferralPayout]: 'Description.ReferralPayout'
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

/**
 * English fallbacks for category labels whose keys are not authored yet. Same reason as
 * GIFT_TRANSLATION_FALLBACKS: an unresolved key renders an unreadable, selectable dropdown entry.
 */
export const TRANSACTION_TYPE_LABEL_FALLBACKS: { [key: string]: string } = {
  'Label.TransactionTypeGifts': 'Gifts Received'
};

/**
 * Gift wording keys. Three distinct rows come out of one gift, so each gets its own key:
 * the recipient's receipt, the sender's purchase, and the creator's sale.
 *
 * `transactionSubtype` alone cannot pick between the last two -- both carry `Gift` -- so the
 * transaction type is part of the decision. See getGiftTranslationKey.
 */
export const GIFT_RECEIPT_TRANSLATION_KEY = 'Description.AcceptedItem';
export const GIFTED_PURCHASE_WITH_RECIPIENT_TRANSLATION_KEY = 'Description.GiftedItemToRecipient';
export const GIFTED_PURCHASE_TRANSLATION_KEY = 'Description.GiftedItem';
export const GIFTED_SALE_TRANSLATION_KEY = 'Description.SoldItemAsGift';

/**
 * English fallbacks for the gift keys, used until they are authored in the localization tool.
 *
 * The `translate(key) || 'English'` pattern is used throughout this app, but it does not survive
 * token substitution -- a missing key returns falsy and the tokens are lost with it. These
 * templates carry the same tokens so the fallback renders a complete sentence rather than a bare
 * item name.
 *
 * **This deliberately applies to the sender's and the creator's rows too**, whose current wording
 * ("Purchased {item}" / "Sold {item}") IS already translated, so for a non-English locale this
 * swaps a translated string for an English one. Raised in review and accepted by the owner: the
 * first use is an internal demo, not a worldwide release, so showing the gift wording in English
 * is better than showing wording that does not mention the gift at all. Authoring the keys is the
 * follow-up that makes this map, and this trade-off, go away.
 */
export const GIFT_TRANSLATION_FALLBACKS: { [key: string]: string } = {
  [GIFT_RECEIPT_TRANSLATION_KEY]: 'Accepted {item}',
  [GIFTED_PURCHASE_WITH_RECIPIENT_TRANSLATION_KEY]: 'Gifted {item} to {recipient}',
  [GIFTED_PURCHASE_TRANSLATION_KEY]: 'Gifted {item}',
  [GIFTED_SALE_TRANSLATION_KEY]: 'Sold {item} as a gift'
};
/**
 * Shown in the Amount column for a row whose amount carries no meaning -- today only a gift
 * receipt, which is always 0 Robux. A constant rather than an inline literal because
 * react/jsx-no-literals forbids strings in JSX.
 */
export const EMPTY_AMOUNT_PLACEHOLDER = '\u2014';

export const CFT_TRANSLATION_KEY = 'Description.CFT';

export const CreatorRewardsPayoutType = {
  DailyEngagement: 'DailyEngagement',
  AudienceExpansionUniverse: 'AudienceExpansionUniverse',
  AudienceExpansionAffiliatelink: 'AudienceExpansionAffiliatelink'
};
