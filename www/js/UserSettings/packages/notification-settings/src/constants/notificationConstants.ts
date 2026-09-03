import type { CommunityNotificationPreferenceType } from "../services/groupsService";

/**
 * Category keys that match the GraphQL api values.
 * If backend changes the values, we need to update this constant.
 */
export const CATEGORY_KEYS = {
  communities: "Communities",
  experiences: "Experiences",
} as const;

/**
 * Channel API values. If backend changes the values, we need to update this
 * constant.
 */
export const CHANNEL_KEYS = {
  push: "Push",
  desktop: "Desktop",
  email: "Email",
  inAppAlerts: "InAppAlerts",
  notificationCenter: "NotificationCenter",
  stream: "Stream",
} as const;

/** Maps community preference types to their parent GraphQL notification type values. */
export const COMMUNITY_PREF_TO_NOTIFICATION_TYPE: Record<
  CommunityNotificationPreferenceType,
  string
> = {
  AnnouncementCreatedNotification: "GroupShout",
  ForumCommentCreatedNotification: "GroupForumsCommentCreated",
  ForumCommentReplyCreatedNotification: "GroupForumsCommentReplyCreated",
};
