import { useCallback, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { GroupTierInfo } from './types';
import communityTierService from './communityTierService';

type UseCommunityTierResult = {
  // `null` means the backend reported no tier for this community, which is
  // distinct from `undefined` (still loading / errored). Neither may be treated
  // as Basic — see `mapGroupSettingsToTierInfo`.
  tierInfo: GroupTierInfo | null | undefined;
  isLoading: boolean;
  isError: boolean;
};

type UseConfigureCommunityTierResult = UseCommunityTierResult & {
  isEvaluating: boolean;
  /**
   * Re-evaluates the community's tier and updates the cache. Resolves to false
   * only when the request itself fails, so the caller can surface the failure. An
   * evaluation that succeeds but reports no tier resolves to true and caches
   * null — the page keeps its Recheck affordance instead of claiming an error.
   */
  evaluate: () => Promise<boolean>;
};

export function getCommunityTierQueryKey(groupId: number): [string, number] {
  return ['communityTier', groupId];
}

/**
 * Keyed separately from the group-settings query: the two endpoints are read by
 * different audiences, so their results must not share a cache entry.
 */
export function getPublicCommunityTierQueryKey(groupId: number): [string, number] {
  return ['communityTier-groupDetail', groupId];
}

/**
 * Read-only community tier for surfaces that any viewer can reach, sourced from
 * the group detail response.
 *
 * Prefer this over `useConfigureCommunityTier` unless you specifically need to
 * re-evaluate the tier: group settings returns 403 for non-members, so reading
 * the tier from it on a public surface fails for every guest.
 */
export default function useCommunityTier(groupId: number): UseCommunityTierResult {
  const { data: tierInfo, isLoading, isError } = useQuery({
    queryKey: getPublicCommunityTierQueryKey(groupId),
    queryFn: () => communityTierService.getGroupTierInfoFromGroupDetail(groupId),
    enabled: groupId > 0
  });

  return { tierInfo, isLoading, isError };
}

/**
 * Community tier plus re-evaluation, sourced from group settings. Only for
 * owner/manager surfaces — group settings returns 403 for non-members.
 */
export function useConfigureCommunityTier(groupId: number): UseConfigureCommunityTierResult {
  const queryClient = useQueryClient();
  const [isEvaluating, setIsEvaluating] = useState(false);

  const { data: tierInfo, isLoading, isError } = useQuery({
    queryKey: getCommunityTierQueryKey(groupId),
    queryFn: () => communityTierService.getGroupTierInfo(groupId),
    enabled: groupId > 0
  });

  const evaluate = useCallback(async () => {
    if (groupId <= 0) {
      return false;
    }

    setIsEvaluating(true);
    try {
      const freshTierInfo = await communityTierService.evaluateGroupTier(groupId);
      queryClient.setQueryData(getCommunityTierQueryKey(groupId), freshTierInfo);
      return true;
    } catch {
      return false;
    } finally {
      setIsEvaluating(false);
    }
  }, [groupId, queryClient]);

  return {
    tierInfo,
    isLoading,
    isError,
    isEvaluating,
    evaluate
  };
}
