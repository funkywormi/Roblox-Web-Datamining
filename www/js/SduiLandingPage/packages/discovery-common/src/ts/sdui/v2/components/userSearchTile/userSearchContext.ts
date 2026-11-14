import type { ProfileInsightJson } from "@rbx/friends-common/profile-insights";
import { friendshipStatuses, type FriendshipStatus } from "../friendRequestButton/friendshipStatus";

export type UserSearchContext =
  | { kind: "you" }
  | { kind: "previous-username" }
  | { kind: "experience"; experienceName: string }
  | { kind: "friend" | "connection" | "following" | "frequent" | "classmates" }
  | { kind: "mutual-friends"; count: number };

type SelectUserSearchContextOptions = {
  friendshipStatus: FriendshipStatus | undefined;
  isFollowing: boolean;
  isInGame: boolean;
  isPreviousUsernameMatch: boolean;
  isSelf: boolean;
  lastLocation: string | undefined;
  profileInsights: readonly ProfileInsightJson[];
  renameFriendsToConnections: boolean;
};

function getMutualFriendCount(profileInsights: readonly ProfileInsightJson[]): number {
  for (const profileInsight of profileInsights) {
    const mutualFriends = profileInsight.mutualFriendInsight?.mutualFriends;
    if (mutualFriends != null) {
      return Object.keys(mutualFriends).length;
    }
  }
  return 0;
}

export function selectUserSearchContext({
  friendshipStatus,
  isFollowing,
  isInGame,
  isPreviousUsernameMatch,
  isSelf,
  lastLocation,
  profileInsights,
  renameFriendsToConnections,
}: SelectUserSearchContextOptions): UserSearchContext | undefined {
  if (isSelf) {
    return { kind: "you" };
  }

  if (isPreviousUsernameMatch) {
    return { kind: "previous-username" };
  }

  if (friendshipStatus === friendshipStatuses.friends) {
    const normalizedLastLocation = lastLocation?.trim();
    if (isInGame && normalizedLastLocation != null && normalizedLastLocation !== "") {
      return { kind: "experience", experienceName: normalizedLastLocation };
    }
    return { kind: renameFriendsToConnections ? "connection" : "friend" };
  }

  if (isFollowing) {
    return { kind: "following" };
  }

  const mutualFriendCount = getMutualFriendCount(profileInsights);
  if (mutualFriendCount > 0) {
    return { kind: "mutual-friends", count: mutualFriendCount };
  }

  if (
    profileInsights.some(
      profileInsight => profileInsight.playedTogetherInsight?.havePlayedTogether === true,
    )
  ) {
    return { kind: "frequent" };
  }

  if (
    profileInsights.some(profileInsight => profileInsight.classmatesInsight?.isClassmate === true)
  ) {
    return { kind: "classmates" };
  }

  return undefined;
}
