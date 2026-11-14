import {
  DotnetNotificationStreamShell,
  dotnetMuiModalArms,
  dotnetNotificationStreamHost,
  dotnetNotificationStreamTransport,
  registerMuiModalArms,
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
registerMuiModalArms(dotnetMuiModalArms);

registerNavCapabilities({
  getNotificationUnreadCount,
  clearNotificationUnread,
  NotificationStreamShell: DotnetNotificationStreamShell,
});
