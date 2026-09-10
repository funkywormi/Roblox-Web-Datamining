import type { InfiniteData, QueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import type { TGetUserConversationsResponse } from "../types/api";
import { addRemovedFriendUserIds } from "./chatQueryCache";
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
      // Clear typing first so no stale indicator lingers on the closed dialog.
      clearConversationTyping(event.conversationId);
      dispatchConversationRemoved(event.conversationId);
    }

    if (event.kind === "friendship_removed") {
      const current = queryClient.getQueryData<InfiniteData<TGetUserConversationsResponse>>(
        chatQueryKeys.conversations(),
      );
      // Close any open dialog for the removed 1:1 while it is still in the live list, clearing its
      // typing state so a blocked/unfriended user's stale indicator doesn't linger.
      for (const removedId of findDirectConversationIdsForUsers(
        current,
        event.userIds,
        currentUserId,
      )) {
        clearConversationTyping(removedId);
        dispatchConversationRemoved(removedId);
      }
      // Tombstone the users so useChatData filters their 1:1 out durably — the server keeps
      // returning it until the removal propagates, so a plain cache removal would reappear.
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
