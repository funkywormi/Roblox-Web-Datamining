import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { CHAT_CONVERSATION_SOURCE } from "../constants/chatPolicyConstants";
import { CHAT_MODAL_SEQUENCE } from "../constants/chatModalConstants";
import { CHAT_COUNTER, formatModalCounterName, incrementChatCounter } from "./chatCounters";
import { splitKeystrokeData } from "./chatKeystrokes";
import type { TChatKeystroke } from "./chatKeystrokes";
import type { TChatConversation } from "../types/chat";

// Web-chat eventstream telemetry. Do NOT rename these strings: they are the analytics contract the
// eventstream backend already indexes. All events use the "WebChatEventContext" context, target WWW.
const WEB_CHAT_EVENT_CONTEXT = "WebChatEventContext";

type TChatEventProperties = Record<string, string | number | boolean | undefined>;

const EVENT_NAMES = {
  chatLandingConversationClicked: "chatLandingConversationClicked",
  conversationMessageSent: "conversationMessageSent",
  webChatConversationsLoaded: "webChatConversationsLoaded",
  webChatConversationRendered: "webChatConversationRendered",
  webChatRendered: "webChatRendered",
  webChatModalRendered: "webChatModalRendered",
  webChatModalAction: "webChatModalAction",
  webChatModalActionResult: "webChatModalActionResult",
} as const;

export const MODAL_ACTION_TYPE = {
  primaryCta: "primaryCta",
  secondaryCta: "secondaryCta",
  dismiss: "dismiss",
} as const;

export const MODAL_ACTION_RESULT_TYPE = {
  success: "success",
  failure: "failure",
} as const;

// The modalSequence value emitted on the wire is kept in sync with what the Lua client emits.
const MODAL_SEQUENCE_EVENTSTREAM_MAP: Record<string, string> = {
  [CHAT_MODAL_SEQUENCE.conversation_list_overlay]: "ConversationListOverlay",
};

/**
 * Whether this session should emit sampled web-chat events. The decision is computed once at init
 * as `Math.random() * 100 <= webChatEventSampleRate` and fixed for the session. `null` until the
 * chat settings metadata has been read.
 */
let shouldSendEvents: boolean | null = null;

/**
 * Called once when conversation metadata is available (webChatEventSampleRate). Idempotent — the
 * first call fixes the sampling decision for the session, matching the legacy single init.
 */
export const configureChatEventSampling = (webChatEventSampleRate: number | undefined): void => {
  shouldSendEvents ??= Math.random() * 100 <= (webChatEventSampleRate ?? 0);
};

/** Test-only: clears the one-shot sampling decision so each test controls it. */
export const resetChatEventSamplingForTest = (): void => {
  shouldSendEvents = null;
};

const emit = (eventName: string, eventProperties: TChatEventProperties): void => {
  sendEventWithTarget(eventName, WEB_CHAT_EVENT_CONTEXT, eventProperties);
};

/**
 * `friends:<friendUserId>` for a friends-source (friend-list) conversation, otherwise the
 * conversation id (kept in sync with the lua-apps `getFriendId` id format). A friends-source
 * placeholder has no server id — its `conversation.id` is a synthetic `friends-<a>-<b>` value — so
 * the friend's user id is read from the (self-excluded) participants, matching `getModalConversationKey`.
 */
export const getConversationIdForAnalytics = (
  conversation: Pick<TChatConversation, "source" | "id" | "participants"> | undefined,
): string | undefined => {
  if (conversation?.source === CHAT_CONVERSATION_SOURCE.friends) {
    const friendUserId = conversation.participants[0]?.id;
    return `friends:${friendUserId ?? "unknown-id"}`;
  }
  return conversation?.id;
};

// --- Sampled core events (mirror the shouldSendEvents-gated controller wrappers) ---
// Each one also increments its Influx counter, inside the same sampling gate as legacy so the
// counter and the event always agree on how much traffic they represent.

export const sendWebChatRendered = (params: {
  isChatEnabled: boolean;
  isChatOpen: boolean;
}): void => {
  if (shouldSendEvents !== true) {
    return;
  }
  incrementChatCounter(CHAT_COUNTER.webChatRendered);
  emit(EVENT_NAMES.webChatRendered, { localTimestamp: Date.now(), ...params });
};

export const sendWebChatConversationsLoaded = (params: {
  isChatOpen: boolean;
  conversationIds: string;
  friendsConversationIds: string;
}): void => {
  if (shouldSendEvents !== true) {
    return;
  }
  incrementChatCounter(CHAT_COUNTER.webChatConversationsLoaded);
  emit(EVENT_NAMES.webChatConversationsLoaded, { localTimestamp: Date.now(), ...params });
};

