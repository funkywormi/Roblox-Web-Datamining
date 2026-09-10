import type { TChatApiConversation } from "../types/api";
import {
  CHAT_CONVERSATION_SOURCE,
  CHAT_MODERATION_TYPE,
  CHAT_OSA_ACK_STATUS,
  CHAT_PENDING_STATUS,
  CHAT_USER_MESSAGE_OPT_IN_STATUS,
} from "../constants/chatPolicyConstants";

export type TChatMetadataFlags = {
  isWebChatRegionalityEnabled?: boolean;
  isWebChatSettingsMigrationEnabled?: boolean;
};

export type TDerivedChatPolicyFlags = {
  isConversationUnavailableWithUser: boolean;
  isUserPending: boolean;
  /** OSA acknowledgement is "unacknowledged" (gates the 1:1 inline OSA context card). */
  isOsaBlocked: boolean;
  /** Server (not the placeholder default) marked this 1:1 OSA-unacknowledged — gates the UK-only autoscroll. */
  isOneToOneOsaServerUnacknowledged: boolean;
  /**
   * OSA unacknowledged AND this is a group conversation — the blocking group-OSA modal case, which
   * only applies to multi-user conversations. GUAC gating (expandedChat/opt-in) is composed at the
   * component layer.
   */
  isGroupOsaUnacknowledged: boolean;
  /** User has not opted into chat messages (gates the U13 opt-in modal when expandedChat is on). */
  isChatOptInBlocked: boolean;
  /** OSA status is unacknowledged or acknowledged — the 1:1 context card shows for both (legacy parity). */
  isOsaContextCardEligible: boolean;
};

export function deriveChatPolicyFlags(
  conv: TChatApiConversation,
  metadata: TChatMetadataFlags | undefined,
): TDerivedChatPolicyFlags {
  const isUserPending = conv.user_pending_status === CHAT_PENDING_STATUS.pending;

  let isConversationUnavailableWithUser = false;
  if (metadata?.isWebChatRegionalityEnabled || metadata?.isWebChatSettingsMigrationEnabled) {
    isConversationUnavailableWithUser =
      conv.participant_pending_status === CHAT_PENDING_STATUS.pending;
  }

  // A never-chatted friend (source "friends") has no server OSA status; default it to unacknowledged
  // so the first-interaction card shows. An explicit server status always wins.
  const isFriendPlaceholder = conv.source?.toLowerCase() === CHAT_CONVERSATION_SOURCE.friends;
  const osa =
    conv.osa_acknowledgement_status ??
    (isFriendPlaceholder ? CHAT_OSA_ACK_STATUS.unacknowledged : CHAT_OSA_ACK_STATUS.not_applicable);
  const isOsaBlocked = osa === CHAT_OSA_ACK_STATUS.unacknowledged;
  const isGroupOsaUnacknowledged = isOsaBlocked && conv.type === "group";
  // Raw server status only (not the placeholder default): a never-chatted friend shows the card but
  // doesn't autoscroll unless the server (a UK account) marked it unacknowledged.
  const isOneToOneOsaServerUnacknowledged =
    conv.osa_acknowledgement_status === CHAT_OSA_ACK_STATUS.unacknowledged && conv.type !== "group";
  const isOsaContextCardEligible =
    osa === CHAT_OSA_ACK_STATUS.unacknowledged || osa === CHAT_OSA_ACK_STATUS.acknowledged;

  const optIn =
    conv.user_opted_into_chat_messages ?? CHAT_USER_MESSAGE_OPT_IN_STATUS.not_applicable;
  const isChatOptInBlocked = optIn === CHAT_USER_MESSAGE_OPT_IN_STATUS.not_opted_in;

  return {
    isConversationUnavailableWithUser,
    isUserPending,
    isOsaBlocked,
    isOneToOneOsaServerUnacknowledged,
    isGroupOsaUnacknowledged,
    isChatOptInBlocked,
    isOsaContextCardEligible,
  };
}

export function canFetchModerationStatusesForConversation(conv: TChatApiConversation): boolean {
  const moderationType = conv.moderation_type?.toLowerCase();
  const source = conv.source?.toLowerCase();
  if (moderationType === CHAT_MODERATION_TYPE.trusted_comms) {
    return false;
  }
  if (moderationType === CHAT_MODERATION_TYPE.moderated) {
    return true;
  }
  return source === "channels";
}
