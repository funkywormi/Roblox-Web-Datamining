import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "@rbx/core-scripts/react";
import { chatQueryKeys } from "../constants/queryKeys";
import { markConversationsAsRead, sendMessage } from "../services/chatService";
import type { TGetConversationMessagesResponse } from "../types/api";
import type { TChatMessage } from "../types/chat";
import { patchConversationInListCache } from "../utils/chatQueryCache";
import { buildModeratedMessage, isModeratedSendResponse } from "../utils/chatModeration";
import { buildFailedMessage, classifySendFailure } from "../utils/chatSendFailure";
import { sendConversationMessageSent } from "../utils/chatAnalytics";
import { getCurrentUserId } from "../utils/currentUser";

type TSendMessageVariables = {
  conversationId: string;
  content: string;
  /** Recipient (other-participant) user ids, for the conversationMessageSent `recipientIds` prop. */
  recipientIds?: number[];
  /** True when this send is a user-initiated retry of a previously failed message. */
  isRetry?: boolean;
};

const HTTP_STATUS_CONFLICT = 409;

/**
 * True when a send failure is an HTTP 409 conflict. The chat API surfaces this as a Roblox error
 * envelope `{ errors: [{ code: 409 }] }` (the code the AngularJS chat matched on), but depending on
 * how the http client wraps the rejection the same 409 can also land on `response.data.errors[0].code`,
 * `response.status`, or a top-level `status` — so every known shape is checked.
 */
const isSendConflictError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  const e = error as {
    status?: unknown;
    errors?: readonly { code?: unknown }[];
    response?: { status?: unknown; data?: { errors?: readonly { code?: unknown }[] } };
  };
  const candidateCodes: unknown[] = [
    e.status,
    e.errors?.[0]?.code,
    e.response?.status,
    e.response?.data?.errors?.[0]?.code,
  ];
  return candidateCodes.some(code => code === HTTP_STATUS_CONFLICT);
};

