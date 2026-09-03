import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { useRealTime } from "../leftNav/new/useRealTime";

export const NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY = ["notification-stream-unread-count"];
const QUERY_KEY = NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY;

export const useUnreadNotificationCount = (): number => {
  const queryClient = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () =>
      http
        .get<{ unreadNotifications: number }>({
          url: `${environmentUrls.notificationApi}/v2/stream-notifications/unread-count`,
          withCredentials: true,
        })
        .then(({ data }) => data.unreadNotifications),
    staleTime: Infinity,
  });

  useRealTime({
    event: "NotificationStream",
    queryKey: QUERY_KEY,
    queryClient,
  });

  useEffect(() => {
    const handler = () => {
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    };
    window.addEventListener("Roblox.NotificationStream.StreamClosed", handler);
    return () => {
      window.removeEventListener("Roblox.NotificationStream.StreamClosed", handler);
    };
  }, [queryClient]);

  return unreadCount;
};
