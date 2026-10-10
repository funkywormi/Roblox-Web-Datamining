import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Popover as CoreUiPopover } from "@rbx/core-ui";
import { Popover as FoundationPopover, PopoverContent, PopoverTrigger } from "@rbx/foundation-ui";
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
import { useIsTopNavFoundation } from "../util/topNavFoundationIxp";
import { popoverDismissGuard } from "../util/popoverDismissGuard";
import { trackOpenToVisible } from "../topNav/observability";

export default function NotificationStreamPopover() {
  const t = useTranslations("CommonUI.Features");
  const isFoundation = useIsTopNavFoundation();

  const ref = useRef(null);
  const unreadCount = useUnreadNotificationCount();
  const isReactBell = getIsReactNotificationBellEnabled();
  const isReactStream = getIsReactNotificationStreamEnabled();

  // Flag-on only: React owns clear-unread-on-open, since the Angular indicator
  // directive that used to do it isn't bootstrapped when the React bell renders.
  const handleReactBellStreamOpen = useClearUnreadOnOpen(unreadCount);

  // The stream fires this on a reload, as notificationStreamIndicatorDirective.js expects.
  const clearUnreadRef = useRef(handleReactBellStreamOpen);
  clearUnreadRef.current = handleReactBellStreamOpen;
  useEffect(() => {
    if (!isReactBell) {
      return undefined;
    }
    const onClearUnread = () => clearUnreadRef.current();
    document.addEventListener("Roblox.NotificationStream.ClearUnreadNotifications", onClearUnread);
    return () =>
      document.removeEventListener(
        "Roblox.NotificationStream.ClearUnreadNotifications",
        onClearUnread,
      );
  }, [isReactBell]);

  const handleStreamOpen = useCallback(() => {
    trackOpenToVisible("Notifications");
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
      ? t.has("Label.sNotificationsCount")
        ? t("Label.sNotificationsCount", { notificationCount: formattedCount })
        : `Notifications: ${formattedCount}`
      : t.has("Label.sNotifications")
        ? t("Label.sNotifications")
        : "Notifications"; /* TODO: remove fallback once Label.sNotifications is added to CommonUI.Features */

  const handleStreamClose = useCallback(() => {
    window.dispatchEvent(new Event("Roblox.NotificationStream.StreamClosed"));
    sendEventWithTarget(
      events.onExit.name,
      events.onExit.context,
      events.onExit.additionalProperties,
    );
  }, []);

  const trigger = (
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
  );

  const streamContent = isReactStream ? <NotificationStreamShell /> : <NotificationStreamBase />;

  return (
    <li
      id="navbar-stream"
      ref={ref}
      className="navbar-icon-item navbar-stream notification-margins"
    >
      {isFoundation ? (
        <FoundationPopover
          onOpenChange={open => {
            if (open) {
              handleStreamOpen();
            } else {
              handleStreamClose();
            }
          }}
        >
          <PopoverTrigger asChild>{trigger}</PopoverTrigger>
          {/* alignOffset is negative to shift right: with align="end" a positive value moves inward. */}
          <PopoverContent
            side="bottom"
            align="end"
            alignOffset={-108}
            collisionPadding={12}
            ariaLabel={ariaLabel}
            {...popoverDismissGuard(ref)}
          >
            {streamContent}
          </PopoverContent>
        </FoundationPopover>
      ) : (
        <CoreUiPopover
          id="notification-stream-popover"
          trigger="click"
          placement="bottom"
          closeOnClick={false}
          button={trigger}
          container={ref.current}
          onEnter={handleStreamOpen}
          onExit={handleStreamClose}
          role="menu"
        >
          {streamContent}
        </CoreUiPopover>
      )}
    </li>
  );
}
