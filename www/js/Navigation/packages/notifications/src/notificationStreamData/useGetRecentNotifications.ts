import { useEffect, useRef } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { httpService } from "core-utilities";
import { StreamNotification, getRecentUrlConfig, PAGE_SIZE } from "./notificationStreamApi";
import { reportNotificationStreamError } from "./notificationStreamObservability";
import { sendBundleCreated, sendNotificationRetrieved } from "./notificationStreamEvents";

export const GET_RECENT_QUERY_KEY = ["notification-stream-get-recent"];

const byEventDateDesc = (a: StreamNotification, b: StreamNotification): number =>
  new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime();

// Group Sendr rows that share content.bundleKey into a single "SendrBundle" row
// (the React port of the Angular controller's buildNotificationsList/createSendrBundle).
// The bundle takes the position/id of its newest member; the card router renders a
// collapsible SendrNotificationsBundle when it holds more than one notification.
const loggedBundleSignatures = new Set<string>();

export const groupSendrBundles = (items: StreamNotification[]): StreamNotification[] => {
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
        bundleId: notification.id,
        notifications: [],
      };
      bundleByKey.set(bundleKey, bundle);
      rows.push(bundle);
    }
    bundle.notifications?.push(notification);
  });
  bundleByKey.forEach((bundle, bundleKey) => {
    const members = bundle.notifications ?? [];
    // groupSendrBundles re-runs on every render; log once per bundle membership.
    const signature = `${bundleKey}:${members.map(member => member.id).join(",")}`;
    if (members.length > 1 && !loggedBundleSignatures.has(signature)) {
      loggedBundleSignatures.add(signature);
      sendBundleCreated(
        bundleKey,
        bundle.bundleId ?? bundle.id,
        members.map(member => member.id),
        members[0]?.content?.clientEventsPayload as Record<string, string> | undefined,
      );
    }
  });
  return rows;
};

const fetchPage = (startIndex: number): Promise<StreamNotification[]> =>
  httpService.get<StreamNotification[]>(getRecentUrlConfig(startIndex)).then(({ data }) => {
    const notifications = data ?? [];
    notifications.forEach(sendNotificationRetrieved);
    return notifications;
  });

export const useGetRecentNotifications = (): ReturnType<
  typeof useInfiniteQuery<StreamNotification[]>
> & {
  notifications: StreamNotification[];
  gameUpdates: StreamNotification[];
} => {
  const query = useInfiniteQuery<StreamNotification[]>({
    queryKey: GET_RECENT_QUERY_KEY,
    queryFn: ({ pageParam = 0 }) => fetchPage(pageParam as number),
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length * PAGE_SIZE,
    staleTime: Infinity,
    // The shell unmounts when the popover closes; the global queryClient default is
    // refetchOnMount:false, so without this a reopen would serve the permanently-cached
    // (staleTime:Infinity) first page and miss notifications that arrived while closed.
    refetchOnMount: "always",
    onError: error => reportNotificationStreamError("getRecent", error),
  });

  // Parity: Angular pages eagerly on open rather than on scroll, so its
  // nsNotificationRetrieved covers every row; demand-loading page 0 alone under-reports it.
  // pageCount is the dep that actually changes per page: isFetchingNextPage can resolve
  // between commits and fetchNextPage is a stable ref, so keying on those alone drains once.
  const { hasNextPage, isFetchingNextPage, fetchNextPage, refetch, isFetching } = query;
  const pageCount = query.data?.pages.length ?? 0;
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) {
      // Rejections already reach reportNotificationStreamError via the query's onError.
      fetchNextPage().catch(() => undefined);
    }
  }, [pageCount, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // DELIBERATE DUPLICATE FETCH. Do not "optimise" this away.
  //
  // The Angular stream runs its entire get-recent sequence TWICE for a single bell open, so
  // every notification is fetched twice and logged to nsNotificationRetrieved twice. Measured
  // on production control 2026-08-27 with a 25-notification payload: startIndex 0,20,0,20 and
  // 50 nsNotificationRetrieved events for 25 rows. This is a bug in the Angular stream, and
  // the owning team's call is that the React port matches its behaviour rather than fixes it,
  // because the notification guardrail metrics are defined against these doubled counts; the
  // numbers are being addressed separately. Removing this replay makes React report roughly
  // half of Angular's "stream notifications received" and reads as a regression.
  //
  // refetch() re-requests every page already loaded, and fetchPage logs on each response, so
  // one call reproduces the second pass. Ref-guarded so it happens once, and the shell
  // unmounts when the popover closes, which resets it to once per open.
  const replayedRef = useRef(false);
  useEffect(() => {
    if (pageCount > 0 && !hasNextPage && !isFetching && !replayedRef.current) {
      replayedRef.current = true;
      refetch().catch(() => undefined);
    }
  }, [pageCount, hasNextPage, isFetching, refetch]);

  const all = (query.data?.pages ?? []).flat();
  const gameUpdates = all
    .filter(n => n.notificationSourceType === "GameUpdate")
    .sort(byEventDateDesc);
  const notifications = groupSendrBundles(
    all.filter(n => n.notificationSourceType !== "GameUpdate").sort(byEventDateDesc),
  );

  return { ...query, notifications, gameUpdates };
};

export default useGetRecentNotifications;
