import { useMemo } from "react";
import { useConversationParticipantsMetadata } from "./useConversationParticipantsMetadata";

// Blocked participant ids for a conversation, from /v1/get-conversations-participants-metadata.
// Feeds the group-OSA consent modal's Blocked badge (legacy parity). Only fetches when enabled.
export const useParticipantBlockedUserIds = (
  conversationId: string,
  enabled: boolean,
): ReadonlySet<number> => {
  const metadata = useConversationParticipantsMetadata(conversationId, enabled);
  return useMemo(
    () =>
      new Set(
        Object.entries(metadata)
          .filter(([, entry]) => entry.is_blocked === true)
          .map(([userId]) => Number(userId)),
      ),
    [metadata],
  );
};
