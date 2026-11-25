import {
  DotnetNotificationStreamShell,
  dotnetNotificationStreamHost,
  dotnetNotificationStreamTransport,
  registerNotificationStreamHost,
  registerNotificationStreamTransport,
} from "@rbx/notifications/notificationStreamShell/dotnet";
import {
  clearNotificationUnread,
  getNotificationUnreadCount,
} from "./services/notificationStreamCountService";
import { registerNavCapabilities } from "./util/navCapabilities";

registerNotificationStreamTransport(dotnetNotificationStreamTransport);
registerNotificationStreamHost(dotnetNotificationStreamHost);

registerNavCapabilities({
  getNotificationUnreadCount,
  clearNotificationUnread,
  NotificationStreamShell: DotnetNotificationStreamShell,
});
