import type { UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import developApiClient from '../../clients/developApi';
import groupsClient, { RolePermissionsForEntityEnum } from '../../clients/groups';
import type { Organization } from '../../clients/organizationApi';
import { toPermissionsMap } from '../utils/permission';
import type {
  CreatorDetails,
  DevelopPermissionsResponse,
  EntityDetails,
  PermissionRequest,
  PermissionResponse,
} from '../utils/types';
import { CreatorTypes, EntityTypes } from '../utils/types';

const CREATOR_PERMISSIONS_KEY_PREFIX = 'creator_permissions_';

export function useGetUniverseLegacyPermissions(universeId: string | undefined) {
  return useQuery({
    enabled: universeId !== undefined && universeId !== '',
    queryKey: [`${CREATOR_PERMISSIONS_KEY_PREFIX}universe`, universeId],
    queryFn: async (): Promise<DevelopPermissionsResponse | undefined> => {
      if (!universeId) {
        return undefined;
      }
      return developApiClient.getUniverseLegacyPermissions(Number(universeId));
    },
  });
}

function getQueryKey(
  creator?: CreatorDetails,
  entity?: EntityDetails,
  organization?: Organization,
) {
  return [
    `${CREATOR_PERMISSIONS_KEY_PREFIX}all`,
    creator?.id ?? '',
    creator?.type ?? '',
    entity?.id ?? '',
    entity?.type ?? '',
    organization?.id ?? '',
  ];
}

async function getUniversePermissionsWithInheritance(
  universeId: string,
  groupId: string,
  roleId: string,
): Promise<Record<string, PermissionResponse>> {
  const result = await groupsClient.getUniverseRolePermissions(
    Number(groupId),
    Number(roleId),
    universeId,
  );

  if (!result.permissions) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(result.permissions).map(([permissionId, permission]) => [
      permissionId,
      {
        isGranted: permission.isGranted ?? false,
        canEdit: permission.canEdit ?? false,
        isInherited: permission.isGrantedByParentScope ?? false,
      } satisfies PermissionResponse,
    ]),
  );
}

const GUEST_ROLE_EDITABLE_PERMISSION = 'Group.AnnouncementViewer';

async function fetchGroupPermissions(
  creator: CreatorDetails,
  entity: EntityDetails,
  organization?: Organization,
): Promise<Record<string, PermissionResponse>> {
  if (
    creator.type === CreatorTypes.ROLE ||
    creator.type === CreatorTypes.MEMBER_ROLE ||
    creator.type === CreatorTypes.GUEST_ROLE
  ) {
    if (!organization) {
      return {};
    }
    const result = await groupsClient.getGroupRolePermissions(
      Number(organization.groupId),
      Number(creator.id),
    );

    if (!result.permissions) {
      return {};
    }

    const isGuestRole = creator.type === CreatorTypes.GUEST_ROLE;

    return Object.fromEntries(
      Object.entries(result.permissions).map(([permissionId, permission]) => [
        permissionId,
        {
          isGranted: permission.isGranted ?? false,
          canEdit: isGuestRole
            ? permissionId === GUEST_ROLE_EDITABLE_PERMISSION
            : (permission.canEdit ?? false),
          isInherited: permission.isGrantedByParentScope ?? false,
        } satisfies PermissionResponse,
      ]),
    );
  }
  throw new Error(`Creator type ${creator.type} not supported for entity type ${entity.type}`);
}

async function fetchUniversePermissions(
  creator: CreatorDetails,
  entity: EntityDetails,
  organization?: Organization,
): Promise<Record<string, PermissionResponse>> {
  if (creator.type === CreatorTypes.ROLE) {
    if (!organization) {
      return {};
    }
    return getUniversePermissionsWithInheritance(entity.id, organization.groupId, creator.id);
  }
  if (creator.type === CreatorTypes.LEGACY_ROLE) {
    const result = await developApiClient.getUniverseLegacyPermissions(Number(entity.id));
    return toPermissionsMap(
      result.data?.filter((permission) => permission.rolesetId === creator.id && permission.action),
    );
  }
  if (creator.type === CreatorTypes.USER) {
    const result = await developApiClient.getUniverseLegacyPermissions(Number(entity.id));
    return toPermissionsMap(
      result.data?.filter((permission) => permission.userId === creator.id && permission.action),
    );
  }
  throw new Error(`Creator type ${creator.type} not supported for entity type ${entity.type}`);
}

export function useGetAllPermissions(
  creator?: CreatorDetails,
  entity?: EntityDetails,
  organization?: Organization,
): UseQueryResult<Record<string, PermissionResponse> | null> {
  return useQuery({
    queryKey: getQueryKey(creator, entity, organization),
    enabled: !!(creator && entity && (entity.owner?.type === CreatorTypes.USER || organization)),
    async queryFn() {
      if (!creator || !entity) {
        throw new Error('Missing required parameters');
      }
      if (entity.type === EntityTypes.GROUP) {
        return fetchGroupPermissions(creator, entity, organization);
      }
      if (entity.type === EntityTypes.UNIVERSE) {
        return fetchUniversePermissions(creator, entity, organization);
      }
      throw new Error(`Entity type ${String(entity.type)} not supported`);
    },
  });
}

export type UpdateAllPermissionsVariables = {
  creator?: CreatorDetails;
  entity?: EntityDetails;
  organization?: Organization;
  updatedPermissions: Record<string, PermissionRequest>;
};

async function performUpdateAllPermissions({
  creator,
  entity,
  organization,
  updatedPermissions,
}: UpdateAllPermissionsVariables): Promise<void> {
  if (!creator || !entity || !organization) {
    throw new Error('Creator, entity, or organization not provided');
  }
  if (entity.type === EntityTypes.GROUP) {
    if (
      creator.type === CreatorTypes.ROLE ||
      creator.type === CreatorTypes.MEMBER_ROLE ||
      creator.type === CreatorTypes.GUEST_ROLE
    ) {
      const permissions = Object.fromEntries(
        Object.entries(updatedPermissions).map(([key, { isGranted }]) => [
          key,
          isGranted ? RolePermissionsForEntityEnum.Granted : RolePermissionsForEntityEnum.Denied,
        ]),
      );
      await groupsClient.updateGroupRolePermissions(
        Number(organization.groupId),
        Number(creator.id),
        { permissions },
      );
      return;
    }
    throw new Error(`Creator type ${creator.type} not supported for entity type ${entity.type}`);
  }
  if (entity.type === EntityTypes.UNIVERSE) {
    if (creator.type === CreatorTypes.ROLE) {
      const permissions = Object.fromEntries(
        Object.entries(updatedPermissions).map(([key, { isGranted }]) => [
          key,
          isGranted ? RolePermissionsForEntityEnum.Granted : RolePermissionsForEntityEnum.Denied,
        ]),
      );
      await groupsClient.updateUniverseRolePermissions(
        Number(organization.groupId),
        Number(creator.id),
        entity.id,
        { permissions },
      );
      return;
    }
    throw new Error(`Creator type ${creator.type} not supported for entity type ${entity.type}`);
  }
  throw new Error(`Entity type ${String(entity.type)} not supported`);
}

export function useUpdateAllPermissions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: performUpdateAllPermissions,
    onSettled: (_data, _error, variables) => {
      const { creator, entity, organization } = variables;
      void queryClient.invalidateQueries({
        queryKey: getQueryKey(creator, entity, organization),
      });
    },
  });
}
