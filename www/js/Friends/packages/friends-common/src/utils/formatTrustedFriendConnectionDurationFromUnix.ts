import { trustedFriendsTranslationKeys } from "../constants/trustedFriendsModal";

export function formatTrustedFriendConnectionDurationFromUnix(
  friendshipStartUnixSeconds: number | undefined,
  translate: (resourceId: string, params?: Record<string, unknown>) => string,
  keys: typeof trustedFriendsTranslationKeys,
  options?: { nowUnixSeconds?: number },
): string {
  if (friendshipStartUnixSeconds == null || friendshipStartUnixSeconds <= 0) {
    return "";
  }

  const now = options?.nowUnixSeconds ?? Math.floor(Date.now() / 1000);
  const elapsedSeconds = Math.max(0, now - friendshipStartUnixSeconds);
  const normalizedFriendshipAge = Math.floor(elapsedSeconds / 60 / 60 / 24);

  if (normalizedFriendshipAge >= 365) {
    const years = Math.floor(normalizedFriendshipAge / 365);
    if (years === 1) {
      return translate(keys.connectedOneYear);
    }
    return translate(keys.connectedNumYears, { num: years });
  }

  if (normalizedFriendshipAge >= 30) {
    const months = Math.floor(normalizedFriendshipAge / 30);
    if (months === 1) {
      return translate(keys.connectedOneMonth);
    }
    return translate(keys.connectedNumMonths, { num: months });
  }

  if (normalizedFriendshipAge === 1) {
    return translate(keys.connectedOneDay);
  }

  if (normalizedFriendshipAge > 1) {
    return translate(keys.connectedNumDays, { num: normalizedFriendshipAge });
  }

  return translate(keys.newFriend);
}
