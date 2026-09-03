import type {
  RobloxWebWebAPIModelsApiArrayResponseRobloxGroupsApiGroupMembershipDetailResponse,
  RobloxGroupsApiGroupDetailResponse,
  RobloxGroupsApiGroupAllRolesResponse,
  RobloxGroupsApiGroupRoleResponse,
  RobloxGroupsApiGroupRoleResponseColorEnum as RobloxGroupsApiGroupRoleResponseColorEnumType,
  RobloxGroupsApiModelsRequestUpdateRoleSetRequest,
  RobloxGroupsApiModelsRequestCreateRoleSetRequest,
  RobloxGroupsApiGroupConfigurationDisplayOptionsResponse,
  RobloxGroupsApiUserGroupRoleResponse,
  RobloxWebWebAPIModelsApiPageResponseRobloxGroupsApiUserGroupRoleResponse,
  V1GroupsGroupIdUsersGetRequest,
  RobloxGroupsApiGroupMigrationStatusResponse,
  RobloxGroupsApiGroupMigrationBreakingChangesResponse,
  RobloxGroupsApiPropertiesCommunityProductFeatures,
} from '@rbx/client-groups/v1';
import {
  GroupsApi,
  MembershipApi,
  MigrationApi,
  RobloxGroupsApiGroupRoleResponseColorEnum,
  RoleSetsApi,
} from '@rbx/client-groups/v1';
import type {
  RobloxWebWebAPIModelsApiPageResponseRobloxGroupsApiUserGroupRolesResponse,
  V2GroupsGroupIdUsersGetRequest,
  RobloxGroupsApiUserGroupRolesResponse,
  RobloxGroupsApiUserRoleResponse,
  RobloxGroupsApiModelsRequestUpdateRoleSetPositionRequest,
  RobloxGroupsApiResolvedPermissionsForEntityResponse,
  RobloxGroupsApiRolePermissionsForEntityResponse,
  RobloxWebWebAPIModelsApiPageResponseRobloxGroupsApiModelsResponseResolvedPermissionsForEntityPageItemResponse,
  RobloxGroupsApiModelsRequestUpdateRolePermissionsForEntityRequest,
} from '@rbx/client-groups/v2';
import {
  MembershipV2Api,
  PermissionsV2Api,
  RolesetsV2Api,
  RobloxGroupsApiModelsRequestUpdateRolePermissionsForEntityRequestPermissionsEnum,
} from '@rbx/client-groups/v2';

export { RobloxGroupsApiModelsRequestUpdateRolePermissionsForEntityRequestPermissionsEnum as RolePermissionsForEntityEnum };
import { createClientConfiguration } from './utils';

const configuration = createClientConfiguration('groups', 'bedev1');

const groupApi = new GroupsApi(configuration);
const membershipApi = new MembershipApi(configuration);
const membershipV2Api = new MembershipV2Api(configuration);
const rolesetsApi = new RoleSetsApi(configuration);
const rolesetsV2Api = new RolesetsV2Api(configuration);
const permissionsV2Api = new PermissionsV2Api(configuration);
const migrationApi = new MigrationApi(configuration);

export type CommunityProductFeatures = RobloxGroupsApiPropertiesCommunityProductFeatures;

export type GroupAllRolesResponse = RobloxGroupsApiGroupAllRolesResponse;
export type GroupRoleMetadata = RobloxGroupsApiGroupRoleResponse;
export type GroupRoleColorType = RobloxGroupsApiGroupRoleResponseColorEnumType;
export const GroupRoleColor = RobloxGroupsApiGroupRoleResponseColorEnum;
export type GroupUsersWithRolesResponse =
  RobloxWebWebAPIModelsApiPageResponseRobloxGroupsApiUserGroupRolesResponse;
export type GroupUserWithRoles = RobloxGroupsApiUserGroupRolesResponse;
export type GroupUserRole = RobloxGroupsApiUserRoleResponse;
export type GroupMembersResponse =
  RobloxWebWebAPIModelsApiPageResponseRobloxGroupsApiUserGroupRoleResponse;
export type GroupMember = RobloxGroupsApiUserGroupRoleResponse;
export type ResolvedPermissions = NonNullable<
  RobloxGroupsApiResolvedPermissionsForEntityResponse['permissions']
>;
export type GroupPermissions = ResolvedPermissions;
export type GroupRolePermissions = Record<string, ResolvedPermissions>;
export type GroupRolePermissionsPage =
  RobloxWebWebAPIModelsApiPageResponseRobloxGroupsApiModelsResponseResolvedPermissionsForEntityPageItemResponse;
