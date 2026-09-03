import { httpService } from 'core-utilities';
import groupMembershipConstants from '../constants/groupMembershipConstants';
import { GetUsersInGroupResponse } from '../types';

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
  kickUserFromGroup,
  banUserFromGroup
};
