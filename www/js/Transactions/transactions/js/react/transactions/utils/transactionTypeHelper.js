import { TransactionType, TransactionTypeBitwise } from '../../../../ts';

/* eslint-disable no-bitwise */
function getUsedTransactionTypes(
  usedTransactionTypeFlags,
  includeSubscriptionsRevshareClawback,
  includeLicensingPaymentClawback
) {
  const usedTransactionTypes = {};
  usedTransactionTypes[TransactionType.Summary] = true;

  // CreatorRewardsPayout will return a total that includes HasEngagementPayout, HasGroupEngagementPayout,
  // and HasAffiliatePayout, so if it is present we need to omit the other three types from the
  // request so they aren't added to the total.
  const hasCreatorRewardsPayout = usedTransactionTypeFlags.HasCreatorRewardsPayout;

  if (usedTransactionTypeFlags.HasAffiliatePayout && !hasCreatorRewardsPayout) {
    usedTransactionTypes[TransactionType.AffiliatePayout] = true;
  }
  if (usedTransactionTypeFlags.HasAdSpend) {
    usedTransactionTypes[TransactionType.AdSpend] = true;
  }
  if (usedTransactionTypeFlags.HasAffiliateSale) {
    usedTransactionTypes[TransactionType.AffiliateSale] = true;
  }
  if (usedTransactionTypeFlags.HasCurrencyPurchase) {
    usedTransactionTypes[TransactionType.CurrencyPurchase] = true;
  }
  if (usedTransactionTypeFlags.HasDevEx) {
    usedTransactionTypes[TransactionType.DevEx] = true;
  }
  if (usedTransactionTypeFlags.HasEngagementPayout && !hasCreatorRewardsPayout) {
    usedTransactionTypes[TransactionType.EngagementPayout] = true;
  }
  if (usedTransactionTypeFlags.HasGroupEngagementPayout && !hasCreatorRewardsPayout) {
    usedTransactionTypes[TransactionType.GroupEngagementPayout] = true;
  }
  if (usedTransactionTypeFlags.HasGroupPayout) {
    usedTransactionTypes[TransactionType.GroupPayout] = true;
  }
  if (usedTransactionTypeFlags.HasPendingRobux) {
    usedTransactionTypes[TransactionType.PendingRobux] = true;
  }
  if (usedTransactionTypeFlags.HasPremiumStipend) {
    usedTransactionTypes[TransactionType.PremiumStipend] = true;
  }
  if (usedTransactionTypeFlags.HasPurchase) {
    usedTransactionTypes[TransactionType.Purchase] = true;
  }
  if (usedTransactionTypeFlags.HasSale) {
    usedTransactionTypes[TransactionType.Sale] = true;
  }
  if (usedTransactionTypeFlags.HasTradeRobux) {
    usedTransactionTypes[TransactionType.TradeRobux] = true;
  }
  if (usedTransactionTypeFlags.HasIndividualToGroup) {
    usedTransactionTypes[TransactionType.IndividualToGroup] = true;
  }
  if (usedTransactionTypeFlags.HasCSAdjustment) {
    usedTransactionTypes[TransactionType.CsAdjustment] = true;
  }
  if (usedTransactionTypeFlags.HasAdsRevsharePayout) {
    usedTransactionTypes[TransactionType.AdsRevsharePayout] = true;
  }
  if (usedTransactionTypeFlags.HasGroupAdsRevsharePayout) {
    usedTransactionTypes[TransactionType.GroupAdsRevsharePayout] = true;
  }
  if (usedTransactionTypeFlags.HasSubscriptionsRevsharePayout) {
    usedTransactionTypes[TransactionType.SubscriptionsRevsharePayout] = true;
    if (includeSubscriptionsRevshareClawback) {
      usedTransactionTypes[TransactionType.SubscriptionsRevshareClawback] = true;
    }
  }
  if (usedTransactionTypeFlags.HasGroupSubscriptionsRevsharePayout) {
    usedTransactionTypes[TransactionType.GroupSubscriptionsRevsharePayout] = true;
    if (includeSubscriptionsRevshareClawback) {
      usedTransactionTypes[TransactionType.GroupSubscriptionsRevshareClawback] = true;
    }
  }
  if (usedTransactionTypeFlags.HasPublishingAdvanceRebates) {
    usedTransactionTypes[TransactionType.PublishingAdvanceRebates] = true;
  }
  if (usedTransactionTypeFlags.HasLicensingPayment) {
    usedTransactionTypes[TransactionType.LicensingPayment] = true;
    if (includeLicensingPaymentClawback) {
      usedTransactionTypes[TransactionType.LicensingPaymentClawback] = true;
    }
  }
  if (usedTransactionTypeFlags.HasTransfer) {
    usedTransactionTypes[TransactionType.CurrencyTransfer] = true;
  }

  if (usedTransactionTypeFlags.HasRobloxSelectTransfer) {
    usedTransactionTypes[TransactionType.RobloxSelectTransfer] = true;
  }

  if (usedTransactionTypeFlags.HasPrivateServerEngagementPayout) {
    usedTransactionTypes[TransactionType.PrivateServerEngagementPayout] = true;
  }

  if (hasCreatorRewardsPayout) {
    usedTransactionTypes[TransactionType.CreatorRewardsPayout] = true;
  }

  return usedTransactionTypes;
}

