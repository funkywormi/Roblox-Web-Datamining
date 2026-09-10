import { useCallback, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { CHAT_MODAL_SEQUENCE, CHAT_MODAL_VARIANT } from "../constants/chatModalConstants";
import { CHAT_MODERATION_TYPE } from "../constants/chatPolicyConstants";
import { getModalSequence, recordModalSequenceResponse } from "../services/chatService";
import { getModalConversationKey } from "../utils/chatModalKey";
import type { TChatConversation, TDialogScreen } from "../types/chat";

export type TUseConversationOverlayResult = {
  /** Records the dismissed action and returns the dialog to the default screen. */
  dismiss: () => void;
  /** Records the "seen" action once. Called by the overlay screen after it has been visible. */
  recordSeen: () => void;
};

/**
 * Conversation-overlay FTUX trigger; currently drives the Trusted Connections contact card. For a
 * 1:1 trusted_comms conversation (TC
 * enabled) it fetches the modal sequence and, when the variant is
 * `conversation_trusted_connection_created`, switches the dialog to the ContactCard screen. Exposes
 * `recordSeen` (the overlay screen owns the "visible for N seconds" timing) and `dismiss`, both of
 * which post to record-modal-sequence-response. Named generically so future overlay variants can
 * extend it.
 */
export const useConversationOverlay = (
  conversation: TChatConversation,
  tcEnabled: boolean,
  onSetScreen: (layoutId: string, screen: TDialogScreen) => void,
): TUseConversationOverlayResult => {
  const isOneToOne = conversation.dialogType === "Direct";
  const isTrustedComms = conversation.moderationType === CHAT_MODERATION_TYPE.trusted_comms;

  // Friends-source conversations key by friend id, others by conversation id (see chatModalKey).
  const { conversationId: modalConversationId, friendId: modalFriendId } =
    getModalConversationKey(conversation);
  const hasModalTarget = modalFriendId != null || (modalConversationId?.length ?? 0) > 0;
  const enabled = tcEnabled && isOneToOne && isTrustedComms && hasModalTarget;

  const modalSequenceQuery = useQuery({
    queryKey: chatQueryKeys.modalSequence(conversation.id),
    queryFn: () =>
      getModalSequence({
        conversationId: modalConversationId,
        friendId: modalFriendId,
        modalSequence: CHAT_MODAL_SEQUENCE.conversation_overlay,
      }),
    enabled,
    staleTime: Infinity,
  });

  const modalData = modalSequenceQuery.data;
  const isTcCreated = modalData?.modal_variant === CHAT_MODAL_VARIANT.trusted_connection_created;

  const hasShownRef = useRef(false);
  const hasRecordedSeenRef = useRef(false);

  const record = useCallback(
    (actionType: string | undefined) => {
      if (!actionType) {
        return;
      }
      recordModalSequenceResponse({
        conversationId: modalConversationId,
        friendId: modalFriendId,
        modalSequence: CHAT_MODAL_SEQUENCE.conversation_overlay,
        modalVariant: modalData?.modal_variant,
        modalId: modalData?.modal_layout?.id,
        actionType,
      }).catch((): undefined => undefined);
    },
    [modalConversationId, modalFriendId, modalData],
  );

  // Show the contact card once, when the backend says this conversation just became a TC.
  useEffect(() => {
    if (isTcCreated && !hasShownRef.current) {
      hasShownRef.current = true;
      onSetScreen(conversation.layoutId, "ContactCard");
    }
  }, [isTcCreated, conversation.layoutId, onSetScreen]);

  // Records "seen" at most once. The overlay screen (ContactCard) owns the "visible for N seconds"
  // timing and calls this; the ref keeps it idempotent across the card unmounting/remounting (e.g.
  // when the dialog is minimized and restored).
  const recordSeen = useCallback(() => {
    if (!isTcCreated || hasRecordedSeenRef.current) {
      return;
    }
    hasRecordedSeenRef.current = true;
    // modalData is narrowed non-null here by the isTcCreated guard above.
    record(modalData.modal_layout?.seen_record_action);
  }, [isTcCreated, record, modalData]);

  const dismiss = useCallback(() => {
    record(modalData?.modal_layout?.dismissed_record_action);
    onSetScreen(conversation.layoutId, "Default");
  }, [record, modalData, conversation.layoutId, onSetScreen]);

  return { dismiss, recordSeen };
};

export default useConversationOverlay;
