import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useConversationMessages } from "./useConversationMessages";
import { useCreateOneToOneConversation } from "./useCreateOneToOneConversation";
import { useSendMessage } from "./useSendMessage";
import { chatQueryKeys } from "../constants/queryKeys";
import { updateTypingStatus } from "../services/chatService";
import { useChatMetadataConfig } from "./useChatMetadataConfig";
import type { TChatConversation, TChatMessage } from "../types/chat";
import { seedPendingConversation } from "../utils/chatQueryCache";
import { isFriendPlaceholderConversation } from "../utils/chatTransforms";

export type TUseDialogOptions = {
  onPromoteFriendPlaceholder?: (newConversationId: string) => void;
};

export type TUseDialogResult = {
  messages: TChatMessage[];
  draftMessage: string;
  setDraftMessage: (draftMessage: string) => void;
  sendMessage: () => void;
  /** Re-send a previously failed message (clears its failed placeholder, then sends as a retry). */
  resendMessage: (message: TChatMessage) => void;
  isSendable: boolean;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  /** True while the messages query is still loading (undefined until the first fetch resolves). */
  isMessagesLoading: boolean;
};

export const useDialog = (
  conversation: TChatConversation,
  options?: TUseDialogOptions,
): TUseDialogResult => {
  const queryClient = useQueryClient();
  const { typingInChatFromSenderThrottleMs } = useChatMetadataConfig();
  const isFriendPlaceholder = isFriendPlaceholderConversation(conversation);
  // A friend placeholder's id is synthetic (`friends-<ids>`), so skip the messages fetch — hitting
  // the server with it errors and floods the console until the real conversation is created.
  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isLoading: isMessagesLoading,
  } = useConversationMessages(conversation.id, conversation.messages, !isFriendPlaceholder);
  const sendMessageMutation = useSendMessage();
  const createConversationMutation = useCreateOneToOneConversation();
  const [draftMessage, setDraftMessage] = useState("");
  const lastTypingSentRef = useRef(0);

  const isSendable = Boolean(conversation.id);

  const handleSetDraftMessage = useCallback(
    (value: string) => {
      setDraftMessage(value);

      if (!isSendable || isFriendPlaceholder || value.trim().length === 0) {
        return;
      }

      const now = Date.now();
      if (now - lastTypingSentRef.current >= typingInChatFromSenderThrottleMs) {
        lastTypingSentRef.current = now;
        updateTypingStatus(conversation.id).catch((): undefined => undefined);
      }
    },
    [conversation.id, isFriendPlaceholder, isSendable, typingInChatFromSenderThrottleMs],
  );

  const sendMessage = useCallback(() => {
    const trimmedDraft = draftMessage.trim();
    if (!trimmedDraft || !isSendable) {
      return;
    }

    setDraftMessage("");
    lastTypingSentRef.current = 0;

    // Recipients for the conversationMessageSent analytics. The transformed participants already
    // exclude the current user, so these are exactly the other members.
    const recipientIds = conversation.participants.map(participant => participant.id);

    if (isFriendPlaceholder) {
      const participantUserId = conversation.participants[0]?.id;
      if (!participantUserId) {
        return;
      }

      createConversationMutation.mutate(participantUserId, {
        onSuccess: result => {
          const newConversationId = result.id;
          if (!newConversationId) {
            return;
          }
          // Seed the created conversation so its dialog renders immediately — the server list is
          // eventually consistent, so opening off it alone left the dialog with no backing
          // conversation and it closed on the first send.
          seedPendingConversation(queryClient, result);
          sendMessageMutation.mutate({
            conversationId: newConversationId,
            content: trimmedDraft,
            recipientIds,
          });
          options?.onPromoteFriendPlaceholder?.(newConversationId);
          queryClient
            .invalidateQueries({ queryKey: chatQueryKeys.conversations() })
            .catch((): undefined => undefined);
        },
      });
      return;
    }

    sendMessageMutation.mutate({
      conversationId: conversation.id,
      content: trimmedDraft,
      recipientIds,
    });
  }, [
    conversation.id,
    conversation.participants,
    createConversationMutation,
    draftMessage,
    isFriendPlaceholder,
    isSendable,
    options,
    queryClient,
    sendMessageMutation,
  ]);

  const resendMessage = useCallback(
    (message: TChatMessage) => {
      const content = message.pieces.map(piece => piece.content).join("");
      if (!content || !isSendable) {
        return;
      }
      // Drop the failed placeholder; the mutation adds a fresh optimistic entry in its place.
      queryClient.setQueryData<TChatMessage[]>(
        chatQueryKeys.failedMessages(conversation.id),
        current => (current ?? []).filter(entry => entry.id !== message.id),
      );
      const recipientIds = conversation.participants.map(participant => participant.id);
      sendMessageMutation.mutate({
        conversationId: conversation.id,
        content,
        recipientIds,
        isRetry: true,
      });
    },
    [conversation.id, conversation.participants, isSendable, queryClient, sendMessageMutation],
  );

  return {
    messages,
    draftMessage,
    setDraftMessage: handleSetDraftMessage,
    sendMessage,
    resendMessage,
    isSendable,
    fetchNextPage,
    hasNextPage,
    isMessagesLoading,
  };
};
