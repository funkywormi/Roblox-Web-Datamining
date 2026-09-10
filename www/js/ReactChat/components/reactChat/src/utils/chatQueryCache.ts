import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import type { TChatApiConversation, TGetUserConversationsResponse } from "../types/api";

// Tombstones unfriended/blocked users so useChatData filters their 1:1 out of the list until the
// server stops returning it (see removedFriendUserIds). De-duped.
export function addRemovedFriendUserIds(
  queryClient: Pick<QueryClient, "setQueryData">,
  userIds: number[],
): void {
  if (userIds.length === 0) {
    return;
  }
  queryClient.setQueryData<number[]>(chatQueryKeys.removedFriendUserIds(), previous => {
    const existing = previous ?? [];
    const merged = new Set([...existing, ...userIds]);
    return merged.size === existing.length ? existing : [...merged];
  });
}

// Adds a just-created conversation to the pending-seed store so useChatData can show it immediately,
// before the server's conversation list catches up. A no-op if it (or the server list) already has
// it — dedup by id keeps a repeated first-message send from stacking duplicates.
export function seedPendingConversation(
  queryClient: Pick<QueryClient, "setQueryData">,
  conversation: TChatApiConversation,
): void {
  if (conversation.id == null) {
    return;
  }
  queryClient.setQueryData<TChatApiConversation[]>(
    chatQueryKeys.pendingConversations(),
    previous => {
      const existing = previous ?? [];
      if (existing.some(pending => pending.id === conversation.id)) {
        return existing;
      }
      return [...existing, conversation];
    },
  );
}

// Drops seeded conversations once the server's list includes them, so the (fresher) server copy
// wins and the seed store stays small.
export function prunePendingConversations(
  queryClient: Pick<QueryClient, "setQueryData">,
  serverConversationIds: ReadonlySet<string>,
): void {
  queryClient.setQueryData<TChatApiConversation[]>(
    chatQueryKeys.pendingConversations(),
    previous => {
      if (!previous || previous.length === 0) {
        return previous;
      }
      const next = previous.filter(
        pending => pending.id == null || !serverConversationIds.has(pending.id),
      );
      return next.length === previous.length ? previous : next;
    },
  );
}

export function patchConversationInListCache(
  queryClient: Pick<QueryClient, "setQueryData">,
  conversationId: string,
  patch: Partial<TChatApiConversation>,
): void {
  // The conversations list is an infinite query, so the cache holds InfiniteData with a `pages`
  // array (not a flat { conversations }); patch the matching conversation within its page.
  queryClient.setQueryData<InfiniteData<TGetUserConversationsResponse>>(
    chatQueryKeys.conversations(),
    previous => {
      if (!previous) {
        return previous;
      }

      const hasMatch = previous.pages.some(page =>
        page.conversations.some(conversation => conversation.id === conversationId),
      );
      if (!hasMatch) {
        return previous;
      }

      return {
        ...previous,
        pages: previous.pages.map(page => ({
          ...page,
          conversations: page.conversations.map(conversation =>
            conversation.id === conversationId ? { ...conversation, ...patch } : conversation,
          ),
        })),
      };
    },
  );
}
