import { CHANNEL_KEYS } from "./notificationConstants";

/**
 * Single source of truth for notification-settings i18n keys and how they map
 * from API `value` fields (category, notification type, channel).
 *
 * Notification type entries are title keys only; row subtitles use `getEnabledNotificationChannels`
 * in `presentationUtils`. `notificationTypePresentationByApiValue` maps
 * API `notificationType.value` to those label keys.
 */
const translationConstants = {
  // Common actions
  actionSave: "Action.Save",
  actionCancel: "Action.Cancel",
  actionClose: "Action.Close",
  actionConfirm: "Action.Confirm",
  actionEnable: "Action.Enable",

  areYouSureHeading: "Heading.AreYouSure",

  unknownError: "MessageUnknownError",
  savedSuccessfully: "Description.SuccessDialogMessage",

  notificationsHeading: "Heading.Notifications",
  notificationsDescription: "Description.NotificationCategories",
  learnMoreNotificationSettings: "Description.LearnMoreNotificationSettings",

  chooseNotificationTypesDescription: "Description.ChooseNotificationTypes",

  parentDisabledNotificationChannelLabel: "Label.ParentDisabledNotificationChannel",
  parentDisabledDescription: "Description.ParentDisabled",
  channelDisabledDescription: "Label.DisabledChannelNotifications",

  // Push notification upsell prompt
  notificationsDisabledLabel: "Label.PushNotificationsDisabled",
  notificationsDisabledDescription: "Description.PushNotificationsDisabledWarning",

  // ---------------------------------------------------------------------------
  // Top-level categories (Heading / Description)
  // Product order: device notifications → communities → social → experiences → marketplace → platform news
  // ---------------------------------------------------------------------------
  deviceNotificationsHeading: "Heading.DeviceNotifications",
  deviceNotificationsDescription: "Description.DeviceNotifications",
  communitiesHeading: "Heading.Communities",
  communitiesDescription: "Description.Communities",
  socialHeading: "Heading.Social",
  socialDescription: "Description.Social",
  experiencesHeading: "Heading.Experiences",
  experiencesDescription: "Description.GameUpdates",
  marketplaceHeading: "Heading.Marketplace",
  marketplaceDescription: "Description.Marketplace",
  platformNewsHeading: "Heading.PlatformNews",
  platformNewsDescription: "Description.PlatformNews",

  // Device notifications list item + detail page
  deviceNotificationsSettingsDescription: "Description.DeviceNotificationsSettings",

  // Do Not Disturb
  dndHeading: "Heading.DoNotDisturb",
  dndDescription: "Description.DoNotDisturb",
  parentEnforcedDoNotDisturb: "Description.ParentEnforcedDoNotDisturb",
  dndStartLabel: "Label.Start",
  dndEndLabel: "Label.End",
  dndStartTimeModalTitle: "Heading.SetAStartTime",
  dndEndTimeModalTitle: "Heading.SetAnEndTime",
  dndTimeWindowError: "Error.TimeWindowTooShort",
  dndHourLabel: "Label.DoNotDisturb.Hour",
  dndMinuteLabel: "Label.DoNotDisturb.Minute",
  dndAmPmLabel: "Label.DoNotDisturb.AMPM",
  dndAmLabel: "Label.DoNotDisturb.CapitalizedAM",
  dndPmLabel: "Label.DoNotDisturb.CapitalizedPM",

  // ---------------------------------------------------------------------------
  // Notification types — Label only (subtitles = enabled channels, see format util)
  // ---------------------------------------------------------------------------

  //
  // Communities (API category.value: Communities)
  //

  /** Group announcements · API: GroupShout */
  announcementsLabel: "Label.Announcements",

  /** Forum replies · API: GroupForumsCommentReplyCreated */
  forumRepliesLabel: "Label.ForumReplies",

  /** Forum comments · API: GroupForumsCommentCreated */
  forumCommentsLabel: "Label.ForumComments",

  /** Forum post subscriptions · API: GroupForumsSubscriber */
  forumPostSubscriptionsLabel: "Label.ForumPostSubscriptions",

  /** My communities */
  myCommunities: "Label.MyCommunities",
  myCommunitiesDescription: "Description.MyCommunities",
  communitySettingsDescription: "Description.CommunitySettings",
  noCommunities: "Description.NoCommunities",
  errorLoadingCommunities: "Label.ErrorLoadingCommunities",
  parentDisabledCommunityNotifications: "Description.ParentDisabledCommunityNotifications",

  //
  // Social (API category.value: Social)
  //

  /** Friend requests received · API: FriendRequestReceived */
  friendRequestReceivedLabel: "Label.FriendRequestReceived",

  /** Friend requests accepted · API: FriendRequestAccepted */
  friendRequestAcceptedLabel: "Label.FriendRequestAccepted",

  /** Contacts on Roblox · API: MatchedContact */
  contactsOnRobloxLabel: "Label.ContactsOnRoblox",

  /** Party invitations · API: SquadInvitation */
  partyInvitationLabel: "Label.PartyInvitation",

  /** Experience invitations · API: ExperienceInvitation */
  experienceInvitationLabel: "Label.ExperienceInvitation",

  /** Chat messages · API: ChatNewMessage */
  chatMessageLabel: "Label.ChatMessage",

  /** Friend presence · API: FriendPresence */
  friendPresenceLabel: "Label.FriendPresence",

  //
  // Experiences (API category.value: Experiences)
  //

  /** Experience events · API: VirtualEvent */
  experienceEventsLabel: "Label.ExperienceEvents",

  /** Recommended experiences · API: ExperienceRecommendation */
  recommendedExperiencesLabel: "Label.RecommendedExperiences",

  /** My experiences */
  myExperiences: "Label.MyExperiences",
  myExperiencesDescription: "Description.MyExperiences",
  noExperiences: "Description.NoGames",
  errorLoadingExperiences: "Label.ErrorLoadingGames",
  confirmTurnOffExperienceNotificationsBody: "Description.TurnOffExperienceNotifications",
  parentDisabledGameNotifications: "Description.ParentDisabledGameNotifications",

  //
  // Marketplace (API category.value: Marketplace)
  //

  /** Recommended items · API: TODO */
  recommendedItemsLabel: "Label.RecommendedItems",

  /** Recommended offers · API: CampaignOfferAvailable */
  recommendedOffersLabel: "Label.RecommendedOffers",

  //
  // Platform news (API category.value: RobloxPlatform)
  //

  /** Roblox events · API: ZCommunityEvent */
  robloxEventsLabel: "Label.RobloxEvents",

  // News and announcements · API: MarketingEmails
  newsAndAnnouncementsLabel: "Label.NewsAndAnnouncements",

  // ---------------------------------------------------------------------------
  // Channels — delivery surface (API channel.value)
  // ---------------------------------------------------------------------------
  channelMobileLabel: "Label.Mobile",
  channelMobileLowercaseLabel: "Label.MobileLowercase",
  channelMobileDescription: "Description.Mobile",
  channelDesktopLabel: "Label.Desktop",
  channelDesktopLowercaseLabel: "Label.DesktopLowercase",
  channelDesktopDescription: "Description.Desktop",
  channelInAppAlertsLabel: "Label.InAppAlerts",
  channelInAppAlertsLowercaseLabel: "Label.InAppAlertsLowercase",
  channelInAppAlertsDescription: "Description.InAppAlerts",
  notificationCenterLabel: "Label.NotificationCenter",
  notificationCenterLowercaseLabel: "Label.NotificationCenterLowercase",
  notificationCenterDescription: "Description.NotificationCenter",
  channelEmailLabel: "Label.EmailChannel",
  channelEmailLowercaseLabel: "Label.EmailChannelLowercase",
  channelEmailDescription: "Description.EmailChannel",
  off: "Label.OffLowercase",
} as const;

