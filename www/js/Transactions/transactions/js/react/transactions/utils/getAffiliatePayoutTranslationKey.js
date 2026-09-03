import {
  CreatorRewardsPayoutType,
  transactionOriginTypeTranslationKeys,
  TransactionOriginType
} from '../../../../ts';

export default function getAffiliatePayoutTranslationKey(item) {
  // For newer transactions
  if (item.creatorRewardsPayoutType === CreatorRewardsPayoutType.AudienceExpansionAffiliatelink) {
    return 'Description.CreatorRewardsAudienceExpansionCampaignName';
  }
  if (item.creatorRewardsPayoutType === CreatorRewardsPayoutType.AudienceExpansionUniverse) {
    return 'Description.CreatorRewardsAudienceExpansion';
  }
  // For legacy transactions
  let translationKey = transactionOriginTypeTranslationKeys[TransactionOriginType.AffiliatePayout];
  if (item.holdTypeId === 1) {
    translationKey = 'Description.CreatorRewardsAudienceExpansionCampaignName';
  } else if (item.holdTypeId === 2) {
    translationKey = 'Description.AffiliatePayoutFriendReferral';
  } else if (item.holdTypeId === 3 || item.holdTypeId === 4 || item.holdTypeId === 5) {
    // deprecated = 3/4 narrow search + direct link and live = 5 audience expansion
    translationKey = 'Description.CreatorRewardsAudienceExpansion';
  }

  return translationKey;
}

export { getAffiliatePayoutTranslationKey };
