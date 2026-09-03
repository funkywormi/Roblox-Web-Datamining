import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import groupsService from '../services/groupsService';
import queryKeys from '../services/queryKeys';
import useGuacConfig from './useGuacConfig';

/**
 * Whether the caller may see who is in a community.
 *
 * Not a group permission: it comes from the member-list visibility policy and, when that policy
 * is enforced, from the caller's own membership. Mirrors the derivation the Angular group
 * controller does, so features can stop having it piped in as a prop.
 *
 * Denied until both sources have settled — a missing policy must never open a feature up.
 * Requires a QueryClientProvider ancestor.
 */
function useCanViewMembers(groupId: number): boolean {
  const { data: groupDetailsUi, isLoading: isGuacLoading } = useGuacConfig('group-details-ui');
  const { data: membership, isLoading: isMembershipLoading } = useQuery({
    queryKey: queryKeys.getGroupMembershipKey(groupId),
    queryFn: () => groupsService.getGroupMembership(groupId),
    enabled: groupId > 0
  });

  return useMemo(() => {
    if (isGuacLoading || isMembershipLoading) return false;
    if (groupDetailsUi?.isGracefulDegradationEnabled) return false;
    if (groupDetailsUi?.isMemberListVisibilityEnforced) {
      return membership?.canViewMemberList === true;
    }
    return groupDetailsUi?.displayMembers === true;
  }, [isGuacLoading, isMembershipLoading, groupDetailsUi, membership]);
}

export default useCanViewMembers;
