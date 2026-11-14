import { RefObject, useCallback, useEffect, useRef } from "react";
import { useTranslations } from "@rbx/www-common/i18n";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { getDeviceMeta } from "@rbx/core-scripts/meta/device";
import { formatNumber } from "@rbx/core-scripts/format/number";
import { Popover as FoundationPopover, PopoverContent, PopoverTrigger } from "@rbx/foundation-ui";
import { useUnreadNotificationCountState } from "../hooks/useUnreadNotificationCount";
import { useClearUnreadOnOpen } from "../hooks/useClearUnreadOnOpen";
import ReactNotificationBell from "./ReactNotificationBell";
import events from "../constants/notificationsEventStreamConstants";
import { useNavCapability } from "../util/navCapabilities";
import { popoverDismissGuard } from "../util/popoverDismissGuard";
import { trackOpenToVisible } from "../topNav/observability";

export default function NotificationStreamPopover({
  containerRef,
}: {
  containerRef: RefObject<HTMLLIElement | null>;
}) {
  const t = useTranslations("CommonUI.Features");

  const { unreadCount, ctaFetchedAt } = useUnreadNotificationCountState();
  const StreamContent = useNavCapability("NotificationStreamShell");

  const clearUnreadOnOpen = useClearUnreadOnOpen(unreadCount);

  // The stream shell fires this when its new-notifications banner reloads the list.
  const clearUnreadRef = useRef(clearUnreadOnOpen);
  clearUnreadRef.current = clearUnreadOnOpen;
  useEffect(() => {
    const onClearUnread = () => clearUnreadRef.current();
    document.addEventListener("Roblox.NotificationStream.ClearUnreadNotifications", onClearUnread);
    return () =>
      document.removeEventListener(
        "Roblox.NotificationStream.ClearUnreadNotifications",
        onClearUnread,
      );
  }, []);

  const handleStreamOpen = useCallback(() => {
    trackOpenToVisible("Notifications");
    sendEventWithTarget(events.openContent.name, events.openContent.context, {
      userId: authenticatedUser()?.id,
      inApp: getDeviceMeta()?.isInApp ?? false,
      countOfUnreadNotification: unreadCount,
      sendrVersion: 0,
    });
    if (StreamContent != null) {
      clearUnreadOnOpen();
    }
  }, [StreamContent, clearUnreadOnOpen, unreadCount]);

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
      <ReactNotificationBell unreadCount={unreadCount} countFetchedAt={ctaFetchedAt} />
    </button>
  );

  const streamContent = StreamContent ? <StreamContent /> : null;

  return (
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
        {...popoverDismissGuard(containerRef)}
      >
        {streamContent}
      </PopoverContent>
    </FoundationPopover>
  );
}
