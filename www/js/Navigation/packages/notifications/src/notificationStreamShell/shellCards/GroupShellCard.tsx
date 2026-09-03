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
import {
  buildGroupMembershipDescription,
  groupHref,
} from "../../notificationStreamCards/groupMembership/groupMembershipDescription";
import { GroupMembershipNotificationData } from "../../notificationStreamCards/groupMembership/types";

export type GroupShellCardProps = {
  notificationData: GroupMembershipNotificationData;
};

export const GroupShellCard = ({ notificationData }: GroupShellCardProps): JSX.Element => {
  const translate = useNotificationLocalization();
  const firstGroup = notificationData.metadataCollection?.[0];

  const timestamp = notificationData.eventDate
    ? getRelativeTimeMaxDays(new Date(notificationData.eventDate), new Date())
    : undefined;

  const media = firstGroup ? (
    // 48px box; the thumbnail container has no intrinsic size outside the legacy container.
    <a
      href={groupHref(firstGroup.AccepterGroupId)}
      onClick={e => e.stopPropagation()}
      style={{
        position: "relative",
        display: "block",
        width: 48,
        height: 48,
        flexShrink: 0,
        borderRadius: 8,
        overflow: "hidden",
      }}
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
      // No headline on this card type; foundation collapses the title row only when the prop is falsy,
      // and it is not optional, so absence has to be stated.
      title={undefined}
      description={buildGroupMembershipDescription(translate, notificationData)}
      timestamp={timestamp}
      hasStatusIndicator={!notificationData.isInteracted}
    />
  );
};

export default GroupShellCard;
