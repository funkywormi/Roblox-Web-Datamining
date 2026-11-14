import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getNavCapability } from "../util/navCapabilities";
import { NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY } from "./useUnreadNotificationCount";

/**
 * Returns a handler for the notification stream's open event that clears unread
 * server-side: optimistically zeroes the shared count query, POSTs clear-unread, then
 * reconciles. No-op when the count is already 0.
 */
export const useClearUnreadOnOpen = (unreadCount: number) => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    const clearUnread = getNavCapability("clearNotificationUnread");
    if (unreadCount <= 0 || clearUnread == null) {
      return;
    }
    queryClient.setQueryData(NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY, 0);
    clearUnread()
      .then(() =>
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY }),
      )
      .catch(() => undefined);
  }, [queryClient, unreadCount]);
};
