import * as http from "@rbx/core-scripts/http";
import environmentUrls from "@rbx/environment-urls";
import { withApiMetrics } from "../topNav/observability";

export const getNotificationUnreadCount = (): Promise<number> =>
  withApiMetrics("NotificationUnreadCount", () =>
    http.get<{ unreadNotifications: number }>({
      url: `${environmentUrls.notificationApi}/v2/stream-notifications/unread-count`,
      withCredentials: true,
    }),
  ).then(({ data }) => data.unreadNotifications);

export const clearNotificationUnread = (): Promise<void> =>
  withApiMetrics("NotificationClearUnread", () =>
    http.post(
      {
        url: `${environmentUrls.notificationApi}/v2/stream-notifications/clear-unread`,
        withCredentials: true,
      },
      {},
    ),
  ).then(() => undefined);
