import { httpService } from 'core-utilities';
import groupMembersConstants from '../constants/groupMembersConstants';
import { GroupBan, GetBannedUsersResponse, GetJoinRequestsResponse, SortOrder } from '../types';
import { GroupJoinRequest } from '../../shared/types';

const assignRoleToUser = async ({
  groupId,
  roleId,
  userId
}: {
  groupId: number;
  roleId: number;
  userId: number;
}): Promise<void> => {
  const urlConfig = {
    url: groupMembersConstants.urls.roleAssignment({
      groupId,
      roleId,
      userId
    }),
    withCredentials: true
  };

  await httpService.put(urlConfig);
};

const unassignRoleFromUser = async ({
  groupId,
  roleId,
  userId
}: {
  groupId: number;
  roleId: number;
  userId: number;
}): Promise<void> => {
  const urlConfig = {
    url: groupMembersConstants.urls.roleAssignment({
      groupId,
      roleId,
      userId
    }),
    withCredentials: true
  };

  await httpService.delete(urlConfig);
};

const getUserBannedFromGroup = async ({
  groupId,
  userId
}: {
  groupId: number;
  userId: number;
}): Promise<GroupBan> => {
  const urlConfig = {
    url: groupMembersConstants.urls.bannedUser({ groupId, userId }),
    withCredentials: true
  };

  const response = await httpService.get(urlConfig);

  return response.data as GroupBan;
};

const getUsersBannedFromGroup = async ({
  groupId,
  cursor
}: {
  groupId: number;
  cursor?: string;
}): Promise<GetBannedUsersResponse> => {
  const urlConfig = {
    url: groupMembersConstants.urls.bannedUsers({ groupId, cursor }),
    withCredentials: true
  };

  const response = await httpService.get(urlConfig);

  return response.data as GetBannedUsersResponse;
};

const unbanUser = async ({
  groupId,
  userId
}: {
  groupId: number;
  userId: number;
}): Promise<void> => {
  const urlConfig = {
    url: groupMembersConstants.urls.bannedUser({ groupId, userId }),
    withCredentials: true
  };

  await httpService.delete(urlConfig);
};

const getJoinRequests = async ({
  groupId,
  cursor,
  sortOrder
}: {
  groupId: number;
  cursor?: string;
  sortOrder?: SortOrder;
}): Promise<GetJoinRequestsResponse> => {
  const urlConfig = {
    url: groupMembersConstants.urls.joinRequests({ groupId, cursor, sortOrder }),
    withCredentials: true
  };

  const response = await httpService.get(urlConfig);

  return response.data as GetJoinRequestsResponse;
};

const getJoinRequest = async ({
  groupId,
  userId
}: {
  groupId: number;
  userId: number;
}): Promise<GroupJoinRequest> => {
  const urlConfig = {
    url: groupMembersConstants.urls.joinRequest({ groupId, userId }),
    withCredentials: true
  };

  const response = await httpService.get(urlConfig);

  return response.data as GroupJoinRequest;
};

const acceptJoinRequest = async ({
  groupId,
  userId
}: {
  groupId: number;
  userId: number;
}): Promise<void> => {
  const urlConfig = {
    url: groupMembersConstants.urls.joinRequest({ groupId, userId }),
    withCredentials: true
  };

  await httpService.post(urlConfig);
};

const declineJoinRequest = async ({
  groupId,
  userId
}: {
  groupId: number;
  userId: number;
}): Promise<void> => {
  const urlConfig = {
    url: groupMembersConstants.urls.joinRequest({ groupId, userId }),
    withCredentials: true
  };

  await httpService.delete(urlConfig);
};

const acceptBatchJoinRequests = async ({
  groupId,
  userIds
}: {
  groupId: number;
  userIds: Array<number>;
}): Promise<void> => {
  const urlConfig = {
    url: groupMembersConstants.urls.batchJoinRequests({ groupId }),
    withCredentials: true
  };

  await httpService.post(urlConfig, { userIds });
};

const declineBatchJoinRequests = async ({
  groupId,
  userIds
}: {
  groupId: number;
  userIds: Array<number>;
}): Promise<void> => {
  const urlConfig = {
    url: groupMembersConstants.urls.batchJoinRequests({ groupId }),
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    data: { userIds }
  };

  await httpService.delete(urlConfig);
};

export default {
  assignRoleToUser,
  unassignRoleFromUser,
  getUserBannedFromGroup,
  getUsersBannedFromGroup,
  unbanUser,
  getJoinRequests,
  getJoinRequest,
  acceptJoinRequest,
  declineJoinRequest,
  acceptBatchJoinRequests,
  declineBatchJoinRequests
};
