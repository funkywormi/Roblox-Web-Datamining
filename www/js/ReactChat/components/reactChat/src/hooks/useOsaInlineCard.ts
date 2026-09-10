import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import {
  CHAT_MODAL_ACTION_TYPE,
  CHAT_MODAL_SEQUENCE,
  CHAT_MODAL_VARIANT,
} from "../constants/chatModalConstants";
import { CHAT_CONVERSATION_SOURCE } from "../constants/chatPolicyConstants";
import { recordModalSequenceResponse } from "../services/chatService";
import { getModalConversationKey } from "../utils/chatModalKey";
import type { TChatConversation } from "../types/chat";

export type TUseOsaInlineCardResult = {
  /** Whether the non-blocking 1:1 OSA inline context card should render atop the thread. */
  showOsaInlineCard: boolean;
};

/**
 * UK-OSA 1:1 inline context card: for a 1:1 conversation whose OSA status is unacknowledged — and
 * the viewer is in the `useOneToOneOsaContextCards` rollout — show an inline disclosure card atop
 * the thread and record `record_has_seen` (`conversation_inline_top_modal` / `osa_context_card`)
 * exactly once, while the card is actually visible. For channels-source conversations it then
 * refetches messages + preview.
 *
 * `osaInlineCardVisible` must already fold in the render conditions (dialog open, not minimized, and
 * not showing the blocking consent modal) so `record_has_seen` never fires for a card the user can't
 * see. The card stays visible for the rest of the session — it renders for both `unacknowledged`
 * and `acknowledged` statuses — and only disappears once the server returns an acknowledged status
 * on a later load. Non-blocking: the user can still read and send.
 */
export const useOsaInlineCard = (
  conversation: TChatConversation,
  osaInlineCardVisible: boolean,
  hasMoreMessages: boolean,
  isMessagesLoading: boolean,
): TUseOsaInlineCardResult => {
  const queryClient = useQueryClient();
  // Parity with legacy updateShouldShowOsaContextCard: show the 1:1 card when the rollout is on
  // (via osaInlineCardVisible), the history is fully in view, and OSA is unacknowledged or
  // acknowledged. "Fully in view" = a friend placeholder, or the messages query has resolved with
  // no older page — waiting for the query avoids a flash + premature record_has_seen on cold open,
  // when hasMoreMessages is still false before the first fetch.
  const isHistoryFullyInView =
    conversation.source === CHAT_CONVERSATION_SOURCE.friends ||
    (!isMessagesLoading && !hasMoreMessages);
  const showOsaInlineCard =
    osaInlineCardVisible &&
    conversation.dialogType === "Direct" &&
    isHistoryFullyInView &&
    conversation.isOsaContextCardEligible === true;

  const { conversationId, friendId } = getModalConversationKey(conversation);
  const isChannels = conversation.source === CHAT_CONVERSATION_SOURCE.channels;
  const { id: rawConversationId } = conversation;
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    if (!showOsaInlineCard || hasRecordedRef.current) {
      return;
    }
    hasRecordedRef.current = true;
    recordModalSequenceResponse({
      conversationId,
      friendId,
      modalSequence: CHAT_MODAL_SEQUENCE.conversation_inline_top_modal,
      modalVariant: CHAT_MODAL_VARIANT.osa_context_card,
      actionType: CHAT_MODAL_ACTION_TYPE.record_has_seen,
    })
      .then(() => {
        // Refetch channels messages/preview after recording. The card is intentionally NOT hidden
        // here — it stays visible until the server reports the OSA status as acknowledged on a later
        // load, so the disclosure is actually read.
        if (isChannels) {
          queryClient
            .invalidateQueries({ queryKey: chatQueryKeys.conversationMessages(rawConversationId) })
            .catch((): undefined => undefined);
          queryClient
            .invalidateQueries({ queryKey: chatQueryKeys.conversations() })
            .catch((): undefined => undefined);
        }
        return undefined;
      })
      .catch((): undefined => undefined);
  }, [showOsaInlineCard, conversationId, friendId, isChannels, rawConversationId, queryClient]);

  return { showOsaInlineCard };
};

export default useOsaInlineCard;
