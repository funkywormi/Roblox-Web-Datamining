import environmentUrls from "@rbx/environment-urls";
import chatHttpTransport from "./chatHttpTransport";
import type {
  TChatApiConversation,
  TCreateConversationsResponse,
  TGetChatMetadataResponse,
  TGetConversationMessagesResponse,
  TGetConversationMetadataResponse,
  TGetModalSequenceResponse,
  TGetUserConversationsResponse,
  TSendMessageResponse,
  TUpdateConversationsResponse,
} from "../types/api";
import type { TChatModerationStatusesResponse } from "../adapters/chatModerationAdapters";
import { getCurrentUserId } from "../utils/currentUser";

const CHAT_API_BASE_URL = environmentUrls.chatApi;
const DEFAULT_CONVERSATION_PAGE_SIZE = 20;

const get = <TResponse>(
  path: string,
  params?: Record<string, string | number | boolean | null | undefined>,
): Promise<TResponse> =>
  chatHttpTransport.get<TResponse>(
    {
      url: `${CHAT_API_BASE_URL}${path}`,
      withCredentials: true,
    },
    params,
  );

const post = <TResponse>(path: string, data?: Record<string, unknown>): Promise<TResponse> =>
  chatHttpTransport.post<TResponse>(
    {
      url: `${CHAT_API_BASE_URL}${path}`,
      withCredentials: true,
    },
    data,
  );

export const getUserConversations = async (
  cursor?: string | null,
): Promise<TGetUserConversationsResponse> =>
  get<TGetUserConversationsResponse>("/v1/get-user-conversations", {
    include_user_data: true,
    cursor,
    pageSize: DEFAULT_CONVERSATION_PAGE_SIZE,
  });

export const getConversationMessages = async (
  conversationId: string,
  cursor?: string | null,
): Promise<TGetConversationMessagesResponse> =>
  get<TGetConversationMessagesResponse>("/v1/get-conversation-messages", {
    conversation_id: conversationId,
    cursor,
  });

export const getConversationMetadata = async (): Promise<TGetConversationMetadataResponse> =>
  get<TGetConversationMetadataResponse>("/v1/get-conversation-metadata");

/**
 * Chat settings/metadata. Distinct from `/v1/get-conversation-metadata` (unread counts) — this is
 * the response that carries the web-chat eventstream sampling rate. It lives on the API gateway
 * (`platform-chat-api/v1/metadata`), NOT the chat domain that serves the other `/v1/*` calls, so it
 * is requested directly rather than through the chatApi-based `get` helper.
 */
const CHAT_METADATA_URL = `${environmentUrls.apiGatewayUrl}/platform-chat-api/v1/metadata`;

// noCache so a re-enabled privacy setting reads fresh isChatEnabled* fields: without it the browser
// serves a cached "disabled" body and chat never returns after the user turns chat back on (parity
// with the legacy chat's getMetaData(shouldBypassCache) on UserSettingsChanged).
export const getChatMetadata = async (): Promise<TGetChatMetadataResponse> =>
  chatHttpTransport.get<TGetChatMetadataResponse>(
    { url: CHAT_METADATA_URL, withCredentials: true, noCache: true },
    { userId: getCurrentUserId() ?? "" },
  );

export const sendMessage = async (
  conversationId: string,
  content: string,
): Promise<TSendMessageResponse> =>
  post<TSendMessageResponse>("/v1/send-messages", {
    conversation_id: conversationId,
    messages: [{ content }],
  });

export const markConversationsAsRead = async (conversationIds: string[]): Promise<void> => {
  // Body shape must match the server contract used by the legacy chat:
  // `conversation_ids: string[]`. Sending `conversations: [{ id }]` is silently
  // ignored server-side, so unread counts never actually clear (UBIQUITY-3094).
  await post<unknown>("/v1/mark-conversations", {
    conversation_ids: conversationIds,
  });
};

export const updateTypingStatus = async (conversationId: string): Promise<void> => {
  await post<unknown>("/v1/update-typing-status", {
    conversation_id: conversationId,
  });
};

const extractFirstConversation = (conversations: TChatApiConversation[]): TChatApiConversation => {
  const first = conversations[0];
  if (!first) {
    throw new Error("Server returned no conversations");
  }
  return first;
};

export const createGroupConversation = async (
  name: string,
  participantUserIds: number[],
): Promise<TChatApiConversation> => {
  const response = await post<TCreateConversationsResponse>("/v1/create-conversations", {
    conversations: [{ type: "group", name, participant_user_ids: participantUserIds }],
    include_user_data: true,
  });
  return extractFirstConversation(response.conversations);
};

export const createOneToOneConversation = async (
  participantUserId: number,
): Promise<TChatApiConversation> => {
  const response = await post<TCreateConversationsResponse>("/v1/create-conversations", {
    conversations: [{ type: "one_to_one", participant_user_ids: [participantUserId] }],
    include_user_data: true,
  });
  return extractFirstConversation(response.conversations);
};

export const renameGroupConversation = async (
  conversationId: string,
  name: string,
): Promise<TChatApiConversation> => {
  const response = await post<TUpdateConversationsResponse>("/v1/update-conversations", {
    conversations: [{ id: conversationId, name }],
  });
  return extractFirstConversation(response.conversations);
};

export const addUsersToConversation = async (
  conversationId: string,
  userIds: number[],
): Promise<void> => {
  await post<unknown>("/v1/add-users", {
    conversation_id: conversationId,
    user_ids: userIds,
  });
};

export const removeUsersFromConversation = async (
  conversationId: string,
  userIds: number[],
): Promise<void> => {
  await post<unknown>("/v1/remove-users", {
    conversation_id: conversationId,
    user_ids: userIds,
  });
};

export const getChatModerationStatuses = async (
  conversationIds: string[],
): Promise<TChatModerationStatusesResponse> =>
  post<TChatModerationStatusesResponse>("/v1/get-chat-moderation-statuses", {
    ids: conversationIds,
  });

// Conversation-overlay modal sequence (Trusted Connections FTUX). Matches the legacy chat:
// 1:1 friends conversations send `friend_id`, channel conversations send `conversation_id`
// (see Angular getDynamicConversationId). `is_in_experience` is always false on web.
export const getModalSequence = async (params: {
  conversationId?: string;
  friendId?: string;
  modalSequence: string;
}): Promise<TGetModalSequenceResponse> =>
  post<TGetModalSequenceResponse>("/v2/get-modal-sequence", {
    conversation_id: params.conversationId,
    friend_id: params.friendId,
    modal_sequence: params.modalSequence,
    is_in_experience: false,
  });

export const recordModalSequenceResponse = async (params: {
  conversationId?: string;
  friendId?: string;
  modalSequence: string;
  modalVariant?: string;
  modalId?: string;
  actionType?: string;
}): Promise<void> => {
  await post<unknown>("/v1/record-modal-sequence-response", {
    conversation_id: params.conversationId,
    friend_id: params.friendId,
    modal_sequence: params.modalSequence,
    modal_variant: params.modalVariant,
    modal_id: params.modalId,
    action_type: params.actionType,
  });
};

const METRICS_API_BASE_URL = environmentUrls.metricsApi;

export const sendPerformanceMeasurement = async (
  measureName: string,
  value: number,
): Promise<void> => {
  await chatHttpTransport.post<unknown>(
    {
      url: `${METRICS_API_BASE_URL}/v1/performance/send-measurement`,
      withCredentials: true,
    },
    { featureName: "Chat", measureName, value },
  );
};
