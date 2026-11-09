import type { QueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import type { TChatApiConversation } from "../types/api";
import { addRemovedFriendUserIds, removeConversationsFromList } from "./chatQueryCache";
import {
  applyChatRealtimeCacheActions,
  findDirectConversationIdsForUsers,
  type TChatRealtimeCacheAction,
} from "./chatRealtimeCacheActions";
import {
  clearConversationTyping,
  dispatchConversationRemoved,
  dispatchFeatureInterventionTimeout,
  dispatchIncomingMessage,
  dispatchNudge,
  dispatchTypingUpdate,
} from "./chatRealtimeEvents";
import { parseChatRealtimeDetail } from "./chatRealtimePayload";
import { getCurrentUserId } from "./currentUser";

export function dispatchRealtimeDetail(
  queryClient: Pick<
    QueryClient,
    "invalidateQueries" | "refetchQueries" | "getQueryData" | "setQueryData"
  >,
  detail: unknown,
): void {
  const events = parseChatRealtimeDetail(detail);
  const cacheActions: TChatRealtimeCacheAction[] = [];
  const currentUserId = getCurrentUserId();

  for (const event of events) {
    if (event.kind === "typing") {
      if (currentUserId !== null && event.userId === currentUserId) {
        continue;
      }

      dispatchTypingUpdate({
        conversationId: event.conversationId,
        userId: event.userId,
        isTyping: true,
      });
      continue;
    }

    if (event.kind === "incoming_message") {
      clearConversationTyping(event.conversationId);
      if (!event.isSelfAuthored) {
        dispatchIncomingMessage(event.conversationId);
      }
    }

    if (event.kind === "conversation_removed") {
      // Clear typing first so no stale indicator lingers on the closed dialog. The dialog closes
      // off the rendered list, so remove the conversation from the list after that.
      clearConversationTyping(event.conversationId);
      dispatchConversationRemoved(event.conversationId);
      removeConversationsFromList(queryClient, [event.conversationId]);
    }

    if (event.kind === "friendship_removed") {
      const removedIds = findDirectConversationIdsForUsers(
        queryClient.getQueryData<TChatApiConversation[]>(chatQueryKeys.conversationList()),
        event.userIds,
        currentUserId,
      );
      // Close any open dialog for the removed 1:1 while it is still in the live list, clearing its
      // typing state so a blocked/unfriended user's stale indicator doesn't linger.
      for (const removedId of removedIds) {
        clearConversationTyping(removedId);
        dispatchConversationRemoved(removedId);
      }
      removeConversationsFromList(queryClient, removedIds);
      // Tombstone the users — the server keeps returning their 1:1 until the removal propagates,
      // and the tombstone keeps the list from taking it back.
      addRemovedFriendUserIds(queryClient, event.userIds);
      // The roster changed; refresh the friends directory + presence (legacy flushes friends data).
      cacheActions.push({ kind: "invalidate_friends_directory" }, { kind: "invalidate_presence" });
      continue;
    }

    if (event.kind === "feature_intervention") {
      if (event.interventionType === "timeout" && event.endTimeMs !== undefined) {
        dispatchFeatureInterventionTimeout({
          type: "timeout",
          conversationId: event.conversationId,
          endTimeMs: event.endTimeMs,
          timeoutDurationSeconds: event.timeoutDurationSeconds,
          decisionEventId: event.decisionEventId,
          acknowledgeable: event.acknowledgeable,
          title: event.title,
          body: event.body,
          timeoutStartTime: event.timeoutStartTime,
        });
      } else if (event.interventionType === "nudge") {
        dispatchNudge({
          type: "nudge",
          decisionEventId: event.decisionEventId,
          acknowledgeable: event.acknowledgeable,
          title: event.title,
          body: event.body,
        });
      }
      continue;
    }

    if (event.kind === "cache") {
      for (const action of event.actions) {
        if (
          action.kind === "invalidate_conversation_messages" ||
          action.kind === "refetch_conversation_messages"
        ) {
          clearConversationTyping(action.conversationId);
        }
      }
      cacheActions.push(...event.actions);
    }
  }

  if (cacheActions.length > 0) {
    applyChatRealtimeCacheActions(queryClient, cacheActions).catch((): undefined => undefined);
  }
}
