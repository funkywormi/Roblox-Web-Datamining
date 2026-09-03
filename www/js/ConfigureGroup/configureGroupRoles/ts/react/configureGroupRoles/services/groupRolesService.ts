import { httpService } from 'core-utilities';
import { GroupPermissions, Role, RoleColors } from '../../shared/types';
import groupRolesConstants from '../constants/groupRolesConstants';

export type RolePermissionsResponse = {
  groupId: number;
  role: Role;
  permissions: GroupPermissions;
};

export default {
  getAllGroupRolePermissions: async (groupId: number): Promise<RolePermissionsResponse[]> => {
    const urlConfig = {
      url: groupRolesConstants.urls.getAllGroupRolePermissionsURL(groupId),
      withCredentials: true
    };

    const response = await httpService.get(urlConfig);

    return (response.data as { data: Array<RolePermissionsResponse> }).data;
  },
  createGroupRole: async (
    groupId: number,
    payload: { name: string; rank: number; description?: string; usingGroupFunds?: boolean }
  ): Promise<Role> => {
    const urlConfig = {
      url: groupRolesConstants.urls.getGroupRoleCreationURL(groupId),
      withCredentials: true
    };

    const response = await httpService.post(urlConfig, payload);

    return response.data as Role;
  },
  updateGroupRole: async (
    groupId: number,
    roleId: number,
    payload: { name?: string; rank?: number; description?: string; color?: RoleColors }
  ): Promise<void> => {
    const urlConfig = {
      url: groupRolesConstants.urls.getGroupRoleURL(groupId, roleId),
      withCredentials: true
    };

    await httpService.patch(urlConfig, payload);
  },
  deleteGroupRole: async (groupId: number, roleId: number): Promise<void> => {
    const urlConfig = {
      url: groupRolesConstants.urls.getGroupRoleURL(groupId, roleId),
      withCredentials: true
    };

    await httpService.delete(urlConfig);
  },
  getGroupRolePermissions: async (groupId: number, roleId: number): Promise<GroupPermissions> => {
    const urlConfig = {
      url: groupRolesConstants.urls.getGroupRolePermissionsURL(groupId, roleId),
      withCredentials: true
    };

    const response = await httpService.get(urlConfig);

    return (response.data as { permissions: GroupPermissions }).permissions;
  },
  updateGroupRolePermissions: async (
    groupId: number,
    roleId: number,
    permissions: Record<string, boolean>
  ): Promise<void> => {
    const urlConfig = {
      url: groupRolesConstants.urls.getGroupRolePermissionsURL(groupId, roleId),
      withCredentials: true
    };

    const body = {
      permissions
    };

    await httpService.patch(urlConfig, body);
  },
  getGroupMigrationStatus: async (groupId: number): Promise<string> => {
    const urlConfig = {
      url: groupRolesConstants.urls.getGroupMigrationStatusURL(groupId),
      withCredentials: true
    };

    const response = await httpService.get(urlConfig);

    return (response.data as { status: string }).status;
  }
};
