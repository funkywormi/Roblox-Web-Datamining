import { httpService } from 'core-utilities';
import {
  UserData,
  UserResponse,
  GroupMembershipDetailResponse,
  GroupMembershipResponse
} from '../types';
import groupConstants from '../constants/groupConstants';

export default {
  fetchUserInfo: async (userId: number): Promise<UserData[]> => {
    const url = groupConstants.urls.getUsersInfoURL;
    const params = { userIds: [userId] };
    const urlConfig = {
      url,
      withCredentials: false
    };
    const { data } = await httpService.post<UserResponse>(urlConfig, params);
    return data.data;
  },
  getUsersFromUsernames: async ({
    usernames,
    excludeBannedUsers = false
  }: {
    usernames: Array<string>;
    excludeBannedUsers?: boolean;
  }): Promise<Array<UserData>> => {
    const urlConfig = {
      url: groupConstants.urls.getUsersFromUsernamesURL,
      withCredentials: true
    };

    const payload = {
      usernames,
      excludeBannedUsers
    };

    const { data } = await httpService.post<UserResponse>(urlConfig, payload);

    return data.data;
  },
  getUserGroupRoles: async (userId: number): Promise<GroupMembershipDetailResponse[]> => {
    const urlConfig = {
      url: groupConstants.urls.getUserGroupRolesURL(userId),
      withCredentials: true
    };
    const { data } = await httpService.get<GroupMembershipResponse>(urlConfig);
    return data.data;
  }
};
