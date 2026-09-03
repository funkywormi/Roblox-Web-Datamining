type GroupKeyTuple = [key: string, groupId: number];
type MemberSearchKeyTuple = [key: string, groupId: number, search: string];

export default {
  getAllGroupRolePermissionsKey: (groupId: number): GroupKeyTuple => [
    'getAllGroupRolePermissions',
    groupId
  ],
  getMemberSearchKey: (groupId: number, search: string): MemberSearchKeyTuple => [
    'memberSearch',
    groupId,
    search
  ],
  // Same tuple as groupShouts/utils/queryKeys, so both features share the cache entry.
  getGroupMembershipKey: (groupId: number): GroupKeyTuple => ['getGroupMembership', groupId],
  getGroupRolesKey: (groupId: number): GroupKeyTuple => ['getGroupRoles', groupId]
};