export const useSendMessage = () => {
  const { translate } = useTranslation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ conversationId, content }: TSendMessageVariables) =>
      sendMessage(conversationId, content),
    onMutate: async ({ conversationId, content }) => {
      const queryKey = chatQueryKeys.conversationMessages(conversationId);
      await queryClient.cancelQueries({ queryKey });

      const currentUserId = getCurrentUserId();
      // Use the real send time so the optimistic message lands in the same chronological spot the
      // server will place it — BELOW an already-shown standing notice (e.g. the party-chat banner),
      // not above it. This matches the legacy chat: the notice keeps its position for the whole
      // session and only returns to the bottom on a fresh page load (server order). Forcing the
      // message above the notice optimistically made it visibly jump when the refetch moved it down.
      const sentAt = new Date().toISOString();
      const optimisticId = `optimistic-${conversationId}-${crypto.randomUUID()}`;
      const optimisticContent = content;
      const optimisticSenderUserId = currentUserId ?? undefined;
      const optimisticMessage: TChatMessage = {
        id: optimisticId,
        conversationId,
        senderUserId: currentUserId ?? undefined,
        createdAt: sentAt,
        pieces: [{ id: `${optimisticId}-piece`, content }],
        isSending: true,
      };

      patchConversationInListCache(queryClient, conversationId, {
        unread_message_count: 0,
        preview_message: {
          content,
          created_at: sentAt,
          sender_user_id: currentUserId ?? undefined,
          is_previewable: true,
        },
      });

      queryClient.setQueryData<TGetConversationMessagesResponse>(queryKey, current => ({
        messages: [
          ...(current?.messages ?? []),
          {
            id: optimisticMessage.id,
            content,
            sender_user_id: optimisticMessage.senderUserId,
            created_at: optimisticMessage.createdAt,
            type: "user",
          },
        ],
        next_cursor: current?.next_cursor,
      }));

      return {
        queryKey,
        optimisticId,
        optimisticContent,
        optimisticSenderUserId,
        sentAt,
      };
    },
    onError: (error, variables, context) => {
      // The send-message error path emits conversationMessageSent ONLY for an HTTP 409 conflict (as
      // "Conflict"); every other failure (network, 429, 5xx, validation) is silent.
      if (isSendConflictError(error)) {
        sendConversationMessageSent({
          conversationId: variables.conversationId,
          messageId: undefined,
          messageSentResult: "Conflict",
          recipientIds: JSON.stringify(variables.recipientIds ?? []),
          isRetry: variables.isRetry ?? false,
        });
      }
      // Retain the message so the user sees the failure and can retry (parity with the legacy chat).
      // Like moderated placeholders, it is moved into a dedicated cache key so the onSettled refetch
      // — which would not return this never-persisted message — can't drop it.
      if (context) {
        queryClient.setQueryData<TGetConversationMessagesResponse>(context.queryKey, current =>
          current
            ? {
                ...current,
                messages: current.messages.filter(message => message.id !== context.optimisticId),
              }
            : current,
        );
        const { messageKey, canResend } = classifySendFailure(error);
        const failedMessage = buildFailedMessage({
          id: context.optimisticId,
          conversationId: variables.conversationId,
          senderUserId: context.optimisticSenderUserId,
          createdAt: context.sentAt,
          content: context.optimisticContent,
          error: messageKey ? translate(messageKey) : undefined,
          canResend,
        });
        queryClient.setQueryData<TChatMessage[]>(
          chatQueryKeys.failedMessages(variables.conversationId),
          current => [...(current ?? []), failedMessage],
        );
      }
      queryClient
        .invalidateQueries({ queryKey: chatQueryKeys.conversations() })
        .catch(() => undefined);
    },
    onSuccess: (data, { conversationId, recipientIds, isRetry }, context) => {
      // conversationMessageSent — derive the result from the returned message's status, falling back
      // to "moderated" for a filtered send, else the "NoMessageStatus"/"NoResponseBody" sentinels.
      // recipientIds are the conversation's other participants; there is no client-side retry here.
      const sentMessage = data.messages[0];
      const messageSentResult = !sentMessage
        ? "NoResponseBody"
        : (sentMessage.status ?? (isModeratedSendResponse(data) ? "moderated" : "NoMessageStatus"));
      sendConversationMessageSent({
        conversationId,
        messageId: sentMessage?.id != null ? String(sentMessage.id) : undefined,
        messageSentResult,
        recipientIds: JSON.stringify(recipientIds ?? []),
        isRetry: isRetry ?? false,
      });

      markConversationsAsRead([conversationId]).catch(() => undefined);
      patchConversationInListCache(queryClient, conversationId, {
        unread_message_count: 0,
      });

      // A fully moderated message is not persisted server-side, so the onSettled refetch
      // would drop the optimistic entry and it would vanish. Instead, remove the optimistic
      // message and keep a client-side "###" placeholder (with a moderated caption) in a
      // dedicated cache key that useConversationMessages merges in and refetches never touch.
      if (!context || !isModeratedSendResponse(data)) {
        return;
      }

      queryClient.setQueryData<TGetConversationMessagesResponse>(context.queryKey, current =>
        current
          ? {
              ...current,
              messages: current.messages.filter(message => message.id !== context.optimisticId),
            }
          : current,
      );

      const moderatedMessage = buildModeratedMessage({
        id: context.optimisticId,
        conversationId,
        senderUserId: context.optimisticSenderUserId,
        createdAt: context.sentAt,
        content: context.optimisticContent,
        error: translate("Message.MessageContentModerated"),
      });
      queryClient.setQueryData<TChatMessage[]>(
        chatQueryKeys.moderatedMessages(conversationId),
        current => [...(current ?? []), moderatedMessage],
      );
    },
    onSettled: (_data, _error, variables) => {
      queryClient
        .invalidateQueries({
          queryKey: chatQueryKeys.conversationMessages(variables.conversationId),
        })
        .catch(() => undefined);
      queryClient
        .invalidateQueries({
          queryKey: chatQueryKeys.conversations(),
        })
        .catch(() => undefined);
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.metadata() }).catch(() => undefined);
    },
  });
};
