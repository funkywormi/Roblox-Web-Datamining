import { useCallback, useEffect, useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  StreamNotification,
  StreamNotificationPage,
  getRecentUrlConfig,
  PAGE_SIZE,
} from "./notificationStreamApi";
import { useReportQueryError } from "./useReportQueryError";
import { streamGet } from "./streamTransport";
import { sendBundleCreated, sendNotificationRetrieved } from "./notificationStreamEvents";
import { hashStringWithSha256 } from "@rbx/core-scripts/auth/crypto";

export const GET_RECENT_QUERY_KEY = ["notification-stream-get-recent"];

const byEventDateDesc = (a: StreamNotification, b: StreamNotification): number =>
  new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();

// Group Sendr rows that share content.bundleKey into a single "SendrBundle" row
// (the React port of the Angular controller's buildNotificationsList/createSendrBundle).
// The bundle takes the position/id of its newest member; the card router renders a
// collapsible SendrNotificationsBundle when it holds more than one notification.
export const groupSendrBundles = (
  items: StreamNotification[],
  bundleIds: Record<string, string> = {},
): StreamNotification[] => {
  const bundleByKey = new Map<string, StreamNotification>();
  const rows: StreamNotification[] = [];
  items.forEach(notification => {
    const bundleKey =
      notification.notificationSourceType === "Sendr" ? notification.content?.bundleKey : undefined;
    if (!bundleKey) {
      rows.push(notification);
      return;
    }
    let bundle = bundleByKey.get(bundleKey);
    if (!bundle) {
      bundle = {
        id: notification.id,
        notificationSourceType: "SendrBundle",
        eventDate: notification.eventDate,
        bundleKey,
        bundleId: bundleIds[bundleKey] ?? notification.id,
        notifications: [],
      };
      bundleByKey.set(bundleKey, bundle);
      rows.push(bundle);
    }
    bundle.notifications?.push(notification);
  });
  return rows;
};

const isGameUpdate = (notification: StreamNotification): boolean =>
  notification.notificationSourceType === "GameUpdate";

const sendPageBundles = async (
  notifications: StreamNotification[],
): Promise<Record<string, string>> => {
  const bundleIds: Record<string, string> = {};
  await Promise.all(
    groupSendrBundles(notifications.filter(n => !isGameUpdate(n))).map(async row => {
      if (row.notificationSourceType !== "SendrBundle" || row.bundleKey == null) {
        return;
      }
      const members = row.notifications ?? [];
      const memberIds = members.map(member => member.id);
      const bundleId = await hashStringWithSha256(
        `${JSON.stringify(memberIds)}${Date.now()}`,
      ).catch(() => null);
      if (bundleId == null) {
        return;
      }
      bundleIds[row.bundleKey] = bundleId;
      sendBundleCreated(
        row.bundleKey,
        bundleId,
        memberIds,
        members[0]?.content?.clientEventsPayload as Record<string, string> | undefined,
      );
    }),
  );
  return bundleIds;
};

const registerRetrieved = (notifications: StreamNotification[]): StreamNotification[] => {
  notifications.forEach(sendNotificationRetrieved);
  return notifications;
};

const rowCountPage = (
  startIndex: number,
  notifications: StreamNotification[],
): StreamNotificationPage => {
  return {
    notifications,
    // The server filters within the window, so a short page is not the end of the stream.
    nextStartIndex: notifications.length > 0 ? startIndex + PAGE_SIZE : null,
  };
};

const fetchPage = (startIndex: number): Promise<StreamNotificationPage> =>
  streamGet<StreamNotification[]>(getRecentUrlConfig(startIndex)).then(async data => {
    const notifications = registerRetrieved(data ?? []);
    const bundleIds = await sendPageBundles(notifications);
    return { ...rowCountPage(startIndex, notifications), bundleIds };
  });

export const useGetRecentNotifications = (): ReturnType<
  typeof useInfiniteQuery<StreamNotificationPage>
> & {
  notifications: StreamNotification[];
  gameUpdates: StreamNotification[];
  reload: () => Promise<void>;
} => {
  const queryClient = useQueryClient();
  const query = useInfiniteQuery<StreamNotificationPage>({
    queryKey: GET_RECENT_QUERY_KEY,
    queryFn: ({ pageParam = 0 }) => fetchPage(pageParam as number),
    getNextPageParam: lastPage => lastPage.nextStartIndex ?? undefined,
    staleTime: Infinity,
  });
  useReportQueryError("getRecent", query.error, query.errorUpdatedAt);

  const { hasNextPage, fetchNextPage } = query;
  const pageCount = query.data?.pages.length ?? 0;
  const prefetchedRef = useRef(false);
  useEffect(() => {
    if (pageCount === 1 && hasNextPage && !prefetchedRef.current) {
      prefetchedRef.current = true;
      fetchNextPage().catch(() => undefined);
    }
  }, [pageCount, hasNextPage, fetchNextPage]);

  // The shell unmounts on close, so each open starts again from window 0.
  useEffect(
    () => () => {
      queryClient.removeQueries({ queryKey: GET_RECENT_QUERY_KEY });
    },
    [queryClient],
  );

  const reload = useCallback(() => {
    prefetchedRef.current = false;
    return queryClient.resetQueries({ queryKey: GET_RECENT_QUERY_KEY });
  }, [queryClient]);

  const pages = query.data?.pages ?? [];
  const gameUpdates = pages
    .flatMap(page => page.notifications)
    .filter(isGameUpdate)
    .sort(byEventDateDesc);
  // notificationStreamController.js buildNotificationsList bundles each fetched page on its own.
  const notifications = pages
    .flatMap(page =>
      groupSendrBundles(
        page.notifications.filter(n => !isGameUpdate(n)).sort(byEventDateDesc),
        page.bundleIds,
      ),
    )
    .sort(byEventDateDesc);

  return { ...query, notifications, gameUpdates, reload };
};

export default useGetRecentNotifications;
