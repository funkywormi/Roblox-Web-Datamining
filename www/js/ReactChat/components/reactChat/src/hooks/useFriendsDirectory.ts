import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { fetchFriendsPage, fetchUserDetails } from "../services/chatFriendsService";
import { getUserPresences } from "../services/presenceService";
import type { TChatParticipant, TPresenceType } from "../types/chat";
import { getCurrentUserId } from "../utils/currentUser";

const toPresence = (presenceValue?: number | string): TPresenceType => {
  if (presenceValue === 1 || presenceValue === "Online") {
    return "Online";
  }
  if (presenceValue === 2 || presenceValue === "InGame") {
    return "InGame";
  }
  if (presenceValue === 3 || presenceValue === "InStudio") {
    return "InStudio";
  }
  return "Offline";
};

const firstNonEmptyString = (...values: (string | undefined)[]): string | undefined =>
  values.find(value => value != null && value.length > 0);

export const useFriendsDirectory = (): {
  friends: TChatParticipant[];
  isLoading: boolean;
} => {
  const userId = getCurrentUserId();

  const query = useQuery({
    queryKey: chatQueryKeys.friendsDirectory(userId ?? 0),
    queryFn: async (): Promise<TChatParticipant[]> => {
      if (!userId) {
        return [];
      }

      const page = await fetchFriendsPage(userId);
      const friendIds = page.data.map(f => f.id);
      if (friendIds.length === 0) {
        return [];
      }

      const [userDetails, presenceResponse] = await Promise.all([
        fetchUserDetails(friendIds),
        getUserPresences(friendIds),
      ]);

      const userMap = Object.fromEntries(userDetails.map(u => [u.id, u]));
      const presenceMap = Object.fromEntries(
        presenceResponse.userPresences.map(p => [p.userId, p.userPresenceType]),
      );

      return friendIds.map(friendId => {
        const user = userMap[friendId];
        const fallbackName = String(friendId);
        const displayName =
          firstNonEmptyString(user?.displayName?.trim(), user?.name?.trim()) ?? fallbackName;
        const username = firstNonEmptyString(user?.name?.trim()) ?? fallbackName;

        return {
          id: friendId,
          displayName,
          username,
          avatarUrl: "",
          profileUrl: `/users/${friendId}/profile`,
          presence: toPresence(presenceMap[friendId]),
        };
      });
    },
    enabled: userId != null,
    staleTime: 60_000,
  });

  return {
    friends: query.data ?? [],
    isLoading: query.isLoading,
  };
};
