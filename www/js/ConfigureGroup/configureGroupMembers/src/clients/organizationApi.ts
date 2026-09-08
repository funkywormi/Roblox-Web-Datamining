import type {
  Organization as OrganizationResponseModel,
  PermissionsResponseModel,
  RoleMetadata as RoleMetadataModel,
  Invitation as InvitationModel,
  AllInvitationsResponseModel,
  SuccessResponse,
  CreateInvitationRequestModel,
  AllRolesResponseModel,
  CreateOrUpdateRoleRequestModel,
  AllUsersResponseModel,
  UpdateRolePositionRequestModel,
  RoleIdsResponseModel,
  GetPermissionsResponseModel,
  UpdatePermissionsRequestModel,
} from '@rbx/client-organizations-service-api/v1';
import {
  OrganizationApi,
  InvitationApi,
  RoleApi,
  UniversesApi,
  UserApi,
  RoleColorType,
  InvitationStatusType,
} from '@rbx/client-organizations-service-api/v1';
import type { GroupRoleMetadata } from './groups';
import { createClientConfiguration, SecureRedirectMiddleware } from './utils';

const configuration = createClientConfiguration('orgs', 'bedev2', {
  middleware: [new SecureRedirectMiddleware()],
});

const organizationApi = new OrganizationApi(configuration);
const invitationApi = new InvitationApi(configuration);
const roleApi = new RoleApi(configuration);
const universesApi = new UniversesApi(configuration);
const userApi = new UserApi(configuration);

export type Organization = OrganizationResponseModel;
export type OrganizationPermissions = PermissionsResponseModel;
export type RoleMetadata = RoleMetadataModel;
export type Member = {
  userId?: string;
  roles?: Array<GroupRoleMetadata> | null;
};
export type Invitation = InvitationModel;

export { RoleColorType, InvitationStatusType };

const organizationClient = {
  getOrganization: async (groupId: string): Promise<Organization> => {
    return organizationApi.v1OrganizationsGet({
      groupId,
    });
  },
};

const invitationClient = {
  createInvitation: async (
    organizationId: string,
    request: CreateInvitationRequestModel,
  ): Promise<Invitation> => {
    return invitationApi.v1OrganizationsOrganizationIdInvitationsPost({
      organizationId,
      createInvitationRequestModel: request,
    });
  },
  getInvitationsByOrganizationId: async (
    organizationId: string,
    pageToken?: string,
    maxPageSize?: number,
  ): Promise<AllInvitationsResponseModel> => {
    return invitationApi.v1OrganizationsOrganizationIdInvitationsGet({
      organizationId,
      pageToken,
      maxPageSize,
    });
  },
  deleteInvitationById: async (
    organizationId: string,
    invitationId: string,
  ): Promise<SuccessResponse> => {
    return invitationApi.v1OrganizationsOrganizationIdInvitationsInvitationIdDelete({
      organizationId,
      invitationId,
    });
  },
  getRoleIdsByInvitationId: async (
    organizationId: string,
    invitationId: string,
  ): Promise<RoleIdsResponseModel> => {
    return invitationApi.v1OrganizationsOrganizationIdInvitationsInvitationIdRoleIdsGet({
      organizationId,
      invitationId,
    });
  },
};

