import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { fetchTrustedFriendIds } from "../services/chatFriendsService";
import { getCurrentUserId } from "../utils/currentUser";

const EMPTY: ReadonlySet<number> = new Set();

// Trusted-connection ids among the given users, from the friends-api multiget-are-trusted-friends
// batch endpoint. Feeds the group-OSA consent modal's Trusted label. Only fetches when enabled.
export const useParticipantTrustedUserIds = (
  userIds: readonly number[],
  enabled: boolean,
): ReadonlySet<number> => {
  const currentUserId = getCurrentUserId();
  const userIdsKey = userIds.toSorted((a, b) => a - b).join(",");
  const { data } = useQuery({
    queryKey: chatQueryKeys.trustedConnections(userIdsKey),
    queryFn: async () => {
      if (currentUserId == null) {
        return new Set<number>();
      }
      return new Set(await fetchTrustedFriendIds(currentUserId, userIds));
    },
    enabled: enabled && currentUserId != null && userIds.length > 0,
    staleTime: 60_000,
  });

  return data ?? EMPTY;
};