export default translationConstants;

/** Maps NotificationCategory.category.value to translation keys. */
export const notificationCategoryPresentationByApiValue: Record<
  string,
  { titleKey: string; descriptionKey: string }
> = {
  Communities: {
    titleKey: translationConstants.communitiesHeading,
    descriptionKey: translationConstants.communitiesDescription,
  },
  Social: {
    titleKey: translationConstants.socialHeading,
    descriptionKey: translationConstants.socialDescription,
  },
  Experiences: {
    titleKey: translationConstants.experiencesHeading,
    descriptionKey: translationConstants.experiencesDescription,
  },
  Marketplace: {
    titleKey: translationConstants.marketplaceHeading,
    descriptionKey: translationConstants.marketplaceDescription,
  },
  RobloxPlatform: {
    titleKey: translationConstants.platformNewsHeading,
    descriptionKey: translationConstants.platformNewsDescription,
  },
};

/** Maps NotificationType.notificationType.value → list title key (subtitle = enabled channels). */
export const notificationTypePresentationByApiValue: Record<string, { labelKey: string }> = {
  // Communities
  GroupShout: {
    labelKey: translationConstants.announcementsLabel,
  },
  GroupForumsCommentReplyCreated: {
    labelKey: translationConstants.forumRepliesLabel,
  },
  GroupForumsCommentCreated: {
    labelKey: translationConstants.forumCommentsLabel,
  },
  GroupForumsSubscriber: {
    labelKey: translationConstants.forumPostSubscriptionsLabel,
  },
  // Social
  FriendRequestReceived: {
    labelKey: translationConstants.friendRequestReceivedLabel,
  },
  FriendRequestAccepted: {
    labelKey: translationConstants.friendRequestAcceptedLabel,
  },
  MatchedContact: {
    labelKey: translationConstants.contactsOnRobloxLabel,
  },
  SquadInvitation: {
    labelKey: translationConstants.partyInvitationLabel,
  },
  ExperienceInvitation: {
    labelKey: translationConstants.experienceInvitationLabel,
  },
  ChatNewMessage: {
    labelKey: translationConstants.chatMessageLabel,
  },
  FriendPresence: {
    labelKey: translationConstants.friendPresenceLabel,
  },
  // Experiences
  VirtualEvent: {
    labelKey: translationConstants.experienceEventsLabel,
  },
  ExperienceRecommendation: {
    labelKey: translationConstants.recommendedExperiencesLabel,
  },
  // Marketplace
  SpecialItem: {
    labelKey: translationConstants.recommendedItemsLabel,
  },
  CampaignOfferAvailable: {
    labelKey: translationConstants.recommendedOffersLabel,
  },
  // RobloxPlatform (platform news)
  ZCommunityEvent: {
    labelKey: translationConstants.robloxEventsLabel,
  },
  MarketingEmails: {
    labelKey: translationConstants.newsAndAnnouncementsLabel,
  },
};