// The function to generate the bitwise int from usedTransactionTypes object.
function generateBitwiseFlagFromUsedTypes(usedTransactionTypes) {
  let bitwiseFlag = 0;

  Object.keys(usedTransactionTypes).forEach(key => {
    if (usedTransactionTypes[key]) {
      switch (key) {
        case TransactionType.AdSpend:
          bitwiseFlag |= TransactionTypeBitwise.AdSpend;
          break;
        case TransactionType.AdsRevsharePayout:
          bitwiseFlag |= TransactionTypeBitwise.AdsRevsharePayout;
          break;
        case TransactionType.AffiliatePayout:
          bitwiseFlag |= TransactionTypeBitwise.AffiliatePayout;
          break;
        case TransactionType.AffiliateSale:
          bitwiseFlag |= TransactionTypeBitwise.AffiliateSale;
          break;
        case TransactionType.CsAdjustment:
          bitwiseFlag |= TransactionTypeBitwise.CsAdjustment;
          break;
        case TransactionType.CurrencyPurchase:
          bitwiseFlag |= TransactionTypeBitwise.CurrencyPurchase;
          break;
        case TransactionType.DevEx:
          bitwiseFlag |= TransactionTypeBitwise.DevEx;
          break;
        case TransactionType.EngagementPayout:
          bitwiseFlag |= TransactionTypeBitwise.EngagementPayout;
          break;
        case TransactionType.GroupAdsRevsharePayout:
          bitwiseFlag |= TransactionTypeBitwise.GroupAdsRevsharePayout;
          break;
        case TransactionType.GroupEngagementPayout:
          bitwiseFlag |= TransactionTypeBitwise.GroupEngagementPayout;
          break;
        case TransactionType.GroupPayout:
          bitwiseFlag |= TransactionTypeBitwise.GroupPayout;
          break;
        case TransactionType.GroupSubscriptionsRevshareClawback:
          bitwiseFlag |= TransactionTypeBitwise.GroupSubscriptionsRevshareClawback;
          break;
        case TransactionType.GroupSubscriptionsRevsharePayout:
          bitwiseFlag |= TransactionTypeBitwise.GroupSubscriptionsRevsharePayout;
          break;
        case TransactionType.IndividualToGroup:
          bitwiseFlag |= TransactionTypeBitwise.IndividualToGroup;
          break;
        case TransactionType.PendingRobux:
          bitwiseFlag |= TransactionTypeBitwise.PendingRobux;
          break;
        case TransactionType.PremiumStipend:
          bitwiseFlag |= TransactionTypeBitwise.PremiumStipend;
          break;
        case TransactionType.PublishingAdvanceRebates:
          bitwiseFlag |= TransactionTypeBitwise.PublishingAdvanceRebates;
          break;
        case TransactionType.Purchase:
          bitwiseFlag |= TransactionTypeBitwise.Purchase;
          break;
        case TransactionType.Sale:
          bitwiseFlag |= TransactionTypeBitwise.Sale;
          break;
        case TransactionType.SubscriptionsRevshareClawback:
          bitwiseFlag |= TransactionTypeBitwise.SubscriptionsRevshareClawback;
          break;
        case TransactionType.SubscriptionsRevsharePayout:
          bitwiseFlag |= TransactionTypeBitwise.SubscriptionsRevsharePayout;
          break;
        case TransactionType.Summary:
          bitwiseFlag |= TransactionTypeBitwise.Summary;
          break;
        case TransactionType.TradeRobux:
          bitwiseFlag |= TransactionTypeBitwise.TradeRobux;
          break;
        case TransactionType.LicensingPayment:
          bitwiseFlag |= TransactionTypeBitwise.LicensingPayment;
          break;
        case TransactionType.LicensingPaymentClawback:
          bitwiseFlag |= TransactionTypeBitwise.LicensingPaymentClawback;
          break;
        case TransactionType.CurrencyTransfer:
          bitwiseFlag |= TransactionTypeBitwise.CurrencyTransfer;
          break;
        case TransactionType.RobloxSelectTransfer:
          bitwiseFlag |= TransactionTypeBitwise.RobloxSelectTransfer;
          break;
        case TransactionType.PrivateServerEngagementPayout:
          bitwiseFlag |= TransactionTypeBitwise.PrivateServerEngagementPayout;
          break;
        case TransactionType.CreatorRewardsPayout:
          bitwiseFlag |= TransactionTypeBitwise.CreatorRewardsPayout;
          break;
        default:
          break;
      }
    }
  });

  return bitwiseFlag;
}

