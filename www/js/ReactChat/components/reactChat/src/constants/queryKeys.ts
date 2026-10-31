export const chatQueryKeys = {
  all: ["reactChat"] as const,
  conversations: () => [...chatQueryKeys.all, "conversations"] as const,
  /** Unfriended/blocked user ids whose 1:1 is filtered from the list until the server stops returning it. */
  removedFriendUserIds: () => [...chatQueryKeys.all, "removedFriendUserIds"] as const,
  /**
   * Client-only conversations a dialog needs before the loaded list pages contain them: one created
   * by a first-message send, or one started from a friend's profile whose 1:1 sits on a page that has
   * not loaded. useChatData merges them in until the list returns them. Unrelated to the server's
   * `user_pending_status` and `participant_pending_status`.
   */
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
  // Share the directory prefix so friendship realtime events refresh member-menu eligibility too.
  participantFriends: (userId: number, participantIdsKey: string) =>
    [
      ...chatQueryKeys.friendsDirectoryAll(),
      "participantFriends",
      userId,
      participantIdsKey,
    ] as const,
  presence: (participantIdsKey: string) =>
    [...chatQueryKeys.all, "presence", participantIdsKey] as const,
  /** Prefix key matching presence regardless of participant set — for live presence refreshes. */
  presenceAll: () => [...chatQueryKeys.all, "presence"] as const,
  modalSequence: (conversationId: string) =>
    [...chatQueryKeys.all, "modalSequence", conversationId] as const,
  /** Raw per-conversation member metadata shared by details and the group-OSA consent modal. */
  participantsMetadata: (conversationId: string) =>
    [...chatQueryKeys.all, "participantsMetadata", conversationId] as const,
  /** Prefix key matching every conversation's member metadata — for membership refreshes without an id. */
  participantsMetadataAll: () => [...chatQueryKeys.all, "participantsMetadata"] as const,
  /** Trusted-connection status for a set of users (group-OSA consent modal Trusted badge). */
  trustedConnections: (userIdsKey: string) =>
    [...chatQueryKeys.all, "trustedConnections", userIdsKey] as const,
  profileInsights: (userId: number) => [...chatQueryKeys.all, "profileInsights", userId] as const,
  countryRegions: () => [...chatQueryKeys.all, "countryRegions"] as const,
  gamePlaceDetails: (placeId: string) =>
    [...chatQueryKeys.all, "gamePlaceDetails", placeId] as const,
  gameShareLink: (version: number, linkId: string, linkType?: string) =>
    [...chatQueryKeys.all, "gameShareLink", version, linkId, linkType] as const,
  gameStats: (universeId: number | undefined) =>
    [...chatQueryKeys.all, "gameStats", universeId] as const,
  /** IXP parameters of the two-pane chat window layer. */
  unifiedChatWindowLayer: () => [...chatQueryKeys.all, "unifiedChatWindowLayer"] as const,
};

/** Profile fields for friend rows: combinedName for display, username for search. */
export const FRIEND_PROFILE_FIELDS = ["names.combinedName", "names.username"] as const;
