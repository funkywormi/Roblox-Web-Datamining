import { httpService } from 'core-utilities';
import { GroupMembership } from '../../shared/types';
import groupAnnouncementsConstants from '../constants/groupAnnouncementsConstants';

export default {
  getGroupMembership: async (groupId: number): Promise<GroupMembership> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getGroupMembershipUrl(groupId),
      withCredentials: true,
      retryable: true
    };

    const params = { includeNotificationPreferences: true };

    const { data } = await httpService.get(urlConfig, params);
    return data as GroupMembership;
  },

  updateGroupNotificationPreference: async (
    groupId: number,
    notificationsEnabled: boolean
  ): Promise<void> => {
    const urlConfig = {
      url: groupAnnouncementsConstants.urls.getGroupNotificationPreferenceUrl(groupId),
      withCredentials: true,
      retryable: true
    };

    const params = { notificationsEnabled };

    await httpService.patch(urlConfig, params);
  }
};