export const sendWebChatConversationRendered = (params: {
  conversationId: string | undefined;
  isDialogOpen: boolean;
  conversationSource: string | undefined;
  moderationType: string | undefined;
  userPendingStatus?: string;
}): void => {
  if (shouldSendEvents !== true) {
    return;
  }
  incrementChatCounter(CHAT_COUNTER.webChatConversationRendered);
  emit(EVENT_NAMES.webChatConversationRendered, { localTimestamp: Date.now(), ...params });
};

export const sendChatLandingConversationClicked = (params: {
  isChatEnabled: boolean;
  isFiltered: boolean;
  selectedConversationId: string | undefined;
  hasUnreadMessages: boolean;
}): void => {
  if (shouldSendEvents !== true) {
    return;
  }
  incrementChatCounter(CHAT_COUNTER.chatLandingConversationClicked);
  emit(EVENT_NAMES.chatLandingConversationClicked, { localTimestamp: Date.now(), ...params });
};

export const sendConversationMessageSent = (params: {
  conversationId: string | undefined;
  messageId: string | undefined;
  messageSentResult: string;
  recipientIds: string;
  isRetry: boolean;
}): void => {
  if (shouldSendEvents !== true) {
    return;
  }
  incrementChatCounter(CHAT_COUNTER.conversationMessageSent);
  emit(EVENT_NAMES.conversationMessageSent, { localTimestamp: Date.now(), ...params });
};

// --- Modal events (not sample-gated, unlike the core events above) ---

const withModalSequence = (properties: {
  modalSequence: string;
  modalVariant: string | undefined;
  [key: string]: string | number | boolean | undefined;
}): TChatEventProperties => ({
  ...properties,
  modalSequence: MODAL_SEQUENCE_EVENTSTREAM_MAP[properties.modalSequence] ?? "Unknown",
  modalVariant: properties.modalVariant ?? "Unknown",
});

export const sendWebChatModalRendered = (params: {
  modalSequence: string;
  modalVariant: string | undefined;
}): void => {
  emit(EVENT_NAMES.webChatModalRendered, withModalSequence(params));
  incrementChatCounter(
    formatModalCounterName(params.modalSequence, params.modalVariant, "rendered"),
  );
};

export const sendWebChatModalAction = (params: {
  modalSequence: string;
  modalVariant: string | undefined;
  action: (typeof MODAL_ACTION_TYPE)[keyof typeof MODAL_ACTION_TYPE];
}): void => {
  emit(EVENT_NAMES.webChatModalAction, withModalSequence(params));
  incrementChatCounter(
    formatModalCounterName(params.modalSequence, params.modalVariant, "action", [params.action]),
  );
};

export const sendWebChatModalActionResult = (params: {
  modalSequence: string;
  modalVariant: string | undefined;
  action: (typeof MODAL_ACTION_TYPE)[keyof typeof MODAL_ACTION_TYPE];
  actionResult: (typeof MODAL_ACTION_RESULT_TYPE)[keyof typeof MODAL_ACTION_RESULT_TYPE];
}): void => {
  emit(EVENT_NAMES.webChatModalActionResult, withModalSequence(params));
  incrementChatCounter(
    formatModalCounterName(params.modalSequence, params.modalVariant, "actionResult", [
      params.action,
      params.actionResult,
    ]),
  );
};

// --- Keystroke batches (gated on the app-policy GUAC flag + per-user sampling, not shouldSendEvents) ---

const KEYSTROKES_EVENT = "appChatKeyStrokes";

/** Why the buffer was flushed. Legacy sends this as the event *context*, not as a property. */
export const KEYSTROKE_FLUSH_REASON = {
  enterPressed: "enterPressed",
  maxLengthReached: "maxLengthReached",
} as const;

export type TKeystrokeFlushReason =
  (typeof KEYSTROKE_FLUSH_REASON)[keyof typeof KEYSTROKE_FLUSH_REASON];

export const sendChatKeystrokes = (
  flushReason: TKeystrokeFlushReason,
  keystrokes: readonly TChatKeystroke[],
): void => {
  const { keyPressedData, eventTypeData, timestampData } = splitKeystrokeData(keystrokes);
  sendEventWithTarget(KEYSTROKES_EVENT, flushReason, {
    keyPressedData: JSON.stringify(keyPressedData),
    eventTypeData: JSON.stringify(eventTypeData),
    timestampData: JSON.stringify(timestampData),
  });
};