/** Maps channel.value to translation keys. */
export const channelPresentationByApiValue: Record<
  string,
  { labelKey: string; descriptionKey: string }
> = {
  [CHANNEL_KEYS.push]: {
    labelKey: translationConstants.channelMobileLabel,
    descriptionKey: translationConstants.channelMobileDescription,
  },
  [CHANNEL_KEYS.desktop]: {
    labelKey: translationConstants.channelDesktopLabel,
    descriptionKey: translationConstants.channelDesktopDescription,
  },
  [CHANNEL_KEYS.email]: {
    labelKey: translationConstants.channelEmailLabel,
    descriptionKey: translationConstants.channelEmailDescription,
  },
  [CHANNEL_KEYS.inAppAlerts]: {
    labelKey: translationConstants.channelInAppAlertsLabel,
    descriptionKey: translationConstants.channelInAppAlertsDescription,
  },
  [CHANNEL_KEYS.notificationCenter]: {
    labelKey: translationConstants.notificationCenterLabel,
    descriptionKey: translationConstants.notificationCenterDescription,
  },
  [CHANNEL_KEYS.stream]: {
    labelKey: translationConstants.notificationCenterLabel,
    descriptionKey: translationConstants.notificationCenterDescription,
  },
};

/** Maps channel.value to lowercase label translation keys (for subtitle descriptions). */
export const channelLowercaseLabelByApiValue: Record<string, string> = {
  [CHANNEL_KEYS.push]: translationConstants.channelMobileLowercaseLabel,
  [CHANNEL_KEYS.desktop]: translationConstants.channelDesktopLowercaseLabel,
  [CHANNEL_KEYS.email]: translationConstants.channelEmailLowercaseLabel,
  [CHANNEL_KEYS.inAppAlerts]: translationConstants.channelInAppAlertsLowercaseLabel,
  [CHANNEL_KEYS.notificationCenter]: translationConstants.notificationCenterLowercaseLabel,
  [CHANNEL_KEYS.stream]: translationConstants.notificationCenterLowercaseLabel,
};
