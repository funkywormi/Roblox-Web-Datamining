export const chatQueryKeys = {
  all: ["reactChat"] as const,
  conversations: () => [...chatQueryKeys.all, "conversations"] as const,
  /** Unfriended/blocked user ids whose 1:1 is filtered from the list until the server stops returning it. */
  removedFriendUserIds: () => [...chatQueryKeys.all, "removedFriendUserIds"] as const,
  /** Client-only conversations from a first-message send, merged in by useChatData until the server list returns them. */
  pendingConversations: () => [...chatQueryKeys.all, "pendingConversations"] as const,
  conversationMessages: (conversationId: string) =>
    [...chatQueryKeys.all, "conversationMessages", conversationId] as const,
  /** Prefix key matching every conversation's message cache — used to refetch open dialogs on reconnect. */
  conversationMessagesAll: () => [...chatQueryKeys.all, "conversationMessages"] as const,
  /** Client-only moderated messages (### placeholders) that the server does not persist. */
  moderatedMessages: (conversationId: string) =>
    [...chatQueryKeys.all, "moderatedMessages", conversationId] as const,
  /** Client-only failed-to-send messages (kept so the user can see the error and retry). */
  failedMessages: (conversationId: string) =>
    [...chatQueryKeys.all, "failedMessages", conversationId] as const,
  metadata: () => [...chatQueryKeys.all, "metadata"] as const,
  /** Chat settings/metadata (`/v1/metadata`) — carries the eventstream sampling rate. */
  chatSettings: () => [...chatQueryKeys.all, "chatSettings"] as const,
  /** Moderation timeout statuses (fetched for the qualifying conversation ids). */
  moderationTimeouts: (idsKey: string) =>
    [...chatQueryKeys.all, "moderationTimeouts", idsKey] as const,
  friendsDirectory: (userId: number) => [...chatQueryKeys.all, "friendsDirectory", userId] as const,
  /** Prefix key matching the friends directory regardless of userId — for friend/user-tag refreshes. */
  friendsDirectoryAll: () => [...chatQueryKeys.all, "friendsDirectory"] as const,
  presence: (participantIdsKey: string) =>
    [...chatQueryKeys.all, "presence", participantIdsKey] as const,
  /** Prefix key matching presence regardless of participant set — for live presence refreshes. */
  presenceAll: () => [...chatQueryKeys.all, "presence"] as const,
  modalSequence: (conversationId: string) =>
    [...chatQueryKeys.all, "modalSequence", conversationId] as const,
  profileInsights: (userId: number) => [...chatQueryKeys.all, "profileInsights", userId] as const,
  countryRegions: () => [...chatQueryKeys.all, "countryRegions"] as const,
  gamePlaceDetails: (placeId: string) =>
    [...chatQueryKeys.all, "gamePlaceDetails", placeId] as const,
};
