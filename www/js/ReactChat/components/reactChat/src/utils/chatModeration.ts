import type { TSendMessageResponse } from "../types/api";
import type { TChatMessage } from "../types/chat";

/** Replace every non-whitespace character with "#", matching the legacy chat filter. */
export const hashOutContent = (content: string): string => content.replace(/\S/g, "#");

/** True when the send-message response reports the message was fully moderated (filtered). */
export const isModeratedSendResponse = (response: TSendMessageResponse | undefined): boolean =>
  Boolean(response?.messages.some(message => (message.status ?? "").toLowerCase() === "moderated"));

/**
 * Build the client-side representation of a moderated outgoing message: the sender's text
 * hashed to "###", flagged so the UI shows a "content moderated" caption and no resend. The
 * server does not persist fully-moderated messages, so this is kept client-side.
 */
export const buildModeratedMessage = (params: {
  id: string;
  conversationId: string;
  senderUserId?: number;
  createdAt?: string;
  content: string;
  error: string;
}): TChatMessage => ({
  id: params.id,
  conversationId: params.conversationId,
  senderUserId: params.senderUserId,
  createdAt: params.createdAt,
  pieces: [{ id: `${params.id}-piece`, content: hashOutContent(params.content) }],
  isModerated: true,
  isSending: false,
  canResend: false,
  error: params.error,
});
