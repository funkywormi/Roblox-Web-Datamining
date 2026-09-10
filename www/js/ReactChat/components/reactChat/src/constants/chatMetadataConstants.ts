/**
 * Client-side defaults for the chat settings served by `platform-chat-api/v1/metadata`
 * (`TGetChatMetadataResponse`). Each value matches what React chat hardcoded before these fields
 * were plumbed from the server, so behavior is unchanged when the server omits a field. The server
 * value wins whenever present (see `useChatMetadataConfig`).
 */
export const CHAT_METADATA_DEFAULTS = {
  /** Group conversation title max length (legacy 150). */
  maxConversationTitleLength: 150,
  /** Sender "typing" ping throttle in ms (legacy 3000). */
  typingInChatFromSenderThrottleMs: 3_000,
  /** Received "typing" indicator expiration in ms (legacy 5000). */
  typingInChatForReceiverExpirationMs: 5_000,
  /** Total party-chrome group members; the invite cap is this minus 1 (legacy 6 → cap 5). */
  numberOfMembersForPartyChrome: 6,
  /** Time gap in ms that triggers a timestamp separator between messages (legacy 30000). */
  partyChromeDisplayTimeStampInterval: 30_000,
  /** Whether to gate mark-as-read on the conversation actually having unread messages. */
  shouldRespectConversationHasUnreadMessageToMarkAsRead: false,
  /** Percentage [0..100] of sessions that record UI performance; 100 = always record. */
  relativeValueToRecordUiPerformance: 100,
} as const;
