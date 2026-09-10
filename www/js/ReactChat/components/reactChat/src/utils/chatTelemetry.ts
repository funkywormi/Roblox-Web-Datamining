import { sendPerformanceMeasurement } from "../services/chatService";

export const CHAT_PERFORMANCE_MEASURES = {
  userConversationsLoadMs: "ReactChat_UserConversations_LoadMs",
  conversationMetadataLoadMs: "ReactChat_ConversationMetadata_LoadMs",
  messageSendOutcome: "ReactChat_MessageSend_Outcome",
} as const;

export type TChatMessageSendOutcome = "success" | "moderated" | "failed";

const MESSAGE_SEND_OUTCOME_SCALAR: Record<TChatMessageSendOutcome, number> = {
  success: 1,
  moderated: 2,
  failed: 3,
};

export function clampChatTelemetryNumber(n: number): number {
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return Math.min(n, 86_400_000);
}

export function mapMessageSendOutcomeToScalar(outcome: TChatMessageSendOutcome): number {
  return MESSAGE_SEND_OUTCOME_SCALAR[outcome];
}

// Whether this session records UI-performance measurements. Decided once as
// `Math.random() * 100 <= relativeValueToRecordUiPerformance` (parity with legacy chat) and fixed
// for the session. `null` until configured — treated as "record" so measurements that fire before
// the settings metadata resolves are not dropped (the default config is always-record).
let shouldRecordPerformance: boolean | null = null;

/** Fixes the UI-performance recording decision once from the server-configured relative value. */
export function configureChatPerformanceSampling(relativeValueToRecordUiPerformance: number): void {
  shouldRecordPerformance ??= Math.random() * 100 <= relativeValueToRecordUiPerformance;
}

/** Test-only: clears the one-shot recording decision so each test controls it. */
export function resetChatPerformanceSamplingForTests(): void {
  shouldRecordPerformance = null;
}

export async function recordChatPerformanceMs(
  measureName: string,
  durationMs: number,
): Promise<void> {
  if (shouldRecordPerformance === false) {
    return;
  }
  try {
    await sendPerformanceMeasurement(measureName, clampChatTelemetryNumber(durationMs));
  } catch {
    /* noop — chat UX must not depend on telemetry */
  }
}

export async function recordMessageSendOutcome(outcome: TChatMessageSendOutcome): Promise<void> {
  if (shouldRecordPerformance === false) {
    return;
  }
  try {
    await sendPerformanceMeasurement(
      CHAT_PERFORMANCE_MEASURES.messageSendOutcome,
      mapMessageSendOutcomeToScalar(outcome),
    );
  } catch {
    /* noop */
  }
}
