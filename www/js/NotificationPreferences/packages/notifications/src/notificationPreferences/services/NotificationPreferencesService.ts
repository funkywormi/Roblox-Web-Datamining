import { Guac } from 'Roblox';
import { httpService } from 'core-utilities';
import { eventStreamService } from 'core-roblox-utilities';
import events from '../constants/notificationPreferencesEvents';
import urlConfigs from '../constants/urlConstants';

import {
  UpdateUserPreferencesRequest,
  GetExperienceDetailsRequest,
  GetExperienceDetailsResponse,
  GetPushEnabledResponse,
  GetExperiencePreferencesResponse,
  GetGroupedUserPreferencesResponse,
  GetGroupShoutPreferencesResponse,
  GetGroupShoutPreferenceDetailsResponse,
  GetPushNotificationUpsellResponse,
  CommunityNotificationPreferenceType
} from '../types/NotificationPreferencesTypes';

export const updateUserPreferences = async (
  request: UpdateUserPreferencesRequest
): Promise<number> => {
  const result = await httpService.post(urlConfigs.notificationPreferencesUrl, request);
  return result.status;
};

export const getGroupedUserPreferences = async (): Promise<GetGroupedUserPreferencesResponse | null> => {
  try {
    const result = await httpService.get<GetGroupedUserPreferencesResponse>(
      urlConfigs.groupedNotificationPreferences
    );

    if (result.status !== 200) {
      return null;
    }

    return result.data;
  } catch (error) {
    return null;
  }
};

export const getExperiencePreferences = async (): Promise<GetExperiencePreferencesResponse | null> => {
  try {
    const result = await httpService.get<GetExperiencePreferencesResponse>(
      urlConfigs.experiencePreferencesUrl
    );

    if (result.status !== 200) {
      return null;
    }

    return result.data;
  } catch (error) {
    return null;
  }
};

export const getGroupShoutPreferences = async (): Promise<GetGroupShoutPreferencesResponse | null> => {
  try {
    const result = await httpService.get<GetGroupShoutPreferencesResponse>(
      urlConfigs.groupShoutPreferencesUrl
    );

    if (result.status !== 200) {
      return null;
    }

    return result.data;
  } catch (error) {
    return null;
  }
};

export const getExperienceDetails = async (
  request: GetExperienceDetailsRequest
): Promise<GetExperienceDetailsResponse | null> => {
  try {
    const result = await httpService.get<GetExperienceDetailsResponse>(
      urlConfigs.gameDetailsUrl,
      request
    );
    if (result.status !== 200) {
      return null;
    }
    return result.data;
  } catch (error) {
    return null;
  }
};

export const getGroupShoutDetails = async (
  userId: string
): Promise<GetGroupShoutPreferenceDetailsResponse | null> => {
  try {
    const result = await httpService.get<GetGroupShoutPreferenceDetailsResponse>(
      urlConfigs.getGroupShoutNotificationGroupsUrl(userId),
      {}
    );
    if (result.status !== 200) {
      return null;
    }
    return result.data;
  } catch (error) {
    return null;
  }
};

type StreamEvent = {
  name: string;
  type: string;
  context: string;
  params: {
    [param: string]: string;
  };
};

export const sendNotificationPreferencesEvent = (
  event: StreamEvent,
  field?: string,
  origin?: string
): void => {
  eventStreamService.sendEventWithTarget(event.type, event.context, {
    ...event.params,
    field: field || '',
    origin: origin || events.NotificationPreferencesOrigin
  });
};

export const isPushEnabled = async (): Promise<boolean> => {
  const result = await httpService.get<GetPushEnabledResponse>(urlConfigs.pushEnabledUrl);
  return !!result.data.destination;
};

export const enableExperienceNotifications = async (
  userId: string,
  universeId: string
): Promise<boolean> => {
  try {
    const url = urlConfigs.followingsUrl(userId, universeId);
    const result = await httpService.post(url, {});

    if (result.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const disableExperienceNotifications = async (
  userId: string,
  universeId: string
): Promise<boolean> => {
  try {
    const url = urlConfigs.followingsUrl(userId, universeId);
    const result = await httpService.delete(url, {});

    if (result.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const toggleGroupShoutNotifications = async (
  groupId: string,
  notificationsEnabled: boolean,
  type: CommunityNotificationPreferenceType
): Promise<boolean> => {
  try {
    const url = urlConfigs.updateGroupShoutNotificationPreferencesUrl(groupId);
    const result = await httpService.patch(url, { notificationsEnabled, type });
    if (result.status === 200) {
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const getPushNotificationUpsellEnabled = async (): Promise<boolean> => {
  try {
    const result = await Guac.callBehaviour<GetPushNotificationUpsellResponse>(
      'account-settings-ui'
    );
    return !!result.displayPushNotificationUpsell;
  } catch (error) {
    return false;
  }
};
