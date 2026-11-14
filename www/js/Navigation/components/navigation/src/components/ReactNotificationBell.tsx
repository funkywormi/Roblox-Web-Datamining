import { useEffect, useRef } from "react";
import { sendEventWithTarget } from "@rbx/core-scripts/event-stream";
import events from "../constants/notificationsEventStreamConstants";
import NavIcon from "./NavIcon";

const UNREAD_ABBREVIATION_THRESHOLD = 100;
const abbreviateUnreadCount = (count: number): string =>
  count >= UNREAD_ABBREVIATION_THRESHOLD ? "99+" : String(count);

type ReactNotificationBellProps = {
  unreadCount?: number;
  countFetchedAt?: number;
};

export default function ReactNotificationBell({
  unreadCount = 0,
  countFetchedAt = 0,
}: ReactNotificationBellProps) {
  const unreadCountRef = useRef(unreadCount);
  unreadCountRef.current = unreadCount;

  useEffect(() => {
    if (countFetchedAt > 0 && unreadCountRef.current > 0) {
      sendEventWithTarget(events.openCTA.name, events.openCTA.context, {
        count: unreadCountRef.current,
        sendrVersion: 0,
      });
    }
  }, [countFetchedAt]);

  useEffect(() => {
    // TODO: remove; one-time unregister of the retired desktop push SW, 2024 cleanup window passed.
    if (!("serviceWorker" in navigator)) {
      return;
    }
    navigator.serviceWorker
      .getRegistrations()
      .then(registrations => {
        registrations.forEach(registration => {
          const scriptUrl = registration.active?.scriptURL;
          if (!scriptUrl) {
            return;
          }
          if (new URL(scriptUrl).pathname === "/service-workers/push-notifications") {
            registration.unregister().catch(() => undefined);
          }
        });
      })
      .catch(() => undefined);
  }, []);

  return (
    <span className="nav-robux-icon rbx-menu-item">
      <div className="notification-stream-indicator">
        <span id="nav-ns-icon" className="rbx-menu-item notification-stream-icon">
          <NavIcon name="icon-regular-bell" size="XLarge" id="common-notification-bell" />
          {unreadCount > 0 && (
            <span
              className="notification-red notification bell-red-badge"
              id="notifications-bell-badge"
            >
              {abbreviateUnreadCount(unreadCount)}
            </span>
          )}
        </span>
      </div>
    </span>
  );
}
