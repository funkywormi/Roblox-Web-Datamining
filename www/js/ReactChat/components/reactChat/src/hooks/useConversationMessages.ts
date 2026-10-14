import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { chatQueryKeys } from "../constants/queryKeys";
import { getConversationMessages } from "../services/chatService";
import type { TChatApiMessage, TGetConversationMessagesResponse } from "../types/api";
import type { TChatMessage } from "../types/chat";
import { isHiddenMessage, toChatMessages } from "../utils/chatTransforms";
import { isQueryPending } from "../utils/queryStatus";

// An older page together with the cursor that loaded it, so the page can be loaded again.
type TOlderPage = { cursor: string; page: TGetConversationMessagesResponse };

export type TUseConversationMessagesResult = {
  messages: TChatMessage[];
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isLoading: boolean;
};

// The chat API re-dates standing system notices (e.g. the party-voice reminder) to ~now on every
// fetch. Because the timeline sorts by created_at, a naive re-sort floats the notice below any
// message sent this session, so it visibly jumps to the bottom on each send. The legacy AngularJS
// chat keeps such a notice wherever it first appeared for the whole session and only returns it to
// the bottom on a fresh page load. To match that, freeze each system message's sort timestamp to
// the first value observed this page-load, keyed by conversation + message id. The store is
// module-scoped so it survives a dialog close/reopen (not a page refresh) and resets only on reload.
const frozenSystemMessageTimestamps = new Map<string, string>();

const stabilizeSystemMessageTimestamps = (
  apiMessages: TChatApiMessage[],
  conversationId: string,
): TChatApiMessage[] =>
  apiMessages.map(message => {
    if (message.type !== "system" || message.id == null) {
      return message;
    }
    const key = `${conversationId}::${message.id}`;
    const frozenCreatedAt = frozenSystemMessageTimestamps.get(key);
    if (frozenCreatedAt === undefined) {
      if (message.created_at) {
        frozenSystemMessageTimestamps.set(key, message.created_at);
      }
      return message;
    }
    return { ...message, created_at: frozenCreatedAt };
  });

export const useConversationMessages = (
  conversationId: string | null | undefined,
  initialMessages: TChatMessage[],
  enabled = true,
): TUseConversationMessagesResult => {
  const normalizedConversationId = conversationId ?? "";
  const [olderPages, setOlderPages] = useState<TOlderPage[]>([]);
  const olderPagesRef = useRef(olderPages);
  olderPagesRef.current = olderPages;
  const isFetchingNextPageRef = useRef(false);

  const messagesQuery = useQuery<TGetConversationMessagesResponse, Error>({
    queryKey: chatQueryKeys.conversationMessages(normalizedConversationId),
    queryFn: () => getConversationMessages(normalizedConversationId),
    enabled: enabled && normalizedConversationId.length > 0,
  });

  // The server decides a message's visibility when it is read, so a hidden message can become
  // readable later, for example when the two users become Trusted Friends. The latest page refetches
  // with its query, but older pages load once. Whenever the server answers again for the latest page,
  // load again the older pages that still hold a hidden message, in place, so scrolled-back history
  // stays. dataUpdatedAt marks that answer only if every client-side write to this cache keeps it,
  // which setConversationMessagesCache does.
  const latestPageUpdatedAt = messagesQuery.dataUpdatedAt;
  useEffect(() => {
    const hiddenPageCursors = olderPagesRef.current
      .filter(({ page }) => page.messages.some(isHiddenMessage))
      .map(({ cursor }) => cursor);
    if (hiddenPageCursors.length === 0 || !normalizedConversationId) {
      return undefined;
    }
    let isCurrent = true;
    hiddenPageCursors.forEach(cursor => {
      getConversationMessages(normalizedConversationId, cursor)
        .then(page => {
          if (isCurrent) {
            setOlderPages(currentPages =>
              currentPages.map(entry => (entry.cursor === cursor ? { cursor, page } : entry)),
            );
          }
        })
        .catch(() => undefined);
    });
    return () => {
      isCurrent = false;
    };
  }, [latestPageUpdatedAt, normalizedConversationId]);

  // Client-only moderated messages ("###" placeholders). They live in their own cache key
  // (written by useSendMessage) so message refetches never drop them. enabled: false — this
  // query is a reactive read of that store, never fetched.
  const moderatedMessagesQuery = useQuery<TChatMessage[]>({
    queryKey: chatQueryKeys.moderatedMessages(normalizedConversationId),
    queryFn: () => [],
    enabled: false,
    initialData: [],
  });

  // Client-only failed-to-send messages (written by useSendMessage on error). Same reactive-read
  // pattern as moderated placeholders — refetches never drop them.
  const failedMessagesQuery = useQuery<TChatMessage[]>({
    queryKey: chatQueryKeys.failedMessages(normalizedConversationId),
    queryFn: () => [],
    enabled: false,
    initialData: [],
  });

  const fetchNextPage = useCallback(() => {
    if (isFetchingNextPageRef.current) {
      return;
    }

    const lastPage = olderPages.at(-1)?.page;
    const nextCursor = lastPage?.next_cursor ?? messagesQuery.data?.next_cursor;
    if (!nextCursor || !normalizedConversationId) {
      return;
    }

    isFetchingNextPageRef.current = true;
    getConversationMessages(normalizedConversationId, nextCursor)
      .then(page => {
        setOlderPages(currentPages => [...currentPages, { cursor: nextCursor, page }]);
      })
      .catch(() => undefined)
      .finally(() => {
        isFetchingNextPageRef.current = false;
      });
  }, [olderPages, messagesQuery.data?.next_cursor, normalizedConversationId]);

  // initialData: [] guarantees these are always defined arrays.
  const moderatedMessages = moderatedMessagesQuery.data;
  const failedMessages = failedMessagesQuery.data;

  const messages = useMemo(() => {
    const baseMessages = messagesQuery.data
      ? toChatMessages(
          stabilizeSystemMessageTimestamps(
            [...olderPages.flatMap(({ page }) => page.messages), ...messagesQuery.data.messages],
            normalizedConversationId,
          ),
          normalizedConversationId,
        )
      : initialMessages;

    // Insert the client-only placeholders (moderated "###" + failed-to-send) into the server-ordered
    // list at their send time, WITHOUT re-sorting the base messages: a full re-sort disturbs the
    // server ordering (e.g. system messages, or entries with equal/absent timestamps, jump around
    // on the next render). Refetches never return these placeholders.
    const clientOnlyMessages = [...moderatedMessages, ...failedMessages];
    if (clientOnlyMessages.length === 0) {
      return baseMessages;
    }

    const merged = [...baseMessages];
    clientOnlyMessages.forEach(clientMessage => {
      const clientTime = new Date(clientMessage.createdAt ?? 0).getTime();
      const insertIndex = merged.findIndex(
        existing => new Date(existing.createdAt ?? 0).getTime() > clientTime,
      );
      if (insertIndex === -1) {
        merged.push(clientMessage);
      } else {
        merged.splice(insertIndex, 0, clientMessage);
      }
    });
    return merged;
  }, [
    initialMessages,
    messagesQuery.data,
    olderPages,
    normalizedConversationId,
    moderatedMessages,
    failedMessages,
  ]);

  const hasNextPage = Boolean(
    olderPages.at(-1)?.page.next_cursor ?? messagesQuery.data?.next_cursor,
  );

  return {
    messages,
    fetchNextPage,
    hasNextPage,
    isLoading: isQueryPending(messagesQuery),
  };
};
