/**
 * This comes from TransactionType. "PendingRobux" and "Summary" enum items are skipped.
 * Always sync with:
 * https://sourcegraph.rbx.com/github.rbx.com/Roblox/transaction-records/-/blob/services/transaction-records-api/src/Implementation/TransactionTotalsFactory.cs?L31
 */
/* eslint-disable no-bitwise */
enum TransactionTypeBitwise {
  AdSpend = 1 << 0,
  AdsRevsharePayout = 1 << 1,
  AffiliatePayout = 1 << 2,
  AffiliateSale = 1 << 3,
  CsAdjustment = 1 << 4,
  CurrencyPurchase = 1 << 5,
  DevEx = 1 << 6,
  EngagementPayout = 1 << 7,
  GroupAdsRevsharePayout = 1 << 8,
  GroupEngagementPayout = 1 << 9,
  GroupPayout = 1 << 10,
  GroupSubscriptionsRevshareClawback = 1 << 11,
  GroupSubscriptionsRevsharePayout = 1 << 12,
  IndividualToGroup = 1 << 13,
  PendingRobux = 1 << 14,
  PremiumStipend = 1 << 15,
  PublishingAdvanceRebates = 1 << 16,
  Purchase = 1 << 17,
  Sale = 1 << 18,
  SubscriptionsRevshareClawback = 1 << 19,
  SubscriptionsRevsharePayout = 1 << 20,
  Summary = 1 << 21,
  TradeRobux = 1 << 22,
  LicensingPayment = 1 << 23,
  LicensingPaymentClawback = 1 << 24,
  CurrencyTransfer = 1 << 25,
  RobloxSelectTransfer = 1 << 26,
  PrivateServerEngagementPayout = 1 << 27,
  // Bit 28 is currently not integrated
  CreatorRewardsPayout = 1 << 29
}

export default TransactionTypeBitwise;
