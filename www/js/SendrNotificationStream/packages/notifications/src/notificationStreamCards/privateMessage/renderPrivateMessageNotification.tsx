import React from "react";
import { render } from "react-dom";
import { NotificationLocalizationProvider } from "../../sendrNotificationStream/context/NotificationsLocalization";
import PrivateMessageNotification from "./PrivateMessageNotification";
import { PrivateMessageNotificationData } from "./types";

// Mirrors renderSendrNotification (the sendr hand-off), for the private-message card.
export const renderPrivateMessageNotification = (entry: Element): void => {
  const notificationDataJSON: string | null = entry.getAttribute("notification-data");

  if (!notificationDataJSON) {
    return;
  }
  if (notificationDataJSON === "{{notification}}") {
    // Notification data has not been populated from angular yet
    window.requestAnimationFrame(() => {
      renderPrivateMessageNotification(entry);
    });
    return;
  }

  const notificationData = JSON.parse(notificationDataJSON) as PrivateMessageNotificationData;

  render(
    <NotificationLocalizationProvider>
      <PrivateMessageNotification notificationData={notificationData} />
    </NotificationLocalizationProvider>,
    entry,
  );
};

export default renderPrivateMessageNotification;
