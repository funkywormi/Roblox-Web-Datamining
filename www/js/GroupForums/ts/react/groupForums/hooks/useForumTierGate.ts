import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import useCommunityTier from '../../shared/communityTier/useCommunityTier';
import { CommunityTierValues } from '../../shared/communityTier/types';
import useForumStore from './useForumStore';

type ForumTierGateState = {
  isTierGated: boolean;
  /**
   * True until every input to the gate has settled. Callers must keep write
   * affordances disabled while it is set: the gate cannot be evaluated yet, and
   * letting a gated viewer into a composer that then vanishes underneath them
   * loses their input, or races their submission.
   */
  isResolving: boolean;
};

/**
 * Single source of truth for the community tier forum-write gate: communities
 * below Professional only get unrestricted two-way communication with viewers
 * who are eligible for restricted communications, so everyone else is blocked
 * from writing posts and comments.
 *
 * Gating on the tier alone is not enough — the backend's top-level setting can
 * populate tier data while the per-community product feature is still off.
 */
const useForumTierGate = (): ForumTierGateState => {
  const groupId = useForumStore.use.groupId();
  const { features, isLoading: areFeaturesLoading } = useCommunityProductFeatures();
  const { tierInfo, isLoading: isTierLoading } = useCommunityTier(groupId);
  const { data: groupDetailsUi, isLoading: isGuacLoading } = useGuacConfig('group-details-ui');

  const restrictedEligibility = groupDetailsUi?.eligibleForRestrictedCommunications ?? 'Ineligible';

  // The tier query is disabled until there is a group id, and a disabled query
  // reports `isLoading` forever — so only count it while it can actually run.
  const isResolving = areFeaturesLoading || isGuacLoading || (groupId > 0 && isTierLoading);

  return {
    isResolving,
    isTierGated:
      features.CommunityTiers === true &&
      tierInfo != null &&
      tierInfo.currentTier < CommunityTierValues.Professional &&
      !isGuacLoading &&
      restrictedEligibility !== 'Eligible'
  };
};

export default useForumTierGate;
