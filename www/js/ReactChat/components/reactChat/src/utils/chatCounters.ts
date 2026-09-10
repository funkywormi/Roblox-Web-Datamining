// Influx counter telemetry, fired through the wwwroot EventTracker alongside — never instead of —
// the eventstream events in chatAnalytics.ts. Do NOT rename these strings: they are the dashboard
// and alert contract already indexed by Influx. Legacy source of truth:
// WebApps/Roblox.Chat.WebApp/.../chat/constants/diagActionList.js and analyticsService.js.

export const CHAT_COUNTER = {
  chatLandingConversationClicked: "ChatLandingConversationClickedWeb",
  conversationMessageSent: "ConversationMessageSentWeb",
  webChatConversationsLoaded: "WebChatConversationsLoadedWeb",
  webChatConversationRendered: "WebChatConversationRenderedWeb",
  webChatRendered: "WebChatRenderedWeb",
  modalPrefix: "WebChatModal",
} as const;

/** Emitted for a modal counter part that the caller could not supply, matching the eventstream default. */
const UNKNOWN_MODAL_PART = "Unknown";

/**
 * EventTracker is a wwwroot global injected by the .NET page, so it is absent in tests and on any
 * host that has not loaded it. A missing tracker is not an error — telemetry never blocks chat.
 */
export const incrementChatCounter = (counterName: string): void => {
  window.EventTracker?.fireEvent(counterName);
};

/**
 * Each part of a counter name is joined by an underscore, so snake_case parts are camelized first to
 * keep the resulting name splittable: `conversation_list_overlay` → `conversationListOverlay`.
 */
const toCamelCase = (value: string): string =>
  value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());

/**
 * Modal counter names are ordered general → specific so they sort and regex-match cleanly:
 * prefix, sequence, variant, action taken, then any action details.
 * Example: `WebChatModal_conversationListOverlay_osaContextCard_action_primaryCta`.
 *
 * Note this uses the raw (camelized) sequence, not the eventstream-facing sequence map — the two
 * naming schemes are intentionally different, and both mirror legacy.
 */
export const formatModalCounterName = (
  modalSequence: string,
  modalVariant: string | undefined,
  actionTaken: string,
  actionDetails: string[] = [],
): string =>
  [
    CHAT_COUNTER.modalPrefix,
    toCamelCase(modalSequence),
    modalVariant == null ? UNKNOWN_MODAL_PART : toCamelCase(modalVariant),
    actionTaken,
    ...actionDetails,
  ].join("_");
