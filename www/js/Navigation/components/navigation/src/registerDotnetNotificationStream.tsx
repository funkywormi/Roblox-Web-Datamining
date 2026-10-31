import { NotificationStreamShell } from "@rbx/notifications/notificationStreamShell";
import NotificationStreamBase from "./containers/NotificationStreamBase";
import NotificationStreamIcon from "./containers/NotificationStreamIcon";
import {
  clearNotificationUnread,
  getNotificationUnreadCount,
} from "./services/notificationStreamCountService";
import { getIsReactNotificationBellEnabled } from "./util/getIsReactNotificationBellEnabled";
import { getIsReactNotificationStreamEnabled } from "./util/getIsReactNotificationStreamEnabled";
import { logNotificationStreamExposureIfEnabled } from "./util/notificationStreamIxpUtil";
import { registerNavCapabilities } from "./util/navCapabilities";

registerNavCapabilities({
  getIsReactNotificationBellEnabled,
  getIsReactNotificationStreamEnabled,
  logNotificationStreamExposure: logNotificationStreamExposureIfEnabled,
  getNotificationUnreadCount,
  clearNotificationUnread,
  NotificationStreamIcon,
  NotificationStreamBase,
  NotificationStreamShell,
});
