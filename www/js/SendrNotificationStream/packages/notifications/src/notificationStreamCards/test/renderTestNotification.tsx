import React from "react";
import { render } from "react-dom";
import TestNotification from "./TestNotification";
import { TestNotificationData } from "./types";

// Self-contained (like group/PM): read the serialized notification off the attribute,
// wait out the pre-interpolation `{{notification}}` placeholder, parse + render. No
// localization provider (the test card has no i18n).
export const renderTestNotification = (entry: Element): void => {
  const notificationDataJSON: string | null = entry.getAttribute("notification-data");

  if (!notificationDataJSON) {
    return;
  }
  if (notificationDataJSON === "{{notification}}") {
    // Notification data has not been populated from angular yet
    window.requestAnimationFrame(() => {
      renderTestNotification(entry);
    });
    return;
  }

  const notificationData = JSON.parse(notificationDataJSON) as TestNotificationData;

  render(<TestNotification notificationData={notificationData} />, entry);
};

export default renderTestNotification;
