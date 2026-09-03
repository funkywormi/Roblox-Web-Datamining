import { httpService } from 'core-utilities';
import groupMembershipConstants from '../constants/groupMembershipConstants';
import { GetUsersInGroupResponse, SearchUsersInGroupResponse } from '../types';

const getUsersInGroup = async ({
  groupId,
  roleId,
  userIds,
  cursor,
  includePrivate
}: {
  groupId: number;
  roleId?: number;
  userIds?: Array<number>;
  cursor?: string;
  includePrivate?: boolean;
}): Promise<GetUsersInGroupResponse> => {
  const urlConfig = {
    url: groupMembershipConstants.urls.getUsersInGroup({
      groupId,
      roleId,
      userIds,
      cursor,
      includePrivate
    }),
    withCredentials: true
  };

  const response = await httpService.get(urlConfig);

  return response.data as GetUsersInGroupResponse;
};

const searchUsersInGroup = async (
  groupId: number,
  query: string
): Promise<SearchUsersInGroupResponse> => {
  const urlConfig = {
    url: groupMembershipConstants.urls.searchUsersInGroup(groupId, query),
    withCredentials: true
  };

  const response = await httpService.get(urlConfig);

  return response.data as SearchUsersInGroupResponse;
};

const kickUserFromGroup = async (groupId: number, profileId: number): Promise<void> => {
  const urlConfig = {
    url: groupMembershipConstants.urls.kickUser(groupId, profileId),
    withCredentials: true
  };

  await httpService.delete(urlConfig);
};

const banUserFromGroup = async (groupId: number, profileId: number): Promise<void> => {
  const urlConfig = {
    url: groupMembershipConstants.urls.banUser(groupId, profileId),
    withCredentials: true
  };

  await httpService.post(urlConfig);
};

export default {
  getUsersInGroup,
  searchUsersInGroup,
  kickUserFromGroup,
  banUserFromGroup
};
