import { useCallback } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import developApiClient from '../../clients/developApi';
import type { GroupRoleMetadata, GroupRolePermissions } from '../../clients/groups';
import groupsClient from '../../clients/groups';
import type { Organization } from '../../clients/organizationApi';
import { DefaultMemberRoleIdNumber, GuestRoleRank } from '../../utils/constants';
import { canViewRolePermissions } from '../../utils/groupPermissions';
import type {
  CreatorDetails,
  CreatorFilter,
  CreatorGroupDetails,
  DevelopPermissionsResponse,
  EntityDetails,
} from '../utils/types';
import { CreatorTypes, EntityTypes } from '../utils/types';

const CREATORS_KEY_PREFIX = 'creators_';

type RawCreatorsData = {
  roles: GroupRoleMetadata[] | undefined;
  legacy: DevelopPermissionsResponse | undefined;
};

function isCreatorDetails(value: CreatorTypes | CreatorDetails): value is CreatorDetails {
  return typeof value !== 'string' && 'id' in value;
}

function buildOrganizationRolesGroup(
  roles: GroupRoleMetadata[] | undefined,
  rolePermissions: GroupRolePermissions | undefined,
  isOwner: boolean,
): CreatorGroupDetails {
  const creatorsList = (roles ?? [])
    .filter((role) => role.id && role.id !== DefaultMemberRoleIdNumber)
    .filter((role) => role.rank && role.rank !== GuestRoleRank)
    .toReversed()
    .map((role) => ({
      id: role.id?.toString() ?? '',
      name: role.name ?? '',
      color: role.color,
      isPrivate: role.isPrivate,
      disabled: !isOwner && !canViewRolePermissions(rolePermissions?.[role.id?.toString() ?? '']),
      type: CreatorTypes.ROLE,
    }));

  return { type: CreatorTypes.ROLE, creatorsList };
}

function buildUniverseLegacyGroups(
  response: DevelopPermissionsResponse | undefined,
  includeUsers: boolean,
  includeLegacyRoles: boolean,
): CreatorGroupDetails[] {
  const groupDetails: CreatorGroupDetails[] = [];
  if (includeUsers) {
    const usersList = (response?.data ?? []).flatMap((permission) => {
      const { userId, userName, action } = permission;
      if (!userId || !userName || !action) {
        return [];
      }
      return [{ id: userId, name: userName, type: CreatorTypes.USER }];
    });
    if (usersList.length > 0) {
      groupDetails.push({ type: CreatorTypes.USER, creatorsList: usersList });
    }
  }
  if (includeLegacyRoles) {
    const legacyRolesList = (response?.data ?? []).flatMap((permission) => {
      const { rolesetId, rolesetName, action, groupName } = permission;
      if (!rolesetId || !rolesetName || !action) {
        return [];
      }
      return [
        {
          id: rolesetId,
          name: rolesetName,
          type: CreatorTypes.LEGACY_ROLE,
          subtext: groupName ?? undefined,
        },
      ];
    });
    if (legacyRolesList.length > 0) {
      groupDetails.push({
        type: CreatorTypes.LEGACY_ROLE,
        creatorsList: legacyRolesList,
      });
    }
  }
  return groupDetails;
}

export function useGetAllCreators(
  creatorFilter?: CreatorFilter,
  entity?: EntityDetails,
  organization?: Organization,
  rolePermissions?: GroupRolePermissions,
  isOwner = false,
): UseQueryResult<CreatorGroupDetails[]> {
  const enabled = !!(
    creatorFilter &&
    entity &&
    (entity.owner?.type === CreatorTypes.USER || (organization && rolePermissions))
  );
  const wantsOrgRoles =
    enabled &&
    creatorFilter !== undefined &&
    creatorFilter.includes(CreatorTypes.ROLE) &&
    organization?.id !== undefined &&
    organization.id !== '';
  const wantsLegacy =
    enabled &&
    creatorFilter !== undefined &&
    entity?.type === EntityTypes.UNIVERSE &&
    (creatorFilter.includes(CreatorTypes.USER) || creatorFilter.includes(CreatorTypes.LEGACY_ROLE));

  const select = useCallback(
    (raw: RawCreatorsData): CreatorGroupDetails[] => {
      const allCreators: CreatorGroupDetails[] = [];
      if (wantsOrgRoles) {
        allCreators.push(buildOrganizationRolesGroup(raw.roles, rolePermissions, isOwner));
      }
      if (wantsLegacy) {
        allCreators.push(
          ...buildUniverseLegacyGroups(
            raw.legacy,
            creatorFilter?.includes(CreatorTypes.USER) ?? false,
            creatorFilter?.includes(CreatorTypes.LEGACY_ROLE) ?? false,
          ),
        );
      }
      (creatorFilter ?? []).filter(isCreatorDetails).forEach((creator) => {
        const existingGroup = allCreators.find((group) => group.type === creator.type);
        if (existingGroup) {
          existingGroup.creatorsList.push(creator);
        } else {
          allCreators.push({ type: creator.type, creatorsList: [creator] });
        }
      });
      return allCreators;
    },
    [creatorFilter, isOwner, rolePermissions, wantsOrgRoles, wantsLegacy],
  );

  return useQuery<RawCreatorsData, Error, CreatorGroupDetails[]>({
    enabled,
    queryKey: [
      `${CREATORS_KEY_PREFIX}all`,
      wantsOrgRoles,
      wantsLegacy,
      organization?.id,
      entity?.id,
    ],
    queryFn: async (): Promise<RawCreatorsData> => {
      const [roles, legacy] = await Promise.all([
        wantsOrgRoles && organization?.groupId
          ? await groupsClient
              .getGroupRolesSetsInfo(Number(organization?.groupId))
              .then((response) => response.roles)
          : Promise.resolve<GroupRoleMetadata[] | undefined>(undefined),
        wantsLegacy && entity?.id
          ? developApiClient.getUniverseLegacyPermissions(Number(entity.id))
          : Promise.resolve<DevelopPermissionsResponse | undefined>(undefined),
      ]);
      return { roles, legacy };
    },
    select,
  });
}
