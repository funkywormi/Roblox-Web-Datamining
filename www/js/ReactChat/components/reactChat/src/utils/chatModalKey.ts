import { CHAT_CONVERSATION_SOURCE } from "../constants/chatPolicyConstants";
import type { TChatConversation } from "../types/chat";

export type TModalConversationKey = {
  conversationId?: string;
  friendId?: string;
};

/**
 * The modal-sequence endpoints (`/v2/get-modal-sequence`, `/v1/record-modal-sequence-response`)
 * key a friends-source conversation by the *friend's* user id, and every other conversation by its
 * conversation id. React keeps the API conversation id and excludes the local user from
 * `participants`, so the friend is participants[0].
 */
export const getModalConversationKey = (
  conversation: Pick<TChatConversation, "source" | "id" | "participants">,
): TModalConversationKey => {
  const isFriendsSource = conversation.source === CHAT_CONVERSATION_SOURCE.friends;
  const friendUserId = isFriendsSource ? conversation.participants[0]?.id : undefined;
  return {
    conversationId: isFriendsSource ? undefined : conversation.id,
    friendId: friendUserId != null ? String(friendUserId) : undefined,
  };
};
