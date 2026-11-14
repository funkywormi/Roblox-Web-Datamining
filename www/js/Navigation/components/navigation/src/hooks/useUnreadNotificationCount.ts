import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getNavCapability, useNavCapability } from "../util/navCapabilities";

export const NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY = ["notification-stream-unread-count"];
const QUERY_KEY = NOTIFICATION_STREAM_UNREAD_COUNT_QUERY_KEY;

export const useUnreadNotificationCountState = (): {
  unreadCount: number;
  ctaFetchedAt: number;
} => {
  const queryClient = useQueryClient();
  const getCount = useNavCapability("getNotificationUnreadCount");
  const closeRefetchRef = useRef(false);
  const fetchSeqRef = useRef(0);
  const lastFetchWasCloseRef = useRef(false);
  const ctaFetchedAtRef = useRef(0);

  const { data: unreadCount = 0, dataUpdatedAt: fetchedAt } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      const isCloseRefetch = closeRefetchRef.current;
      closeRefetchRef.current = false;
      fetchSeqRef.current += 1;
      const seq = fetchSeqRef.current;
      const count = await (getCount?.() ?? Promise.resolve(0));
      if (seq === fetchSeqRef.current) {
        lastFetchWasCloseRef.current = isCloseRefetch;
      }
      return count;
    },
    enabled: getCount != null,
    staleTime: Infinity,
  });

  if (!lastFetchWasCloseRef.current) {
    ctaFetchedAtRef.current = fetchedAt;
  }

  useEffect(() => {
    const subscribe = getNavCapability("subscribeRealTime");
    return subscribe?.("NotificationStream", () =>
      queryClient.invalidateQueries({ queryKey: QUERY_KEY }),
    );
  }, [queryClient]);

  useEffect(() => {
    const handler = () => {
      closeRefetchRef.current = true;
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    };
    window.addEventListener("Roblox.NotificationStream.StreamClosed", handler);
    return () => {
      window.removeEventListener("Roblox.NotificationStream.StreamClosed", handler);
    };
  }, [queryClient]);

  return { unreadCount, ctaFetchedAt: ctaFetchedAtRef.current };
};

export const useUnreadNotificationCount = (): number =>
  useUnreadNotificationCountState().unreadCount;