export type GroupMigrationStatusResponse = RobloxGroupsApiGroupMigrationStatusResponse;
export type GroupMigrationBreakingChangesResponse =
  RobloxGroupsApiGroupMigrationBreakingChangesResponse;

interface GroupsClient {
  getGroupInfo(groupId: number): Promise<RobloxGroupsApiGroupDetailResponse>;
  getGroupRolesSetsInfo(groupId: number): Promise<GroupAllRolesResponse>;
  getGroupMembers(params: V1GroupsGroupIdUsersGetRequest): Promise<GroupMembersResponse>;
  getUsersGroupRoles(
    userId: number,
  ): Promise<RobloxWebWebAPIModelsApiArrayResponseRobloxGroupsApiGroupMembershipDetailResponse>;
  getGroupUsersWithRoles(
    params: V2GroupsGroupIdUsersGetRequest,
  ): Promise<GroupUsersWithRolesResponse>;
  getAuthenticatedUserIsOwner(groupId: number): Promise<boolean>;
  getGroupPermissions(
    groupId: number,
  ): Promise<RobloxGroupsApiResolvedPermissionsForEntityResponse>;
  getGroupRolePermissionsPage(groupId: number): Promise<GroupRolePermissionsPage>;
  createRoleSet(
    groupId: number,
    request: RobloxGroupsApiModelsRequestCreateRoleSetRequest,
  ): Promise<GroupRoleMetadata>;
  deleteRoleSet(groupId: number, rolesetId: number): Promise<void>;
  reorderRoleSet(
    groupId: number,
    roleId: number,
    request: RobloxGroupsApiModelsRequestUpdateRoleSetPositionRequest,
  ): Promise<void>;
  updateRoleSet(
    groupId: number,
    rolesetId: number,
    request: RobloxGroupsApiModelsRequestUpdateRoleSetRequest,
  ): Promise<GroupRoleMetadata>;
  addRoleToUser(groupId: number, roleId: number, userId: number): Promise<void>;
  removeRoleFromUser(groupId: number, roleId: number, userId: number): Promise<void>;
  removeUserFromGroup(groupId: number, userId: number): Promise<void>;
  getConfigurationMetadata(): Promise<RobloxGroupsApiGroupConfigurationDisplayOptionsResponse>;
  getUniverseRolePermissions(
    groupId: number,
    roleId: number,
    universeId: string,
  ): Promise<RobloxGroupsApiRolePermissionsForEntityResponse>;
  updateUniverseRolePermissions(
    groupId: number,
    roleId: number,
    universeId: string,
    request: RobloxGroupsApiModelsRequestUpdateRolePermissionsForEntityRequest,
  ): Promise<RobloxGroupsApiRolePermissionsForEntityResponse>;
  getGroupRolePermissions(
    groupId: number,
    roleId: number,
  ): Promise<RobloxGroupsApiRolePermissionsForEntityResponse>;
  updateGroupRolePermissions(
    groupId: number,
    roleId: number,
    request: RobloxGroupsApiModelsRequestUpdateRolePermissionsForEntityRequest,
  ): Promise<RobloxGroupsApiRolePermissionsForEntityResponse>;
  getGroupMigrationStatus(groupId: number): Promise<RobloxGroupsApiGroupMigrationStatusResponse>;
  getGroupMigrationBreakingChanges(
    groupId: number,
  ): Promise<RobloxGroupsApiGroupMigrationBreakingChangesResponse>;
  migrateGroup(groupId: number): Promise<void>;
  getGroupProductFeatures(groupId: number): Promise<CommunityProductFeatures>;
}

