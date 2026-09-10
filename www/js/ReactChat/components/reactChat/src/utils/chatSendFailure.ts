import type { TChatMessage } from "../types/chat";

const HTTP_STATUS_CONFLICT = 409;
const HTTP_STATUS_TOO_MANY_REQUESTS = 429;
/** Server error code (in the Roblox error envelope `message`) for an over-length message. */
const TEXT_TOO_LONG_CODE = "TextTooLong";

export type TSendFailure = {
  /** Feature.Chat translation key for the inline caption, or undefined for a generic failure. */
  messageKey?: string;
  /** Whether the user may retry the send. False only for a conflict, matching the legacy chat. */
  canResend: boolean;
};

type TErrorEnvelope = { code?: number; message?: string };

/**
 * Pull the first Roblox error `{ code, message }` out of whatever shape the http client rejected
 * with — the raw envelope `{ errors: [...] }`, an axios-style `response.data.errors[0]`, or a bare
 * `response.status` / `status`.
 */
const readErrorEnvelope = (error: unknown): TErrorEnvelope => {
  if (typeof error !== "object" || error === null) {
    return {};
  }
  const e = error as {
    status?: unknown;
    errors?: readonly { code?: unknown; message?: unknown }[];
    response?: {
      status?: unknown;
      data?: { errors?: readonly { code?: unknown; message?: unknown }[] };
    };
  };
  const firstError = e.errors?.[0] ?? e.response?.data?.errors?.[0];
  const code = [firstError?.code, e.response?.status, e.status].find(
    (value): value is number => typeof value === "number",
  );
  const message = typeof firstError?.message === "string" ? firstError.message : undefined;
  return { code, message };
};

/**
 * Map a send failure to its inline caption + retry eligibility, mirroring the legacy chat's
 * dialogController error branches (conflict / too-many-attempts / text-too-long / generic).
 */
export const classifySendFailure = (error: unknown): TSendFailure => {
  const { code, message } = readErrorEnvelope(error);
  if (code === HTTP_STATUS_CONFLICT) {
    return { messageKey: "Message.RefreshChat", canResend: false };
  }
  if (code === HTTP_STATUS_TOO_MANY_REQUESTS) {
    return { messageKey: "Message.SendingMessagesTooQuickly", canResend: true };
  }
  if (message === TEXT_TOO_LONG_CODE) {
    return { messageKey: "Message.TextTooLong", canResend: true };
  }
  return { canResend: true };
};

/**
 * Client-side representation of a message that failed to send: the original text, flagged so the UI
 * shows the failure caption and (when allowed) a resend control. The server never persisted it, so —
 * like moderated placeholders — it lives in its own cache key that message refetches never touch.
 */
export const buildFailedMessage = (params: {
  id: string;
  conversationId: string;
  senderUserId?: number;
  createdAt?: string;
  content: string;
  error?: string;
  canResend: boolean;
}): TChatMessage => ({
  id: params.id,
  conversationId: params.conversationId,
  senderUserId: params.senderUserId,
  createdAt: params.createdAt,
  pieces: [{ id: `${params.id}-piece`, content: params.content }],
  isSending: false,
  canResend: params.canResend,
  error: params.error,
});
