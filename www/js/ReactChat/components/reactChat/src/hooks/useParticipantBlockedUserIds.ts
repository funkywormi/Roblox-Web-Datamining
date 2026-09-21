import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { getConversationsParticipantsMetadata } from "../services/chatService";

const EMPTY: ReadonlySet<number> = new Set();

// Blocked participant ids for a conversation, from /v1/get-conversations-participants-metadata.
// Feeds the group-OSA consent modal's Blocked badge (legacy parity). Only fetches when enabled.
export const useParticipantBlockedUserIds = (
  conversationId: string,
  enabled: boolean,
): ReadonlySet<number> => {
  const { data } = useQuery({
    queryKey: chatQueryKeys.participantsMetadata(conversationId),
    queryFn: async () => {
      const response = await getConversationsParticipantsMetadata([conversationId]);
      const metadata =
        response.conversation_participants_metadata?.[conversationId]?.participants_metadata ?? {};
      const blocked = new Set<number>();
      for (const [userId, entry] of Object.entries(metadata)) {
        if (entry.is_blocked) {
          blocked.add(Number(userId));
        }
      }
      return blocked;
    },
    enabled: enabled && conversationId.length > 0,
    staleTime: 60_000,
  });

  return data ?? EMPTY;
};