const roleClient = {
  createRole: async (
    organizationId: string,
    request: CreateOrUpdateRoleRequestModel,
  ): Promise<RoleMetadata> => {
    return roleApi.v1OrganizationsOrganizationIdRolesPost({
      organizationId,
      createOrUpdateRoleRequestModel: request,
    });
  },
  updateRoleMetadata: async (
    organizationId: string,
    roleId: string,
    request: CreateOrUpdateRoleRequestModel,
  ): Promise<RoleMetadata> => {
    return roleApi.v1OrganizationsOrganizationIdRolesRoleIdMetadataPatch({
      organizationId,
      roleId,
      createOrUpdateRoleRequestModel: request,
    });
  },
  updateRolePosition: async (
    organizationId: string,
    roleId: string,
    request: UpdateRolePositionRequestModel,
  ): Promise<SuccessResponse> => {
    return roleApi.v1OrganizationsOrganizationIdRolesRoleIdPositionPatch({
      organizationId,
      roleId,
      updateRolePositionRequestModel: request,
    });
  },
  getRolesByOrganization: async (
    organizationId: string,
    pageToken?: string,
    maxPageSize?: number,
  ): Promise<AllRolesResponseModel> => {
    return roleApi.v1OrganizationsOrganizationIdRolesGet({
      organizationId,
      pageToken,
      maxPageSize,
    });
  },
  getUsersWithRole: async (
    organizationId: string,
    roleId: string,
    pageToken?: string,
    maxPageSize?: number,
    isDefault?: boolean,
  ): Promise<AllUsersResponseModel> => {
    return roleApi.v1OrganizationsOrganizationIdRolesRoleIdUsersGet({
      organizationId,
      roleId,
      pageToken,
      maxPageSize,
      isDefault,
    });
  },
  deleteRole: async (organizationId: string, roleId: string): Promise<SuccessResponse> => {
    return roleApi.v1OrganizationsOrganizationIdRolesRoleIdDelete({
      organizationId,
      roleId,
    });
  },
  getInvitationsWithRole: async (
    organizationId: string,
    roleId: string,
    pageToken?: string,
    maxPageSize?: number,
  ): Promise<AllInvitationsResponseModel> => {
    return roleApi.v1OrganizationsOrganizationIdRolesRoleIdInvitationsGet({
      organizationId,
      roleId,
      pageToken,
      maxPageSize,
    });
  },
  getRolePermissions: async (
    organizationId: string,
    roleId: string,
    isDefault: boolean,
  ): Promise<GetPermissionsResponseModel> => {
    return roleApi.v2OrganizationsOrganizationIdRolesRoleIdPermissionsGet({
      organizationId,
      roleId,
      isDefault,
    });
  },
  updateRolePermissions: async (
    organizationId: string,
    roleId: string,
    isDefault: boolean,
    updatePermissionsRequestModel: UpdatePermissionsRequestModel,
  ): Promise<void> => {
    return roleApi.v2OrganizationsOrganizationIdRolesRoleIdPermissionsPost({
      organizationId,
      roleId,
      isDefault,
      updatePermissionsRequestModel,
    });
  },
};

const universesClient = {
  getRolePermissions: async (
    universeId: string,
    organizationId: string,
    roleId: string,
  ): Promise<GetPermissionsResponseModel> => {
    return universesApi.v2UniversesUniverseIdPermissionsOrganizationsOrganizationIdRolesRoleIdGet({
      universeId,
      organizationId,
      roleId,
    });
  },
  updateRolePermissions: async (
    universeId: string,
    organizationId: string,
    roleId: string,
    updatePermissionsRequestModel: UpdatePermissionsRequestModel,
  ): Promise<void> => {
    return universesApi.v2UniversesUniverseIdPermissionsOrganizationsOrganizationIdRolesRoleIdPost({
      universeId,
      organizationId,
      roleId,
      updatePermissionsRequestModel,
    });
  },
};

const userClient = {
  getUsersByOrganization: async (
    organizationId: string,
    pageToken?: string,
    maxPageSize?: number,
  ): Promise<AllUsersResponseModel> => {
    return userApi.v1OrganizationsOrganizationIdUsersGet({
      organizationId,
      pageToken,
      maxPageSize,
    });
  },
  getUserInvitationByOrganization: async (
    organizationId: string,
    userId: string,
  ): Promise<Invitation> => {
    return userApi.v1OrganizationsOrganizationIdUsersUserIdInvitationsGet({
      organizationId,
      userId,
    });
  },
  getUserRoles: async (
    organizationId: string,
    userId: string,
    pageToken?: string,
    maxPageSize?: number,
  ): Promise<AllRolesResponseModel> => {
    return userApi.v1OrganizationsOrganizationIdUsersUserIdRolesGet({
      organizationId,
      userId,
      pageToken,
      maxPageSize,
    });
  },
  removeUserFromOrganization: async (
    organizationId: string,
    userId: string,
  ): Promise<SuccessResponse> => {
    return userApi.v1OrganizationsOrganizationIdUsersUserIdDelete({
      organizationId,
      userId,
    });
  },
  getUserPermissions: async (
    organizationId: string,
    userId: string,
  ): Promise<PermissionsResponseModel> => {
    return userApi.v1OrganizationsOrganizationIdUsersUserIdPermissionsGet({
      organizationId,
      userId,
    });
  },
  addUserToRole: async (
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<SuccessResponse> => {
    return userApi.v1OrganizationsOrganizationIdUsersUserIdRolesRoleIdPost({
      organizationId,
      userId,
      roleId,
    });
  },
  removeUserFromRole: async (
    organizationId: string,
    userId: string,
    roleId: string,
  ): Promise<SuccessResponse> => {
    return userApi.v1OrganizationsOrganizationIdUsersUserIdRolesRoleIdDelete({
      organizationId,
      userId,
      roleId,
    });
  },
};

const organizationApiClient = {
  organizationClient,
  invitationClient,
  roleClient,
  universesClient,
  userClient,
};

export default organizationApiClient;
