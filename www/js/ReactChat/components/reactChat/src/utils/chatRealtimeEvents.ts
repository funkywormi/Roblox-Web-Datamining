export type TTypingEventDetail = {
  conversationId?: string;
  userId?: number;
  isTyping?: boolean;
};

export type TIncomingMessageEventDetail = {
  conversationId: string;
};

/** The current user was removed from a conversation/channel, or it was archived/deleted. */
export type TConversationRemovedEventDetail = {
  conversationId: string;
};

type TFeatureInterventionDetail = {
  decisionEventId?: string;
  acknowledgeable?: boolean;
  title?: string;
  body?: string;
};

/** Real-time moderation timeout (FeatureIntervention, type "timeout"). */
export type TFeatureInterventionTimeoutDetail = TFeatureInterventionDetail & {
  type: "timeout";
  /** Conversation to time out; absent ⇒ user-level (all moderated conversations). */
  conversationId?: string;
  /** Epoch ms the timeout ends. */
  endTimeMs: number;
  /** Configured total timeout length in seconds; for the intervention analytics duration. */
  timeoutDurationSeconds?: number;
  timeoutStartTime?: string;
};

/** Real-time moderation nudge (FeatureIntervention, type "nudge") — a warning, no disable. */
export type TNudgeEventDetail = TFeatureInterventionDetail & { type: "nudge" };

declare global {
  interface WindowEventMap {
    reactChatTyping: CustomEvent<TTypingEventDetail>;
    reactChatIncomingMessage: CustomEvent<TIncomingMessageEventDetail>;
    reactChatFeatureIntervention: CustomEvent<TFeatureInterventionTimeoutDetail>;
    reactChatNudge: CustomEvent<TNudgeEventDetail>;
    reactChatConversationRemoved: CustomEvent<TConversationRemovedEventDetail>;
  }
}

export function dispatchTypingUpdate(detail: TTypingEventDetail): void {
  window.dispatchEvent(new CustomEvent("reactChatTyping", { detail }));
}

/** Clears all typing indicators for a conversation (e.g. after a message is received). */
export function clearConversationTyping(conversationId: string, userId?: number): void {
  dispatchTypingUpdate({ conversationId, userId, isTyping: false });
}

export function dispatchIncomingMessage(conversationId: string): void {
  window.dispatchEvent(
    new CustomEvent("reactChatIncomingMessage", {
      detail: { conversationId },
    }),
  );
}

/** Force-close the open dialog for a conversation the user can no longer access. */
export function dispatchConversationRemoved(conversationId: string): void {
  window.dispatchEvent(
    new CustomEvent("reactChatConversationRemoved", {
      detail: { conversationId },
    }),
  );
}

export function dispatchFeatureInterventionTimeout(
  detail: TFeatureInterventionTimeoutDetail,
): void {
  window.dispatchEvent(new CustomEvent("reactChatFeatureIntervention", { detail }));
}

export function dispatchNudge(detail: TNudgeEventDetail): void {
  window.dispatchEvent(new CustomEvent("reactChatNudge", { detail }));
}
