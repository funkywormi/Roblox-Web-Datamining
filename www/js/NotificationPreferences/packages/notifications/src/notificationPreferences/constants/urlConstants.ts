import { EnvironmentUrls } from 'Roblox';

export default {
  notificationPreferencesUrl: {
    url: `${EnvironmentUrls.notificationApi}/v2/notifications/notification-preferences`,
    retryable: true,
    withCredentials: true
  },
  groupedNotificationPreferences: {
    url: `${EnvironmentUrls.notificationApi}/v2/notifications/grouped-notification-preferences`,
    retryable: true,
    withCredentials: true
  },
  experiencePreferencesUrl: {
    url: `${EnvironmentUrls.notificationApi}/v2/notifications/experience-preferences`,
    retryable: true,
    withCredentials: true
  },
  gameDetailsUrl: {
    url: `${EnvironmentUrls.gamesApi}/v1/games`,
    retryable: true,
    withCredentials: true
  },
  pushEnabledUrl: {
    url: `${EnvironmentUrls.notificationApi}/v2/push-notifications/get-current-device-destination`,
    retryable: true,
    withCredentials: true
  },
  followingsUrl: (userId: string, universeId: string) => ({
    url: `${EnvironmentUrls.followingsApi}/v1/users/${userId}/universes/${universeId}`,
    retryable: false,
    withCredentials: true
  }),
  groupShoutPreferencesUrl: {
    url: `${EnvironmentUrls.notificationApi}/v2/notifications/group-shout-preferences`,
    retryable: true,
    withCredentials: true
  },
  updateGroupShoutNotificationPreferencesUrl: (groupId: string) => ({
    url: `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/notification-preference`,
    retryable: true,
    withCredentials: true
  }),
  getGroupShoutNotificationGroupsUrl: (userId: string) => ({
    url: `${EnvironmentUrls.groupsApi}/v1/users/${userId}/groups/roles?includeNotificationPreferences=true`,
    retryable: true,
    withCredentials: true
  }),
  updateUserSetting: {
    url: `${EnvironmentUrls.userSettingsApi}/v1/user-settings`,
    retryable: true,
    withCredentials: true
  },
  updateUserSettingV2: {
    url: `${EnvironmentUrls.userSettingsApi}/v2/user-settings`,
    retryable: true,
    withCredentials: true
  }
};
