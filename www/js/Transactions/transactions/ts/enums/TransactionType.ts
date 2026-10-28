enum TransactionType {
  AdSpend = 'AdSpend',
  AdsRevsharePayout = 'AdsRevsharePayout',
  AffiliatePayout = 'AffiliatePayout',
  AffiliateSale = 'AffiliateSale',
  CsAdjustment = 'CsAdjustment',
  CurrencyPurchase = 'CurrencyPurchase',
  DevEx = 'DevEx',
  EngagementPayout = 'EngagementPayout',
  GroupAdsRevsharePayout = 'GroupAdsRevsharePayout',
  GroupEngagementPayout = 'GroupEngagementPayout',
  GroupPayout = 'GroupPayout',
  GroupSubscriptionsRevshareClawback = 'GroupSubscriptionsRevshareClawback',
  GroupSubscriptionsRevsharePayout = 'GroupSubscriptionsRevsharePayout',
  IndividualToGroup = 'IndividualToGroup',
  PendingRobux = 'PendingRobux',
  PremiumStipend = 'PremiumStipend',
  PrivateServerEngagementPayout = 'PrivateServerEngagementPayout',
  PublishingAdvanceRebates = 'PublishingAdvanceRebates',
  Purchase = 'Purchase',
  Sale = 'Sale',
  SubscriptionsRevshareClawback = 'SubscriptionsRevshareClawback',
  SubscriptionsRevsharePayout = 'SubscriptionsRevsharePayout',
  Summary = 'Summary',
  TradeRobux = 'TradeRobux',
  LicensingPayment = 'LicensingPayment',
  LicensingPaymentClawback = 'LicensingPaymentClawback',
  CurrencyTransfer = 'CurrencyTransfer',
  RobloxSelectTransfer = 'RobloxSelectTransfer',
  CreatorRewardsPayout = 'CreatorRewardsPayout',
  SubscriptionReferralPayout = 'SubscriptionReferralPayout',
  /**
   * Gifts the viewer has received. The member name is sent verbatim as the transactionType query
   * param and must stay equal to the api's enum member, which is `Gifts`.
   */
  Gifts = 'Gifts'
}

export default TransactionType;
