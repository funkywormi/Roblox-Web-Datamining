import { useCallback, useEffect, useRef } from "react";
import type { InfiniteData } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { markConversationsAsRead } from "../services/chatService";
import type { TGetUserConversationsResponse } from "../types/api";

const MARK_READ_DEBOUNCE_MS = 400;

type TUseMarkAsReadOptions = {
  enabled: boolean;
  /**
   * When true (server `shouldRespectConversationHasUnreadMessageToMarkAsRead`), only mark a
   * conversation read if the cached conversation actually has unread messages — avoids redundant
   * mark-read calls. Defaults to false (always mark), preserving prior behavior.
   */
  shouldRespectUnread?: boolean;
};

export type TUseMarkAsReadResult = {
  scheduleMarkRead: (conversationId: string) => void;
};

export function useMarkAsRead({
  enabled,
  shouldRespectUnread = false,
}: TUseMarkAsReadOptions): TUseMarkAsReadResult {
  const queryClient = useQueryClient();
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { mutate } = useMutation({
    mutationFn: (conversationIds: string[]) => markConversationsAsRead(conversationIds),
    onMutate: conversationIds => {
      const idSet = new Set(conversationIds);
      queryClient.setQueryData<InfiniteData<TGetUserConversationsResponse>>(
        chatQueryKeys.conversations(),
        previous => {
          if (!previous) {
            return previous;
          }

          return {
            ...previous,
            pages: previous.pages.map(page => ({
              ...page,
              conversations: page.conversations.map(conversation =>
                conversation.id != null && idSet.has(conversation.id)
                  ? { ...conversation, unread_message_count: 0 }
                  : conversation,
              ),
            })),
          };
        },
      );
    },
    onSettled: () => {
      queryClient
        .invalidateQueries({ queryKey: chatQueryKeys.metadata() })
        .catch((): undefined => undefined);
    },
  });

  const flushPendingMarks = useCallback(() => {
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    if (!enabled || pendingIdsRef.current.size === 0) {
      return;
    }

    const ids = [...pendingIdsRef.current];
    pendingIdsRef.current = new Set();
    mutate(ids);
  }, [enabled, mutate]);

  const scheduleMarkRead = useCallback(
    (conversationId: string) => {
      if (!enabled || conversationId.length === 0 || conversationId.startsWith("friends-")) {
        return;
      }

      // Honor shouldRespectConversationHasUnreadMessageToMarkAsRead: skip conversations that the
      // cached list already shows as fully read, avoiding a redundant mark-read call.
      if (shouldRespectUnread) {
        const cached = queryClient.getQueryData<InfiniteData<TGetUserConversationsResponse>>(
          chatQueryKeys.conversations(),
        );
        const conversation = cached?.pages
          .flatMap(page => page.conversations)
          .find(candidate => candidate.id === conversationId);
        if (conversation && (conversation.unread_message_count ?? 0) === 0) {
          return;
        }
      }

      pendingIdsRef.current.add(conversationId);

      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        flushPendingMarks();
      }, MARK_READ_DEBOUNCE_MS);
    },
    [enabled, flushPendingMarks, shouldRespectUnread, queryClient],
  );

  useEffect(
    () => () => {
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      pendingIdsRef.current = new Set();
    },
    [],
  );

  return { scheduleMarkRead };
}
