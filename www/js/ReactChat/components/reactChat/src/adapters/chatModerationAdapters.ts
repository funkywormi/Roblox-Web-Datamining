import { CHAT_MODERATION_TYPE } from "../constants/chatPolicyConstants";

export type TModerationTimeoutRange = {
  start_time?: string;
  end_time?: string;
  requires_acknowledgement?: boolean;
};

export type TConversationTimeoutRangeRow = {
  id?: string | number;
  timeout_range?: TModerationTimeoutRange;
};

export type TChatModerationStatusesResponse = {
  user_timeout_range?: TModerationTimeoutRange;
  conversation_timeout_ranges?: TConversationTimeoutRangeRow[];
};

export type TModerationTimeoutMap = {
  /** User-level timeout end (applies to every *moderated* conversation), or null. */
  userTimedOutUntil: TModerationTimeoutActive | null;
  /** Per-conversation timeout ends, keyed by conversation id. */
  conversationTimedOutUntilById: Map<string, Date>;
};

export type TModerationTimeoutActive = {
  requiresAcknowledgment: boolean;
  endDate: Date;
};

export type TResolvedTimeout = {
  isTimedOut: boolean;
  /** Epoch ms the timeout ends (the later of user/conversation), or null when not timed out. */
  expiresAtMs: number | null;
};

function parseTimeoutEnd(
  range: TModerationTimeoutRange | undefined,
  now: Date,
): TModerationTimeoutActive | null {
  if (range?.end_time == null) {
    return null;
  }
  const end = new Date(range.end_time);
  if (Number.isNaN(end.getTime())) {
    return null;
  }
  const start = range.start_time != null ? new Date(range.start_time) : null;
  if (start !== null && !Number.isNaN(start.getTime()) && end.getTime() < start.getTime()) {
    return null;
  }

  const requiresAcknowledgment = Boolean(range.requires_acknowledgement);
  // A restriction is active while it still requires acknowledgment OR its window hasn't expired.
  if (requiresAcknowledgment || end.getTime() > now.getTime()) {
    return { requiresAcknowledgment, endDate: end };
  }
  return null;
}

export function buildModerationTimeoutMap(
  raw: TChatModerationStatusesResponse | undefined,
  now: Date,
): TModerationTimeoutMap {
  const conversationTimedOutUntilById = new Map<string, Date>();
  const userTimedOutUntil = parseTimeoutEnd(raw?.user_timeout_range, now);

  for (const row of raw?.conversation_timeout_ranges ?? []) {
    const id = row.id != null ? String(row.id) : "";
    if (id.length === 0) {
      continue;
    }
    const until = parseTimeoutEnd(row.timeout_range, now);
    if (until !== null) {
      // Convo-level timeouts are never acknowledgeable, so we only store the endDate and
      // omit the requiresAcknowledgment.
      conversationTimedOutUntilById.set(id, until.endDate);
    }
  }

  return { userTimedOutUntil, conversationTimedOutUntilById };
}

/**
 * Resolves the effective timeout for one conversation, honoring the scoping rules:
 * - trusted_comms conversations are exempt (never timed out);
 * - the user-level timeout applies to every moderated conversation;
 * - a per-conversation timeout applies to its own id;
 * - when both are active, the one expiring later wins.
 */
export function resolveConversationTimeout(
  conversationId: string,
  moderationType: string | undefined,
  map: TModerationTimeoutMap,
  now: Date,
): TResolvedTimeout {
  if (moderationType === CHAT_MODERATION_TYPE.trusted_comms) {
    return { isTimedOut: false, expiresAtMs: null };
  }

  const nowMs = now.getTime();
  const userUntil = map.userTimedOutUntil;
  const userMs =
    userUntil?.endDate && userUntil.endDate.getTime() > nowMs ? userUntil.endDate.getTime() : null;

  const convUntil = map.conversationTimedOutUntilById.get(conversationId);
  const convMs = convUntil != null && convUntil.getTime() > nowMs ? convUntil.getTime() : null;

  const requiresAcknowledgment = userUntil?.requiresAcknowledgment ?? false;
  const expiresAtMs = Math.max(userMs ?? 0, convMs ?? 0) || null;

  return {
    isTimedOut: expiresAtMs !== null || requiresAcknowledgment,
    expiresAtMs,
  };
}
