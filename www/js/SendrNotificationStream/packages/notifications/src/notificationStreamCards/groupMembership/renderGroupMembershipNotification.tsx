import React from "react";
import { render } from "react-dom";
import { NotificationLocalizationProvider } from "../../sendrNotificationStream/context/NotificationsLocalization";
import GroupMembershipNotification from "./GroupMembershipNotification";
import { GroupMembershipNotificationData } from "./types";

// Mirrors renderSendrNotification (the sendr hand-off), for the group card.
export const renderGroupMembershipNotification = (entry: Element): void => {
  const notificationDataJSON: string | null = entry.getAttribute("notification-data");

  if (!notificationDataJSON) {
    return;
  }
  if (notificationDataJSON === "{{notification}}") {
    // Notification data has not been populated from angular yet
    window.requestAnimationFrame(() => {
      renderGroupMembershipNotification(entry);
    });
    return;
  }

  const notificationData = JSON.parse(notificationDataJSON) as GroupMembershipNotificationData;

  render(
    <NotificationLocalizationProvider>
      <GroupMembershipNotification notificationData={notificationData} />
    </NotificationLocalizationProvider>,
    entry,
  );
};

export default renderGroupMembershipNotification;