const groupsClient: GroupsClient = {
  getGroupInfo(groupId: number) {
    return groupApi.v1GroupsGroupIdGet({ groupId });
  },
  getGroupRolesSetsInfo(groupId: number) {
    return membershipApi.v1GroupsGroupIdRolesGet({ groupId, includePrivate: true });
  },
  getGroupMembers(params: V1GroupsGroupIdUsersGetRequest) {
    return membershipApi.v1GroupsGroupIdUsersGet(params);
  },
  getUsersGroupRoles(userId: number) {
    return membershipApi.v1UsersUserIdGroupsRolesGet({ userId });
  },
  getGroupUsersWithRoles(params: V2GroupsGroupIdUsersGetRequest) {
    return membershipV2Api.v2GroupsGroupIdUsersGet(params);
  },
  async getAuthenticatedUserIsOwner(groupId: number) {
    const membership = await membershipApi.v1GroupsGroupIdMembershipGet({
      groupId,
      includeNotificationPreferences: false,
    });
    return membership.isOwner === true;
  },
  getGroupPermissions(groupId: number) {
    return permissionsV2Api.v2GroupsGroupIdPermissionsResolvedGet({
      groupId,
    });
  },
  getGroupRolePermissionsPage(groupId: number) {
    return permissionsV2Api.v2GroupsGroupIdEntityTypePermissionsResolvedGet({
      groupId,
      entityType: 'roles',
    });
  },
  async createRoleSet(groupId: number, request: RobloxGroupsApiModelsRequestCreateRoleSetRequest) {
    return rolesetsApi.v1GroupsGroupIdRolesetsCreatePost({
      groupId,
      request,
    });
  },
  async reorderRoleSet(
    groupId: number,
    roleId: number,
    request: RobloxGroupsApiModelsRequestUpdateRoleSetPositionRequest,
  ) {
    await rolesetsV2Api.v2GroupsGroupIdRolesRoleIdPositionPatch({
      groupId,
      roleId,
      request,
    });
  },
  async deleteRoleSet(groupId: number, rolesetId: number) {
    await rolesetsApi.v1GroupsGroupIdRolesetsRolesetIdDelete({
      groupId,
      rolesetId,
    });
  },
  async updateRoleSet(
    groupId: number,
    rolesetId: number,
    request: RobloxGroupsApiModelsRequestUpdateRoleSetRequest,
  ) {
    return rolesetsApi.v1GroupsGroupIdRolesetsRolesetIdPatch({
      groupId,
      rolesetId,
      request,
    });
  },
  async addRoleToUser(groupId: number, roleId: number, userId: number) {
    await membershipApi.v1GroupsGroupIdRolesRoleIdUsersUserIdPut({ groupId, roleId, userId });
  },
  async removeRoleFromUser(groupId: number, roleId: number, userId: number) {
    await membershipApi.v1GroupsGroupIdRolesRoleIdUsersUserIdDelete({ groupId, roleId, userId });
  },
  async removeUserFromGroup(groupId: number, userId: number) {
    await membershipApi.v1GroupsGroupIdUsersUserIdDelete({ groupId, userId });
  },
  getConfigurationMetadata() {
    return groupApi.v1GroupsConfigurationMetadataGet();
  },
  getUniverseRolePermissions(groupId: number, roleId: number, universeId: string) {
    return permissionsV2Api.v2GroupsGroupIdRolesRoleIdPermissionsEntityTypeEntityIdGet({
      groupId,
      roleId,
      entityType: 'universes',
      entityId: universeId,
    });
  },
  updateUniverseRolePermissions(
    groupId: number,
    roleId: number,
    universeId: string,
    request: RobloxGroupsApiModelsRequestUpdateRolePermissionsForEntityRequest,
  ) {
    return permissionsV2Api.v2GroupsGroupIdRolesRoleIdPermissionsEntityTypeEntityIdPatch({
      groupId,
      roleId,
      entityType: 'universes',
      entityId: universeId,
      request,
    });
  },
  getGroupRolePermissions(groupId: number, roleId: number) {
    return permissionsV2Api.v2GroupsGroupIdRolesRoleIdPermissionsEntityTypeEntityIdGet({
      groupId,
      roleId,
      entityType: 'groups',
      entityId: groupId.toString(),
    });
  },
  updateGroupRolePermissions(
    groupId: number,
    roleId: number,
    request: RobloxGroupsApiModelsRequestUpdateRolePermissionsForEntityRequest,
  ) {
    return permissionsV2Api.v2GroupsGroupIdRolesRoleIdPermissionsEntityTypeEntityIdPatch({
      groupId,
      roleId,
      entityType: 'groups',
      entityId: groupId.toString(),
      request,
    });
  },
  getGroupMigrationStatus(groupId: number) {
    return migrationApi.v1GroupsGroupIdMigrationGet({ groupId });
  },
  getGroupMigrationBreakingChanges(groupId: number) {
    return migrationApi.v1GroupsGroupIdMigrationBreakingChangesGet({ groupId });
  },
  migrateGroup(groupId: number) {
    return migrationApi.v1GroupsGroupIdMigrationMigratePost({ groupId });
  },
  getGroupProductFeatures(groupId: number) {
    return groupApi.v1GroupsGroupIdProductFeaturesGet({ groupId });
  },
};

export default groupsClient;
