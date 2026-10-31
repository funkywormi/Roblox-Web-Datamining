import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { getConversationsParticipantsMetadata } from "../services/chatService";
import type { TParticipantMetadata } from "../types/api";

const EMPTY: Readonly<Record<string, TParticipantMetadata>> = {};

/** Shared raw metadata lets details and the consent modal reuse one request/cache safely. */
export const useConversationParticipantsMetadata = (
  conversationId: string,
  enabled: boolean,
): Readonly<Record<string, TParticipantMetadata>> => {
  const { data } = useQuery({
    queryKey: chatQueryKeys.participantsMetadata(conversationId),
    queryFn: async () => {
      const response = await getConversationsParticipantsMetadata([conversationId]);
      return (
        response.conversation_participants_metadata?.[conversationId]?.participants_metadata ??
        EMPTY
      );
    },
    enabled: enabled && conversationId.length > 0,
    staleTime: 60_000,
  });
  return data ?? EMPTY;
};
