import { useQuery } from '@tanstack/react-query';
import communityTierService from '../communityTier/communityTierService';

const QUERY_KEY = (groupId: number): readonly ['group-unrestricted-eligibility', number] => [
  'group-unrestricted-eligibility',
  groupId
];

/**
 * Returns whether the community's tier is eligible for Unrestricted Messages.
 *
 * Server-computed from the authoritative tier-capability rules and surfaced on the group detail
 * response (`communityTier.capabilities.isEligibleForUnrestrictedMessages`). Read directly rather
 * than via `useCommunityTier`, whose tier mapping discards the Enterprise tier this capability is
 * granted at. Decoupled from the `ForumsUnrestrictedMessages` product feature (tier eligibility vs.
 * feature rollout), so callers gate on both. Defaults to `false` while loading or when absent.
 */
const useIsEligibleForUnrestrictedMessages = (groupId: number | undefined): boolean => {
  const { data } = useQuery<boolean>({
    queryKey: QUERY_KEY(groupId ?? 0),
    queryFn: () => communityTierService.getUnrestrictedMessagesEligibility(groupId as number),
    enabled: Boolean(groupId),
    staleTime: Infinity
  });
  return data ?? false;
};

export default useIsEligibleForUnrestrictedMessages;
