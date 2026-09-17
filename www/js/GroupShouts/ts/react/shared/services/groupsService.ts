import { httpService } from 'core-utilities';
import { Group, GroupMembership, GroupRolePermissions, Role } from '../types';
import groupConstants from '../constants/groupConstants';

interface GroupRolePermissionsResponse {
  data: GroupRolePermissions[];
}

export default {
  getGroupMigrationStatus: async (groupId: number): Promise<string> => {
    const urlConfig = {
      url: groupConstants.urls.getGroupMigrationStatusURL(groupId),
      withCredentials: true
    };

    const response = await httpService.get(urlConfig);
    return (response.data as { status: string }).status;
  },
  getAllGroupRolePermissions: async (groupId: number): Promise<GroupRolePermissions[]> => {
    const urlConfig = {
      url: groupConstants.urls.getAllGroupRolePermissionsURL(groupId),
      withCredentials: true
    };

    const response = await httpService.get<GroupRolePermissionsResponse>(urlConfig);
    return response.data.data.sort((r0, r1) => r1.role.rank - r0.role.rank);
  },
  // Carries `permissions` and `canViewMemberList` as siblings, so one response covers both.
  getGroupMembership: async (groupId: number): Promise<GroupMembership> => {
    const urlConfig = {
      url: groupConstants.urls.getGroupMembershipURL(groupId),
      withCredentials: true
    };

    const response = await httpService.get<GroupMembership>(urlConfig);
    return response.data;
  },
  getGroup: async (groupId: number): Promise<Group> => {
    const urlConfig = {
      url: groupConstants.urls.getGroupURL(groupId),
      withCredentials: true
    };

    const response = await httpService.get<Group>(urlConfig);
    return response.data;
  },
  getGroupRoles: async ({
    groupId,
    includePrivate
  }: {
    groupId: number;
    includePrivate?: boolean;
  }): Promise<Array<Role>> => {
    const urlConfig = {
      url: groupConstants.urls.getGroupRolesURL(groupId, includePrivate),
      withCredentials: true
    };

    const response = await httpService.get(urlConfig);

    return (response.data as { roles: Array<Role> }).roles;
  }
};
