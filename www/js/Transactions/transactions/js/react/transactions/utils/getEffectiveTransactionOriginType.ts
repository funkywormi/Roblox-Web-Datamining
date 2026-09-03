import {
  AgentType,
  CreatorRewardsPayoutType,
  Transaction,
  TransactionOriginType
} from '../../../../ts';

/**
 * Maps the new payout types for creator rewards to the preexisting transaction
 * origin types for the older affiliate link and EBP
 */
export default function getEffectiveTransactionOriginType(
  transaction: Transaction
): TransactionOriginType {
  if (transaction.transactionType !== TransactionOriginType.CreatorRewardsPayout) {
    return transaction.transactionType;
  }

  switch (transaction.details?.creatorRewardsPayoutType) {
    case CreatorRewardsPayoutType.DailyEngagement:
      return transaction.agent?.type === AgentType.Group
        ? TransactionOriginType.GroupEngagementPayout
        : TransactionOriginType.EngagementPayout;
    case CreatorRewardsPayoutType.AudienceExpansionUniverse:
    case CreatorRewardsPayoutType.AudienceExpansionAffiliatelink:
      return TransactionOriginType.AffiliatePayout;
    default:
      return TransactionOriginType.CreatorRewardsPayout;
  }
}

export { getEffectiveTransactionOriginType };
