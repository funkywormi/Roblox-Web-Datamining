import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { UserProfileField, useUserProfiles } from "@rbx/user-profiles";
import { chatQueryKeys } from "../constants/queryKeys";
import { fetchFriendsPage } from "../services/chatFriendsService";
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

// combinedName for display, username for search.
const PROFILE_FIELDS = [UserProfileField.Names.CombinedName, UserProfileField.Names.Username];

// `enabled` gates the fetch: GroupInviteDialog stays mounted while closed, so only fetch when open.
export const useFriendsDirectory = (
  enabled = true,
): {
  friends: TChatParticipant[];
  isLoading: boolean;
} => {
  const userId = getCurrentUserId();

  const friendsQuery = useQuery({
    queryKey: chatQueryKeys.friendsDirectory(userId ?? 0),
    queryFn: async (): Promise<{
      ids: number[];
      presenceByUserId: Record<number, number | string | undefined>;
    }> => {
      if (userId == null) {
        return { ids: [], presenceByUserId: {} };
      }
      const page = await fetchFriendsPage(userId);
      const ids = page.data.map(friend => friend.id);
      if (ids.length === 0) {
        return { ids, presenceByUserId: {} };
      }
      const presence = await getUserPresences(ids);
      const presenceByUserId: Record<number, number | string | undefined> = {};
      for (const entry of presence.userPresences) {
        presenceByUserId[entry.userId] = entry.userPresenceType;
      }
      return { ids, presenceByUserId };
    },
    enabled: userId != null && enabled,
    staleTime: 60_000,
  });

  const friendIds = useMemo(() => friendsQuery.data?.ids ?? [], [friendsQuery.data]);

  // Names via the shared @rbx/user-profiles external (same call as legacy watchUserProfiles); skips
  // on empty ids.
  const { data: profiles, loading: areNamesLoading } = useUserProfiles(friendIds, PROFILE_FIELDS);

  const friends = useMemo<TChatParticipant[]>(() => {
    const presenceByUserId = friendsQuery.data?.presenceByUserId ?? {};
    return friendIds.map(friendId => {
      const names = profiles?.[friendId]?.names;
      const fallbackName = String(friendId);
      const displayName =
        firstNonEmptyString(names?.combinedName?.trim(), names?.username?.trim()) ?? fallbackName;
      const username = firstNonEmptyString(names?.username?.trim()) ?? fallbackName;

      return {
        id: friendId,
        displayName,
        username,
        avatarUrl: "",
        profileUrl: `/users/${friendId}/profile`,
        presence: toPresence(presenceByUserId[friendId]),
      };
    });
  }, [friendIds, profiles, friendsQuery.data]);

  return {
    friends,
    // Cover name loading too, so rows don't flash raw ids before combinedName resolves.
    isLoading: friendsQuery.isLoading || (friendIds.length > 0 && areNamesLoading),
  };
};
