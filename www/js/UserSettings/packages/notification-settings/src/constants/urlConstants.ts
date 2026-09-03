import { EnvironmentUrls } from "@rbx/core-scripts/legacy/Roblox";

// graphql
export const accountManagementGraphQLUrl = `${EnvironmentUrls.apiGatewayUrl}/account-management-api/graphql`;

// groupsApi
const groupsApiUrl = EnvironmentUrls.groupsApi;

export const getUserGroupsWithPreferencesUrl = (userId: string): string =>
  `${groupsApiUrl}/v1/users/${userId}/groups/roles?includeNotificationPreferences=true`;

export const getGroupNotificationPreferenceUrl = (groupId: number): string =>
  `${groupsApiUrl}/v1/groups/${groupId}/notification-preference`;

// notificationApi
export const pushEnabledUrl = `${EnvironmentUrls.notificationApi}/v2/push-notifications/get-current-device-destination`;

// community pages
export const getCommunityPageUrl = (groupId: number): string =>
  `${EnvironmentUrls.websiteUrl}/communities/${groupId}`;

// experience / game pages
export const getGamePageUrl = (placeId: number): string =>
  `${EnvironmentUrls.websiteUrl}/games/${placeId}`;

// Experience notification preferences (per-experience list uses followings + games APIs)
export const experiencePreferencesUrl = `${EnvironmentUrls.notificationApi}/v2/notifications/experience-preferences`;
export const groupShoutPreferencesUrl = `${EnvironmentUrls.notificationApi}/v2/notifications/group-shout-preferences`;

export const getGamesByUniverseIdsUrl = (universeIds: readonly number[]): string =>
  `${EnvironmentUrls.gamesApi}/v1/games?universeIds=${universeIds.join(",")}`;

// Help page
export const notificationSettingsHelpUrl = "https://help.roblox.com/hc/articles/39211808036116";

export const getFollowingUniverseUrl = (
  userId: number | string,
  universeId: number | string,
): string => `${EnvironmentUrls.followingsApi}/v1/users/${userId}/universes/${universeId}`;
