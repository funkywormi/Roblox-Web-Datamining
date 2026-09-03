/**
 * A subset of the TransactionOriginType enum that records the type of transaction that originated a licensed payment.
 * See https://github.rbx.com/Roblox/web-platform/blob/master/Assemblies/Economy/Roblox.Economy.Common/BusinessLogic/TransactionOriginType.cs
 */
enum LicensedPaymentTransactionOriginType {
  AdRevSharePayout = 'AdRevSharePayout',
  SubscriptionRevSharePayout = 'SubscriptionRevSharePayout',
  SubscriptionRevShareClawback = 'SubscriptionRevShareClawback',
  VirtualSale = 'VirtualSale',
  EngagementBasedPayout = 'EngagementBasedPayout'
}

export default LicensedPaymentTransactionOriginType;
