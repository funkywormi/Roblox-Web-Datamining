export enum PreferenceStatus {
  All = 'All',
  Best = 'Personalized',
  None = 'None'
}

export enum NotificationChannel {
  Push = 'Push',
  Stream = 'Stream',
  Invalid = 'Invalid'
}

export enum CommunityNotificationPreferenceType {
  Announcements = 'AnnouncementCreatedNotification',
  Comments = 'ForumCommentCreatedNotification',
  Replies = 'ForumCommentReplyCreatedNotification'
}

export type ChannelSetting = {
  notificationChannel: NotificationChannel;
  preferenceStatus: PreferenceStatus;
  // Can the user change this setting or is it disabled?
  isOverridable: boolean;
  // Has the user changed this setting or is it the default?
  isSetByReceiver: boolean;
  enableUserSettingsUpdateEndpointCutover?: boolean;
  enableUserSettingsDualWrite?: boolean;
};

export type NotificationSettings = {
  notificationTypeName: string;
  localizedNotificationTypeName: string;
  localizedNotificationTypeDescriptor: string;
  notificationChannelPreferences: Array<ChannelSetting>;
  enableUserSettingsUpdateEndpointCutover?: boolean;
  enableUserSettingsDualWrite?: boolean;
  auditDataHeader?: string;
  userSettingsName?: string;
};

export type NotificationDndSettings = {
  notificationDndTitleName: string;
  notificationDndDescription: string;
  isNotificationDndSettingEnabled: boolean;
  notificationDndStartTimeMinutes: number;
  notificationDndEndTimeMinutes: number;
  isDndParentalControlEnabled: boolean;
  userSettingsName?: string;
};

export type NotificationChannelAggregateSettings = {
  isChannelAggregateSettingEnabled: boolean;
  localizedChannelAggregateSettingName: string;
  localizedChannelAggregateSettingDescription: string;
  isParentalControlEnabled: boolean;
  userSettingsName?: string;
};

export type GroupSettings = {
  localizedGroupName: string;
  groupName: string;
  groupIcon?: string;
  localizedGroupDescription?: string;
  notificationTypePreferences?: Array<NotificationSettings>;
  notificationsEnabledExperiences?: Array<number>;
  notificationsEnabledGroups?: Array<number>;
  restrictedAccess?: boolean;
  parentalControlsEnabled?: boolean;
  parentalControlsMessage?: string;
  notificationDndPreferences?: NotificationDndSettings;
  notificationChannelAggregateSettings?: NotificationChannelAggregateSettings;
};

export type UpdatePreferenceStatusCallback = (
  notificationType: string,
  notificationChannel: NotificationChannel,
  preferenceStatus: PreferenceStatus
) => void;

export type ExperiencePreferenceData = {
  experienceName: string;
  truncatedExperienceName: string;
  experienceCreator: string;
  id: number;
  enabled?: boolean;
};

export type GroupNotificationPreferenceData = {
  type: CommunityNotificationPreferenceType;
  name: string;
  description: string;
  enabled: boolean;
};

export type GroupShoutPreferenceData = {
  groupId: number;
  groupName: string;
  truncatedGroupName: string;
  creatorName: string;
  notificationPreferences: Array<GroupNotificationPreferenceData>;
};

export type PreferenceChangeRequest = {
  notificationType: string;
  notificationChannel: NotificationChannel;
  preferenceStatus: PreferenceStatus;
};

export type UpdateUserPreferencesRequest = {
  updatedPreferences: Array<PreferenceChangeRequest>;
};

export type GetGroupedUserPreferencesResponse = {
  notificationPreferences: Array<GroupSettings>;
};

export type GetExperiencePreferencesResponse = {
  experiencePreferences: GroupSettings;
};

export type GetGroupShoutPreferencesResponse = {
  groupShoutPreferences: GroupSettings;
};

export type GetExperienceDetailsRequest = {
  universeIds: Array<string>;
};

export type GetExperienceDetailsResponse = {
  data: Array<{
    id: number;
    name: string;
    creator: {
      name: string;
    };
  }>;
};

export type GetGroupShoutPreferenceDetailsRequest = {
  groupIds: Array<string>;
};

export type GetGroupShoutPreferenceDetailsResponse = {
  data: Array<{
    group: {
      description: string;
      id: number;
      name: string;
      owner: {
        displayName: string;
        username: string;
      };
    };
    notificationPreferences: Array<GroupNotificationPreferenceData>;
  }>;
};

export type PushDestination = {
  name: string;
};

export type GetPushEnabledResponse = {
  destination: PushDestination;
};

export type GetPushNotificationUpsellResponse = {
  displayPushNotificationUpsell: boolean | undefined;
};
