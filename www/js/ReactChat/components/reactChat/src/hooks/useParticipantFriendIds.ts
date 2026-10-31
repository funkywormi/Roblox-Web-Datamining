import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { fetchParticipantFriendIds } from "../services/chatFriendsService";
import { getCurrentUserId } from "../utils/currentUser";

const EMPTY: ReadonlySet<number> = new Set();

/** Friendship, not trusted-connection status, gates the group member menu's Chat action. */
export const useParticipantFriendIds = (
  userIds: readonly number[],
  enabled: boolean,
): ReadonlySet<number> => {
  const currentUserId = getCurrentUserId();
  const targetIds = [...new Set(userIds)]
    .filter(id => id !== currentUserId)
    .toSorted((a, b) => a - b);
  const { data } = useQuery({
    queryKey: chatQueryKeys.participantFriends(currentUserId ?? 0, targetIds.join(",")),
    queryFn: async () =>
      currentUserId == null
        ? new Set<number>()
        : new Set(await fetchParticipantFriendIds(currentUserId, targetIds)),
    enabled: enabled && currentUserId != null && targetIds.length > 0,
    staleTime: 60_000,
  });
  return enabled ? (data ?? EMPTY) : EMPTY;
};
