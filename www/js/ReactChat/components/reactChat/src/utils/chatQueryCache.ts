import type { QueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import type { TChatApiConversation, TGetConversationMessagesResponse } from "../types/api";
import { getCurrentUserId } from "./currentUser";

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

export function getOtherParticipantIds(
  conversation: TChatApiConversation,
  currentUserId: number | null,
): number[] {
  if (conversation.participants && conversation.participants.length > 0) {
    return conversation.participants.map(user => user.id).filter(id => id !== currentUserId);
  }
  return (conversation.participant_user_ids ?? []).filter(id => id !== currentUserId);
}

// Mirrors the id derivation in toChatConversation, so list entries line up with the rendered rows.
// A friend suggestion has no server id and is keyed by its participant ids.
export function getConversationListId(conversation: TChatApiConversation): string {
  return (
    conversation.id ??
    `friends-${(conversation.participant_user_ids ?? []).toSorted((a, b) => a - b).join("-")}`
  );
}

function writeConversationsToList(
  queryClient: Pick<QueryClient, "setQueryData" | "getQueryData">,
  conversations: TChatApiConversation[],
  { appendNew }: { appendNew: boolean },
): void {
  const removedUserIds = new Set(
    queryClient.getQueryData<number[]>(chatQueryKeys.removedFriendUserIds()) ?? [],
  );
  const currentUserId = getCurrentUserId();
  // The server keeps returning an unfriended/blocked user's 1:1 until the removal propagates.
  const incoming = conversations.filter(
    conversation =>
      conversation.type === "group" ||
      !getOtherParticipantIds(conversation, currentUserId).some(id => removedUserIds.has(id)),
  );
  if (incoming.length === 0) {
    return;
  }
  queryClient.setQueryData<TChatApiConversation[]>(chatQueryKeys.conversationList(), previous => {
    const existing = previous ?? [];
    const incomingById = new Map(
      incoming.map(conversation => [getConversationListId(conversation), conversation]),
    );
    let hasChanged = false;
    const next = existing.map(conversation => {
      const id = getConversationListId(conversation);
      const fresh = incomingById.get(id);
      if (!fresh) {
        return conversation;
      }
      incomingById.delete(id);
      hasChanged ||= fresh !== conversation;
      return fresh;
    });
    if (appendNew && incomingById.size > 0) {
      next.push(...incomingById.values());
      hasChanged = true;
    }
    return hasChanged ? next : previous;
  });
}

// The server is authoritative for the conversations it returns: their copies replace ours. A
// conversation it does not return stays in the list until it is removed explicitly.
export function upsertConversationsInList(
  queryClient: Pick<QueryClient, "setQueryData" | "getQueryData">,
  conversations: TChatApiConversation[],
): void {
  writeConversationsToList(queryClient, conversations, { appendNew: true });
}

// Updates only conversations still in the list, so a late response cannot bring back one that was
// removed while it was in flight.
export function replaceConversationsInList(
  queryClient: Pick<QueryClient, "setQueryData" | "getQueryData">,
  conversations: TChatApiConversation[],
): void {
  writeConversationsToList(queryClient, conversations, { appendNew: false });
}

// Adds a conversation the user just opened, so its dialog can render before the server list
// returns it: a just-created one is not in that list yet, and an older 1:1 opened from the carousel
// may sit on a page that has not loaded. Keeps the existing copy if the list already has it.
export function addConversationToList(
  queryClient: Pick<QueryClient, "setQueryData" | "getQueryData">,
  conversation: TChatApiConversation,
): void {
  const { id } = conversation;
  if (id == null) {
    return;
  }
  queryClient.setQueryData<TChatApiConversation[]>(chatQueryKeys.conversationList(), previous => {
    const existing = previous ?? [];
    return existing.some(candidate => candidate.id === id) ? previous : [...existing, conversation];
  });
}

export function removeConversationsFromList(
  queryClient: Pick<QueryClient, "setQueryData">,
  conversationIds: string[],
): void {
  if (conversationIds.length === 0) {
    return;
  }
  const ids = new Set(conversationIds);
  queryClient.setQueryData<TChatApiConversation[]>(chatQueryKeys.conversationList(), previous => {
    if (!previous) {
      return previous;
    }
    const next = previous.filter(conversation => !ids.has(getConversationListId(conversation)));
    return next.length === previous.length ? previous : next;
  });
}

export function patchConversationsInList(
  queryClient: Pick<QueryClient, "setQueryData">,
  conversationIds: string[],
  patch: Partial<TChatApiConversation>,
): void {
  const ids = new Set(conversationIds);
  queryClient.setQueryData<TChatApiConversation[]>(chatQueryKeys.conversationList(), previous => {
    if (!previous?.some(conversation => conversation.id != null && ids.has(conversation.id))) {
      return previous;
    }
    return previous.map(conversation =>
      conversation.id != null && ids.has(conversation.id)
        ? { ...conversation, ...patch }
        : conversation,
    );
  });
}

// Writes a conversation's cached messages without moving dataUpdatedAt. useConversationMessages
// reads dataUpdatedAt as "the server last answered for the latest page", and every setQueryData
// moves it unless it is told otherwise. A client-only write, such as the optimistic send or its
// removal, is not a server answer and must not reload the older pages.
export function setConversationMessagesCache(
  queryClient: Pick<QueryClient, "setQueryData" | "getQueryState">,
  conversationId: string,
  updater: (
    current: TGetConversationMessagesResponse | undefined,
  ) => TGetConversationMessagesResponse | undefined,
): void {
  const queryKey = chatQueryKeys.conversationMessages(conversationId);
  queryClient.setQueryData<TGetConversationMessagesResponse>(queryKey, updater, {
    updatedAt: queryClient.getQueryState(queryKey)?.dataUpdatedAt,
  });
}
