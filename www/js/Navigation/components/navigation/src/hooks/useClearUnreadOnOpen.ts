import { useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY } from "./useUnreadNotificationCount";

/**
 * Returns a handler for the notification stream's open event that clears unread
 * server-side. The AngularJS indicator directive used to own this (via its jqLite
 * `Roblox.NotificationStream.ClearUnreadNotifications` listener), but that directive
 * isn't bootstrapped once the React bell renders, so React owns the clear.
 *
 * Optimistically zeroes the shared count query, POSTs clear-unread, then reconciles.
 * No-op when the count is already 0 (mirrors the Angular guard). Only wire this on the
 * flag-on path; the Angular flag-off path keeps its own clear-on-open.
 */
export const useClearUnreadOnOpen = (unreadCount: number) => {
  const queryClient = useQueryClient();

  return useCallback(() => {
    if (unreadCount <= 0) {
      return;
    }
    queryClient.setQueryData(NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY, 0);
    http
      .post(
        {
          url: `${environmentUrls.notificationApi}/v2/stream-notifications/clear-unread`,
          withCredentials: true,
        },
        {},
      )
      .then(() =>
        queryClient.invalidateQueries({ queryKey: NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY }),
      )
      .catch(() => undefined);
  }, [queryClient, unreadCount]);
};
