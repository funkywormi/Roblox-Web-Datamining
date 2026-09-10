import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { fetchFriendsPage, fetchUserNames } from "../services/chatFriendsService";
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

      // Names from user-profile-api, presence from presence-api.
      const [names, presenceResponse] = await Promise.all([
        fetchUserNames(friendIds),
        getUserPresences(friendIds),
      ]);

      const presenceMap = Object.fromEntries(
        presenceResponse.userPresences.map(p => [p.userId, p.userPresenceType]),
      );

      return friendIds.map(friendId => {
        const profileNames = names[friendId];
        const fallbackName = String(friendId);
        const displayName =
          firstNonEmptyString(profileNames?.combinedName?.trim(), profileNames?.username?.trim()) ??
          fallbackName;
        const username = firstNonEmptyString(profileNames?.username?.trim()) ?? fallbackName;

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
