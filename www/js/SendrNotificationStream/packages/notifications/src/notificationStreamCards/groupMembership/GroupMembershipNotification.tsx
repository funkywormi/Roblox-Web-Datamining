import React from "react";
import { getRelativeTimeMaxDays } from "../../utils/relativeTime";
import { Notification } from "@rbx/foundation-ui";
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  DefaultThumbnailSize,
} from "roblox-thumbnails";
import { useNotificationLocalization } from "../../sendrNotificationStream/context/NotificationsLocalization";
import { buildGroupMembershipDescription, groupHref } from "./groupMembershipDescription";
import { GroupMembershipNotificationData } from "./types";

export type GroupMembershipNotificationProps = {
  notificationData: GroupMembershipNotificationData;
};

// Presentational: no onClick (Angular keeps the whole-card click + mark-read during the
// hand-off; React-owned mark-read desyncs the <li>, see PHASE_3.md). The unread dot is
// the card's own indicator since the Angular <li> background is covered by the card surface.
export const GroupMembershipNotification = ({
  notificationData,
}: GroupMembershipNotificationProps): JSX.Element => {
  const translate = useNotificationLocalization();
  const firstGroup = notificationData.metadataCollection?.[0];

  const timestamp = notificationData.eventDate
    ? getRelativeTimeMaxDays(new Date(notificationData.eventDate), new Date())
    : undefined;

  // No media on the empty-metadata case, matching groupMembership.html's blank slot.
  const media = firstGroup ? (
    // 48px box; the thumbnail container has no intrinsic size outside the legacy container.
    <a
      href={groupHref(firstGroup.AccepterGroupId)}
      onClick={e => e.stopPropagation()}
      style={{ position: "relative", display: "block", width: 48, height: 48, flexShrink: 0 }}
    >
      <Thumbnail2d
        type={ThumbnailTypes.groupIcon}
        size={DefaultThumbnailSize}
        format={ThumbnailFormat.webp}
        targetId={firstGroup.AccepterGroupId}
        containerClass="notification-icon"
      />
    </a>
  ) : undefined;

  return (
    <Notification
      // Override the navbar <li>'s inherited text-align:center (Navigation.css).
      style={{ textAlign: "left" }}
      media={media}
      // Spacer keeps the title slot filled so foundation right-aligns the timestamp.
      title={<span aria-hidden style={{ display: "block", width: "100%" }} />}
      description={buildGroupMembershipDescription(translate, notificationData)}
      timestamp={timestamp}
      hasStatusIndicator={!notificationData.isInteracted}
    />
  );
};

export default GroupMembershipNotification;
