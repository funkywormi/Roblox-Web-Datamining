import { EnvironmentUrls } from 'Roblox';

const { groupsApi, domain } = EnvironmentUrls;

export default {
  urls: {
    getAllGroupRolePermissionsURL: (groupId: number) =>
      `${groupsApi}/v1/groups/${groupId}/roles/permissions`,
    getGroupRoleURL: (groupId: number, roleId: number) =>
      `${groupsApi}/v1/groups/${groupId}/rolesets/${roleId}`,
    getGroupRoleCreationURL: (groupId: number) =>
      `${groupsApi}/v1/groups/${groupId}/rolesets/create`,
    getGroupRolePermissionsURL: (groupId: number, roleId: number) =>
      `${groupsApi}/v1/groups/${groupId}/roles/${roleId}/permissions`,
    getCreatorHubGroupRolesUrl: (groupId: number) =>
      `https://create.${domain}/dashboard/group/roles?groupId=${groupId}&activeTab=GroupRolesTab`,
    getGroupMigrationStatusURL: (groupId: number) => `${groupsApi}/v1/groups/${groupId}/migration`
  }
};