// The function to convert the bitwise int into usedTransactionTypes object.
function convertBitwiseFlagToUsedTypes(bitwiseFlag) {
  const usedTransactionTypes = {};

  usedTransactionTypes[TransactionType.AdSpend] =
    (bitwiseFlag & TransactionTypeBitwise.AdSpend) !== 0;
  usedTransactionTypes[TransactionType.AdsRevsharePayout] =
    (bitwiseFlag & TransactionTypeBitwise.AdsRevsharePayout) !== 0;
  usedTransactionTypes[TransactionType.AffiliatePayout] =
    (bitwiseFlag & TransactionTypeBitwise.AffiliatePayout) !== 0;
  usedTransactionTypes[TransactionType.AffiliateSale] =
    (bitwiseFlag & TransactionTypeBitwise.AffiliateSale) !== 0;
  usedTransactionTypes[TransactionType.CsAdjustment] =
    (bitwiseFlag & TransactionTypeBitwise.CsAdjustment) !== 0;
  usedTransactionTypes[TransactionType.CurrencyPurchase] =
    (bitwiseFlag & TransactionTypeBitwise.CurrencyPurchase) !== 0;
  usedTransactionTypes[TransactionType.DevEx] = (bitwiseFlag & TransactionTypeBitwise.DevEx) !== 0;
  usedTransactionTypes[TransactionType.EngagementPayout] =
    (bitwiseFlag & TransactionTypeBitwise.EngagementPayout) !== 0;
  usedTransactionTypes[TransactionType.GroupAdsRevsharePayout] =
    (bitwiseFlag & TransactionTypeBitwise.GroupAdsRevsharePayout) !== 0;
  usedTransactionTypes[TransactionType.GroupEngagementPayout] =
    (bitwiseFlag & TransactionTypeBitwise.GroupEngagementPayout) !== 0;
  usedTransactionTypes[TransactionType.GroupPayout] =
    (bitwiseFlag & TransactionTypeBitwise.GroupPayout) !== 0;
  usedTransactionTypes[TransactionType.GroupSubscriptionsRevshareClawback] =
    (bitwiseFlag & TransactionTypeBitwise.GroupSubscriptionsRevshareClawback) !== 0;
  usedTransactionTypes[TransactionType.GroupSubscriptionsRevsharePayout] =
    (bitwiseFlag & TransactionTypeBitwise.GroupSubscriptionsRevsharePayout) !== 0;
  usedTransactionTypes[TransactionType.IndividualToGroup] =
    (bitwiseFlag & TransactionTypeBitwise.IndividualToGroup) !== 0;
  usedTransactionTypes[TransactionType.PendingRobux] =
    (bitwiseFlag & TransactionTypeBitwise.PendingRobux) !== 0;
  usedTransactionTypes[TransactionType.PremiumStipend] =
    (bitwiseFlag & TransactionTypeBitwise.PremiumStipend) !== 0;
  usedTransactionTypes[TransactionType.PublishingAdvanceRebates] =
    (bitwiseFlag & TransactionTypeBitwise.PublishingAdvanceRebates) !== 0;
  usedTransactionTypes[TransactionType.Purchase] =
    (bitwiseFlag & TransactionTypeBitwise.Purchase) !== 0;
  usedTransactionTypes[TransactionType.Sale] = (bitwiseFlag & TransactionTypeBitwise.Sale) !== 0;
  usedTransactionTypes[TransactionType.SubscriptionsRevshareClawback] =
    (bitwiseFlag & TransactionTypeBitwise.SubscriptionsRevshareClawback) !== 0;
  usedTransactionTypes[TransactionType.SubscriptionsRevsharePayout] =
    (bitwiseFlag & TransactionTypeBitwise.SubscriptionsRevsharePayout) !== 0;
  usedTransactionTypes[TransactionType.Summary] =
    (bitwiseFlag & TransactionTypeBitwise.Summary) !== 0;
  usedTransactionTypes[TransactionType.TradeRobux] =
    (bitwiseFlag & TransactionTypeBitwise.TradeRobux) !== 0;
  usedTransactionTypes[TransactionType.LicensingPayment] =
    (bitwiseFlag & TransactionTypeBitwise.LicensingPayment) !== 0;
  usedTransactionTypes[TransactionType.LicensingPaymentClawback] =
    (bitwiseFlag & TransactionTypeBitwise.LicensingPaymentClawback) !== 0;
  usedTransactionTypes[TransactionType.RobloxSelectTransfer] =
    (bitwiseFlag & TransactionTypeBitwise.RobloxSelectTransfer) !== 0;
  usedTransactionTypes[TransactionType.PrivateServerEngagementPayout] =
    (bitwiseFlag & TransactionTypeBitwise.PrivateServerEngagementPayout) !== 0;
  usedTransactionTypes[TransactionType.CreatorRewardsPayout] =
    (bitwiseFlag & TransactionTypeBitwise.CreatorRewardsPayout) !== 0;

  return usedTransactionTypes;
}

export { getUsedTransactionTypes, generateBitwiseFlagFromUsedTypes, convertBitwiseFlagToUsedTypes };
