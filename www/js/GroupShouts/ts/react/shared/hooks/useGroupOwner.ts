import { useQuery } from '@tanstack/react-query';
import groupsService from '../services/groupsService';

const GROUP_OWNER_QUERY_KEY = (groupId: number): readonly ['group-owner', number] => [
  'group-owner',
  groupId
];

/**
 * Self-hydrating hook that returns the community owner's `userId` for `groupId`.
 *
 * Fires a single `GET /v1/groups/{groupId}` the first time any consumer (e.g. `useIsCommunityOwner`,
 * `MembersListDialog`) renders with a given `groupId`. All subsequent consumers on the page share
 * the cached value (`staleTime: Infinity` -- ownership rarely changes within an SPA session) and
 * the cache is reused across SPA navigations within the same `QueryClient`.
 *
 * No install-point coupling: the hook owns its own fetch lifecycle. Just call it with a `groupId`
 * anywhere under a `QueryClientProvider`.
 */
const useGroupOwner = (groupId: number | undefined): number | undefined => {
  const { data } = useQuery<number | undefined>({
    queryKey: GROUP_OWNER_QUERY_KEY(groupId ?? 0),
    queryFn: async () => {
      const group = await groupsService.getGroup(groupId as number);
      return group.owner?.userId;
    },
    enabled: Boolean(groupId),
    staleTime: Infinity
  });
  return data;
};

export default useGroupOwner;
