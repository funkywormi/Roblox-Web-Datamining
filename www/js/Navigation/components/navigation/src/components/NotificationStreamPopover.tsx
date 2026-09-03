import { useCallback, useRef } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Popover } from "@rbx/core-ui";
import { NotificationStreamShell } from "@rbx/notifications/notificationStreamShell";
import { useUnreadNotificationCount } from "../hooks/useUnreadNotificationCount";
import { useClearUnreadOnOpen } from "../hooks/useClearUnreadOnOpen";
import { getIsReactNotificationBellEnabled } from "../util/getIsReactNotificationBellEnabled";
import { getIsReactNotificationStreamEnabled } from "../util/getIsReactNotificationStreamEnabled";
import { logNotificationStreamExposureIfEnabled } from "../util/notificationStreamIxpUtil";
import NotificationStreamIcon from "../containers/NotificationStreamIcon";
import ReactNotificationBell from "./ReactNotificationBell";
import NotificationStreamBase from "../containers/NotificationStreamBase";
import events from "../constants/notificationsEventStreamConstants";

export default function NotificationStreamPopover() {
  const { translate } = useTranslation();

  const ref = useRef(null);
  const unreadCount = useUnreadNotificationCount();
  const isReactBell = getIsReactNotificationBellEnabled();
  const isReactStream = getIsReactNotificationStreamEnabled();

  // Flag-on only: React owns clear-unread-on-open, since the Angular indicator
  // directive that used to do it isn't bootstrapped when the React bell renders.
  const handleReactBellStreamOpen = useClearUnreadOnOpen(unreadCount);

  const handleStreamOpen = useCallback(() => {
    logNotificationStreamExposureIfEnabled();
    sendEventWithTarget(events.openContent.name, events.openContent.context, {
      countOfUnreadNotification: unreadCount,
      sendrVersion: 0,
    });
    if (isReactBell) {
      handleReactBellStreamOpen();
    }
  }, [isReactBell, handleReactBellStreamOpen, unreadCount]);

  const formattedCount = formatNumber(unreadCount);
  const ariaLabel =
    unreadCount > 0
      ? translate("Label.sNotificationsCount", {
          notificationCount: formattedCount,
        }) || `Notifications: ${formattedCount}`
      : translate("Label.sNotifications") ||
        "Notifications"; /* TODO: remove fallback once Label.sNotifications is added to CommonUI.Features */

  return (
    <li
      id="navbar-stream"
      ref={ref}
      className="navbar-icon-item navbar-stream notification-margins"
    >
      <Popover
        id="notification-stream-popover"
        trigger="click"
        placement="bottom"
        closeOnClick={false}
        button={
          <button
            type="button"
            className="btn-uiblox-common-common-notification-bell-md"
            aria-label={ariaLabel}
            aria-haspopup="true"
          >
            {isReactBell ? (
              <ReactNotificationBell unreadCount={unreadCount} />
            ) : (
              <NotificationStreamIcon />
            )}
          </button>
        }
        container={ref.current}
        onEnter={handleStreamOpen}
        onExit={() => {
          window.dispatchEvent(new Event("Roblox.NotificationStream.StreamClosed"));
          sendEventWithTarget(
            events.onExit.name,
            events.onExit.context,
            events.onExit.additionalProperties,
          );
        }}
        role="menu"
      >
        {isReactStream ? <NotificationStreamShell /> : <NotificationStreamBase />}
      </Popover>
    </li>
  );
}
