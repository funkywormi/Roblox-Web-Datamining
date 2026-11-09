import type { QueryClient } from "@tanstack/react-query";
import { userProfilesQueryKeys } from "@rbx/www-common/user-profiles";
import { chatQueryKeys, FRIEND_PROFILE_FIELDS } from "../constants/queryKeys";
import type { TChatApiConversation } from "../types/api";
import { getConversationListId, getOtherParticipantIds } from "./chatQueryCache";

export type TChatRealtimeCacheAction =
  | { kind: "invalidate_user_conversations" }
  | { kind: "invalidate_conversation_metadata" }
  | {
      kind: "invalidate_conversation_messages";
      conversationId: string;
      reason: "partial" | "full";
    }
  | { kind: "refetch_conversation_messages"; conversationId: string }
  | { kind: "invalidate_participants_metadata"; conversationId?: string }
  | { kind: "invalidate_friends_directory" }
  | { kind: "invalidate_friend_profiles" }
  | { kind: "invalidate_presence" }
  | { kind: "invalidate_chat_settings" }
  | { kind: "invalidate_all_conversation_messages" };

// Ids of each user's 1:1 (non-group) conversation — real or friend-placeholder — in the conversation
// list. Used on FriendshipDestroyed to close those dialogs and remove them from the list; the
// removedFriendUserIds tombstone (see useChatData) keeps them out while the server still returns them.
export function findDirectConversationIdsForUsers(
  conversations: TChatApiConversation[] | undefined,
  userIds: number[],
  currentUserId: number | null,
): string[] {
  if (!conversations || userIds.length === 0) {
    return [];
  }
  const targets = new Set(userIds);
  const ids: string[] = [];
  for (const conversation of conversations) {
    const others = getOtherParticipantIds(conversation, currentUserId);
    const onlyOther = others.length === 1 ? others[0] : undefined;
    if (conversation.type !== "group" && onlyOther !== undefined && targets.has(onlyOther)) {
      ids.push(getConversationListId(conversation));
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
      case "invalidate_participants_metadata":
        await client.invalidateQueries({
          queryKey:
            action.conversationId === undefined
              ? chatQueryKeys.participantsMetadataAll()
              : chatQueryKeys.participantsMetadata(action.conversationId),
        });
        return;
      case "invalidate_friends_directory":
        await client.invalidateQueries({ queryKey: chatQueryKeys.friendsDirectoryAll() });
        return;
      case "invalidate_friend_profiles":
        await client.invalidateQueries({
          queryKey: userProfilesQueryKeys.fields(FRIEND_PROFILE_FIELDS),
        });
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
