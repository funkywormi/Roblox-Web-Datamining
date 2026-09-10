import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import type { TChatApiConversation, TGetUserConversationsResponse } from "../types/api";

export type TChatRealtimeCacheAction =
  | { kind: "invalidate_user_conversations" }
  | { kind: "invalidate_conversation_metadata" }
  | {
      kind: "invalidate_conversation_messages";
      conversationId: string;
      reason: "partial" | "full";
    }
  | { kind: "refetch_conversation_messages"; conversationId: string }
  | { kind: "invalidate_friends_directory" }
  | { kind: "invalidate_presence" }
  | { kind: "invalidate_chat_settings" }
  | { kind: "invalidate_all_conversation_messages" };

function otherParticipantIds(
  conversation: TChatApiConversation,
  currentUserId: number | null,
): number[] {
  if (conversation.participants && conversation.participants.length > 0) {
    return conversation.participants.map(user => user.id).filter(id => id !== currentUserId);
  }
  return (conversation.participant_user_ids ?? []).filter(id => id !== currentUserId);
}

// Mirrors the id derivation in toChatConversation so removed ids line up with the rendered list
// (a friend placeholder has no server id and is keyed by its participant ids).
function deriveConversationId(conversation: TChatApiConversation): string {
  return (
    conversation.id ??
    `friends-${(conversation.participant_user_ids ?? []).toSorted((a, b) => a - b).join("-")}`
  );
}

// Ids of each user's 1:1 (non-group) conversation — real or friend-placeholder — in the cached
// list. Used on FriendshipDestroyed to close those dialogs; the list itself is filtered durably via
// the removedFriendUserIds tombstone (see useChatData), since the server keeps returning the
// conversation and a plain cache removal would reappear on the next refetch.
export function findDirectConversationIdsForUsers(
  data: InfiniteData<TGetUserConversationsResponse> | undefined,
  userIds: number[],
  currentUserId: number | null,
): string[] {
  if (!data || userIds.length === 0) {
    return [];
  }
  const targets = new Set(userIds);
  const ids: string[] = [];
  for (const page of data.pages) {
    for (const conversation of page.conversations) {
      const others = otherParticipantIds(conversation, currentUserId);
      const onlyOther = others.length === 1 ? others[0] : undefined;
      if (conversation.type !== "group" && onlyOther !== undefined && targets.has(onlyOther)) {
        ids.push(deriveConversationId(conversation));
      }
    }
  }
  return ids;
}

export async function applyChatRealtimeCacheActions(
  client: Pick<QueryClient, "invalidateQueries" | "refetchQueries">,
  actions: TChatRealtimeCacheAction[],
): Promise<void> {
  const tasks = actions.map(async action => {
    switch (action.kind) {
      case "invalidate_user_conversations":
        await client.invalidateQueries({ queryKey: chatQueryKeys.conversations() });
        return;
      case "invalidate_conversation_metadata":
        await client.invalidateQueries({ queryKey: chatQueryKeys.metadata() });
        return;
      case "invalidate_conversation_messages":
        await client.invalidateQueries({
          queryKey: chatQueryKeys.conversationMessages(action.conversationId),
        });
        return;
      case "refetch_conversation_messages":
        await client.refetchQueries({
          queryKey: chatQueryKeys.conversationMessages(action.conversationId),
          type: "all",
        });
        return;
      case "invalidate_friends_directory":
        await client.invalidateQueries({ queryKey: chatQueryKeys.friendsDirectoryAll() });
        return;
      case "invalidate_presence":
        await client.invalidateQueries({ queryKey: chatQueryKeys.presenceAll() });
        return;
      case "invalidate_chat_settings":
        await client.invalidateQueries({ queryKey: chatQueryKeys.chatSettings() });
        return;
      case "invalidate_all_conversation_messages":
        await client.invalidateQueries({ queryKey: chatQueryKeys.conversationMessagesAll() });
        return;
      default: {
        const never: never = action;
        return never;
      }
    }
  });

  await Promise.all(tasks);
}
