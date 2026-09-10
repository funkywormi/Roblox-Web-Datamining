import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { CHAT_METADATA_DEFAULTS } from "../constants/chatMetadataConstants";
import { getChatMetadata } from "../services/chatService";

export type TChatMetadataConfig = {
  maxConversationTitleLength: number;
  typingInChatFromSenderThrottleMs: number;
  typingInChatForReceiverExpirationMs: number;
  /** Invite cap for a group conversation (server `numberOfMembersForPartyChrome` − 1). */
  groupInviteMemberCap: number;
  partyChromeDisplayTimeStampInterval: number;
  shouldRespectConversationHasUnreadMessageToMarkAsRead: boolean;
  relativeValueToRecordUiPerformance: number;
};

/**
 * Resolves the chat settings served by `platform-chat-api/v1/metadata` into a fully-defaulted config
 * object. Reads the same `chatSettings` query as `useChatData` (deduped by react-query, so no extra
 * network call) and falls back to `CHAT_METADATA_DEFAULTS` for any field the server omits — so the
 * client honors server config while preserving prior behavior when a field is absent.
 */
export const useChatMetadataConfig = (): TChatMetadataConfig => {
  const { data } = useQuery({
    queryKey: chatQueryKeys.chatSettings(),
    queryFn: getChatMetadata,
    staleTime: Infinity,
  });

  return {
    maxConversationTitleLength:
      data?.maxConversationTitleLength ?? CHAT_METADATA_DEFAULTS.maxConversationTitleLength,
    typingInChatFromSenderThrottleMs:
      data?.typingInChatFromSenderThrottleMs ??
      CHAT_METADATA_DEFAULTS.typingInChatFromSenderThrottleMs,
    typingInChatForReceiverExpirationMs:
      data?.typingInChatForReceiverExpirationMs ??
      CHAT_METADATA_DEFAULTS.typingInChatForReceiverExpirationMs,
    groupInviteMemberCap:
      (data?.numberOfMembersForPartyChrome ??
        CHAT_METADATA_DEFAULTS.numberOfMembersForPartyChrome) - 1,
    partyChromeDisplayTimeStampInterval:
      data?.partyChromeDisplayTimeStampInterval ??
      CHAT_METADATA_DEFAULTS.partyChromeDisplayTimeStampInterval,
    shouldRespectConversationHasUnreadMessageToMarkAsRead:
      data?.shouldRespectConversationHasUnreadMessageToMarkAsRead ??
      CHAT_METADATA_DEFAULTS.shouldRespectConversationHasUnreadMessageToMarkAsRead,
    relativeValueToRecordUiPerformance:
      data?.relativeValueToRecordUiPerformance ??
      CHAT_METADATA_DEFAULTS.relativeValueToRecordUiPerformance,
  };
};

export default useChatMetadataConfig;
