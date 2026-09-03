import { httpService } from 'core-utilities';
import { GroupRole, GroupMember } from '../types';
import groupMembersListConstants from '../constants/groupMembersListConstants';

export interface GetGroupRolesResponse {
  groupId: number;
  roles: GroupRole[];
}

export interface GetRoleMembersResponse {
  previousPageCursor: string | null;
  nextPageCursor: string | null;
  data: GroupMember[];
}

const groupRolesService = {
  getGroupRoles: async (groupId: number): Promise<GetGroupRolesResponse> => {
    const urlConfig = {
      url: groupMembersListConstants.urls.getGroupRolesURL(groupId),
      withCredentials: true
    };

    const response = await httpService.get<GetGroupRolesResponse>(urlConfig);
    return response.data;
  },

  getRoleMembers: async (
    groupId: number,
    roleId: number,
    cursor?: string
  ): Promise<GetRoleMembersResponse> => {
    const params = new URLSearchParams({
      sortOrder: 'Desc',
      limit: groupMembersListConstants.pageCounts.membersPerPage.toString()
    });

    if (cursor) {
      params.append('cursor', cursor);
    }

    const urlConfig = {
      url: `${groupMembersListConstants.urls.getGroupRoleMembersURL(
        groupId,
        roleId
      )}?${params.toString()}`,
      withCredentials: true
    };

    const response = await httpService.get<GetRoleMembersResponse>(urlConfig);
    return response.data;
  }
};

export default groupRolesService;
