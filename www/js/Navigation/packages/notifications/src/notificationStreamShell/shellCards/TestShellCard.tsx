import React from "react";
import { getRelativeTimeMaxDays } from "../../utils/relativeTime";
import { Notification } from "@rbx/foundation-ui";
import { TestNotificationData } from "../../notificationStreamCards/test/types";

export type TestShellCardProps = {
  notificationData: TestNotificationData;
};

export const TestShellCard = ({ notificationData }: TestShellCardProps): JSX.Element => {
  const detail = (notificationData.metadataCollection ?? []).map(m => m.Detail).join("");
  const timestamp = notificationData.eventDate
    ? getRelativeTimeMaxDays(new Date(notificationData.eventDate), new Date())
    : undefined;

  return (
    <Notification
      // Override the navbar <li>'s inherited text-align:center (Navigation.css).
      style={{ textAlign: "left" }}
      // No headline on this card type; foundation collapses the title row only when the prop is falsy,
      // and it is not optional, so absence has to be stated.
      title={undefined}
      description={detail}
      timestamp={timestamp}
      hasStatusIndicator={!notificationData.isInteracted}
    />
  );
};

export default TestShellCard;
