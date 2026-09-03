import React, { useState } from "react";
import { getRelativeTimeMaxDays } from "../../utils/relativeTime";
import { Notification } from "@rbx/foundation-ui";
import { TestNotificationData } from "./types";

export type TestNotificationProps = {
  notificationData: TestNotificationData;
};

// Debug card: concatenated Detail text + full-date timestamp, no media/actions/i18n.
// Clickable-to-clear (no deep-link): a whole-card click marks read (dot clears) with no
// navigation. React-owned mark-read via local state (Angular never marked it interacted).
export const TestNotification = ({ notificationData }: TestNotificationProps): JSX.Element => {
  const [read, setRead] = useState(false);
  const detail = (notificationData.metadataCollection ?? []).map(m => m.Detail).join("");
  const timestamp = notificationData.eventDate
    ? getRelativeTimeMaxDays(new Date(notificationData.eventDate), new Date())
    : undefined;

  return (
    <Notification
      // Override the navbar <li>'s inherited text-align:center (Navigation.css).
      style={{ textAlign: "left" }}
      // Spacer keeps the title slot filled so foundation right-aligns the timestamp.
      title={<span aria-hidden style={{ display: "block", width: "100%" }} />}
      description={detail}
      timestamp={timestamp}
      hasStatusIndicator={!notificationData.isInteracted && !read}
      onClick={() => setRead(true)}
    />
  );
};

export default TestNotification;
