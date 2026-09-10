import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { CHAT_MODAL_ACTION_TYPE, CHAT_MODAL_SEQUENCE } from "../constants/chatModalConstants";
import { recordModalSequenceResponse, removeUsersFromConversation } from "../services/chatService";
import { getModalConversationKey } from "../utils/chatModalKey";
import { getCurrentUserId } from "../utils/currentUser";
import {
  MODAL_ACTION_RESULT_TYPE,
  MODAL_ACTION_TYPE,
  sendWebChatModalAction,
  sendWebChatModalActionResult,
  sendWebChatModalRendered,
} from "../utils/chatAnalytics";
import type { TConsentVariant } from "../utils/consent";
import type { TChatConversation } from "../types/chat";

type TUseConsentModalOptions = {
  /** The consent variant to record; null when the conversation is not consent-blocked. */
  variant: TConsentVariant | null;
  expandedChatEnabled: boolean;
  /**
   * Whether the dialog panel is actually on screen (open + not minimized). The modal only renders in
   * the visible branch of ChatDialog, so webChatModalRendered is gated on this — a consent-blocked
   * but minimized dialog stays mounted (draft preservation) yet shows no modal.
   */
  isVisible: boolean;
  /** Called after accept succeeds — clears the blocking flags so the dialog opens. */
  onResolved: (layoutId: string) => void;
  /** Called after decline succeeds — removes the conversation from the UI. */
  onClose: (layoutId: string) => void;
};

export type TUseConsentModalResult = {
  accept: () => void;
  decline: () => void;
  /** Backdrop / X close — records a `dismiss` modal action, then closes the dialog. */
  dismiss: () => void;
};

/**
 * Accept / decline handlers for the blocking group-OSA / U13 opt-in consent modal:
 * - accept → record `record_has_accepted` (`conversation_list_overlay` + variant), then unblock the
 *   dialog and refetch the conversation list for channels-source conversations.
 * - decline → when expanded chat is on, leave the conversation (`remove-users`); otherwise record
 *   `record_dont_show_again`. Either way, remove the conversation from the UI afterwards.
 */
export const useConsentModal = (
  conversation: TChatConversation,
  { variant, expandedChatEnabled, isVisible, onResolved, onClose }: TUseConsentModalOptions,
): TUseConsentModalResult => {
  const queryClient = useQueryClient();
  const { conversationId, friendId } = getModalConversationKey(conversation);
  const { layoutId, id: rawConversationId, source } = conversation;
  const isChannels = source === "channels";

  // webChatModalRendered — emitted once when the blocking consent modal first appears (variant
  // resolves non-null). Not sample-gated, unlike the core events.
  const modalRenderedSentRef = useRef(false);
  useEffect(() => {
    if (!variant || !isVisible || modalRenderedSentRef.current) {
      return;
    }
    modalRenderedSentRef.current = true;
    sendWebChatModalRendered({
      modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
      modalVariant: variant,
    });
  }, [variant, isVisible]);

  const invalidateConversations = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: chatQueryKeys.conversations() })
      .catch((): undefined => undefined);
  }, [queryClient]);

  const accept = useCallback(() => {
    if (!variant) {
      return;
    }
    sendWebChatModalAction({
      modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
      modalVariant: variant,
      action: MODAL_ACTION_TYPE.primaryCta,
    });
    recordModalSequenceResponse({
      conversationId,
      friendId,
      modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
      modalVariant: variant,
      actionType: CHAT_MODAL_ACTION_TYPE.record_has_accepted,
    })
      .then(() => {
        sendWebChatModalActionResult({
          modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
          modalVariant: variant,
          action: MODAL_ACTION_TYPE.primaryCta,
          actionResult: MODAL_ACTION_RESULT_TYPE.success,
        });
        onResolved(layoutId);
        if (isChannels) {
          invalidateConversations();
        }
        return undefined;
      })
      .catch((): undefined => {
        sendWebChatModalActionResult({
          modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
          modalVariant: variant,
          action: MODAL_ACTION_TYPE.primaryCta,
          actionResult: MODAL_ACTION_RESULT_TYPE.failure,
        });
        return undefined;
      });
  }, [
    variant,
    conversationId,
    friendId,
    onResolved,
    layoutId,
    isChannels,
    invalidateConversations,
  ]);

  const decline = useCallback(() => {
    if (!variant) {
      return;
    }
    sendWebChatModalAction({
      modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
      modalVariant: variant,
      action: MODAL_ACTION_TYPE.secondaryCta,
    });
    // Only GROUP conversations make a network call on decline; a 1:1 decline just closes the dialog
    // with no request. Within a group, expanded chat leaves the conversation (remove-users);
    // otherwise it records "don't show again".
    if (conversation.dialogType !== "Group") {
      onClose(layoutId);
      return;
    }
    const currentUserId = getCurrentUserId();
    const request =
      expandedChatEnabled && currentUserId != null
        ? removeUsersFromConversation(rawConversationId, [currentUserId])
        : recordModalSequenceResponse({
            conversationId,
            friendId,
            modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
            modalVariant: variant,
            actionType: CHAT_MODAL_ACTION_TYPE.record_dont_show_again,
          });
    request
      .then(() => {
        sendWebChatModalActionResult({
          modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
          modalVariant: variant,
          action: MODAL_ACTION_TYPE.secondaryCta,
          actionResult: MODAL_ACTION_RESULT_TYPE.success,
        });
        onClose(layoutId);
        invalidateConversations();
        return undefined;
      })
      .catch((): undefined => {
        sendWebChatModalActionResult({
          modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
          modalVariant: variant,
          action: MODAL_ACTION_TYPE.secondaryCta,
          actionResult: MODAL_ACTION_RESULT_TYPE.failure,
        });
        return undefined;
      });
  }, [
    variant,
    conversation.dialogType,
    expandedChatEnabled,
    rawConversationId,
    conversationId,
    friendId,
    onClose,
    layoutId,
    invalidateConversations,
  ]);

  const dismiss = useCallback(() => {
    if (variant) {
      sendWebChatModalAction({
        modalSequence: CHAT_MODAL_SEQUENCE.conversation_list_overlay,
        modalVariant: variant,
        action: MODAL_ACTION_TYPE.dismiss,
      });
    }
    onClose(layoutId);
  }, [variant, onClose, layoutId]);

  return { accept, decline, dismiss };
};

export default useConsentModal;
