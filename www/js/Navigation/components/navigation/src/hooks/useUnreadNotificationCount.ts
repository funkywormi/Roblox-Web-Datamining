import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNavCapability } from "../util/navCapabilities";

export const NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY = ["notification-stream-unread-count"];
const QUERY_KEY = NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY;

export const useUnreadNotificationCount = (): number => {
  const queryClient = useQueryClient();
  const getCount = getNavCapability("getNotificationUnreadCount");

  const { data: unreadCount = 0 } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => getCount?.() ?? Promise.resolve(0),
    enabled: getCount != null,
    staleTime: Infinity,
  });

  useEffect(() => {
    const subscribe = getNavCapability("subscribeRealTime");
    return subscribe?.("NotificationStream", () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    );
  }, [queryClient]);

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
