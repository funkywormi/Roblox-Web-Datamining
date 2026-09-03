import { UseQueryResult, useMutation, useQuery } from "@tanstack/react-query";
import EnvironmentUrls from "@rbx/environment-urls";
import { httpService, uuidService } from "@rbx/core-scripts/legacy/core-utilities";
import type { UrlConfig } from "@rbx/core-scripts/http";
import { C3GetChatMessagesResponse, C3Interaction } from "../core/types/c3Chat";

const CHAT_MESSAGES_REFETCH_INTERVAL = 500;
const CHAT_MESSAGE_POST_RETRIES = 3;

const buildGetMessageUrlConfig = (conversationId: string): UrlConfig => {
  return {
    url: `${EnvironmentUrls.apiGatewayUrl}/chatbot-api/v1/conversations/${conversationId}/interactions`,
    retryable: true,
    withCredentials: false,
  };
};

const buildPostMessageUrlConfig = (conversationId: string): UrlConfig => {
  return {
    url: `${EnvironmentUrls.apiGatewayUrl}/chatbot-api/v1/conversations/${conversationId}/interaction`,
    retryable: true,
    withCredentials: false,
  };
};

export const useGetChatMessage = (
  conversationId: string,
  conversationAuthToken: string,
  lastMessageOrdinal: number,
  waitingForResponse: boolean,
  enabled: boolean,
): UseQueryResult<C3GetChatMessagesResponse, Error> => {
  return useQuery({
    queryKey: ["chatMessage", conversationId, lastMessageOrdinal],
    queryFn: async (): Promise<C3GetChatMessagesResponse> => {
      const urlConfig = buildGetMessageUrlConfig(conversationId);

      const { data } = await httpService.get<C3GetChatMessagesResponse>(urlConfig, {
        minOrdinal: lastMessageOrdinal + 1, // get messages after the last message ordinal
        conversationAuthToken,
      });
      return data;
    },
    // when the user is not waiting for a response, we want to refetch less frequently,
    // the backend can then send a message to end the conversation
    refetchInterval: waitingForResponse
      ? CHAT_MESSAGES_REFETCH_INTERVAL
      : CHAT_MESSAGES_REFETCH_INTERVAL * 4,
    enabled,
  });
};

export const usePostChatMessage = (
  conversationId: string,
  conversationAuthToken: string,
): { postChatMessage: (interaction: C3Interaction) => void; failureCount: number } => {
  const { mutate: postChatMessage, failureCount } = useMutation({
    mutationFn: async (interaction: C3Interaction) => {
      const urlConfig = buildPostMessageUrlConfig(conversationId);

      const { data: postData } = await httpService.post(urlConfig, {
        conversationAuthToken,
        idempotencyKey: uuidService.generateRandomUuid(),
        interaction,
      });
      return postData;
    },
    retry: CHAT_MESSAGE_POST_RETRIES,
  });
  return {
    postChatMessage,
    failureCount,
  };
};

export { buildGetMessageUrlConfig, buildPostMessageUrlConfig };
