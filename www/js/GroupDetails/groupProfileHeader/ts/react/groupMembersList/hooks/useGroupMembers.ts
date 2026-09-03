import { useMemo, useCallback } from 'react';
import { FilterOption } from '@rbx/profile-platform';
import { useTranslation } from 'react-utilities';
import { GroupRole, GroupMember } from '../types';
import groupRolesService from '../services/groupRolesService';

export interface RoleFilterOption extends FilterOption {
  memberCount?: number;
  rank: number;
}

interface UseGroupMembersProps {
  roles: GroupRole[];
  userRole: GroupRole | null;
  groupId: number;
}

interface UseGroupMembersResult {
  filterOptions: RoleFilterOption[];
  defaultFilter: RoleFilterOption | undefined;
  queryFunction: (
    filter: RoleFilterOption | null,
    pageParam?: string
  ) => Promise<{
    data: GroupMember[];
    previousPageCursor: string | undefined;
    nextPageCursor: string | undefined;
  }>;
  queryKey: (filter: RoleFilterOption | null) => (string | number)[];
}

export const useGroupMembers = ({
  roles,
  userRole,
  groupId
}: UseGroupMembersProps): UseGroupMembersResult => {
  const { translate } = useTranslation();
  // Convert roles to filter options
  const filterOptions: RoleFilterOption[] = useMemo(() => {
    return roles.map(role => ({
      ...role,
      name: role.isBase ? translate('Label.AllRoles') : role.name,
      value: role.id.toString(),
      memberCount: role.isBase ? undefined : role.memberCount || 0,
      rank: role.rank
    }));
  }, [roles, translate]);

  // Determine default filter
  const defaultFilter = useMemo((): RoleFilterOption | undefined => {
    if (!filterOptions || filterOptions.length === 0) {
      return undefined;
    }
    if (userRole && userRole.id > 0 && userRole.rank > 0) {
      return filterOptions.find(f => f.id === userRole.id) ?? filterOptions[0];
    }
    return filterOptions[0];
  }, [filterOptions, userRole]);

  const queryFunction = useCallback(
    async (filter: RoleFilterOption | null, pageParam?: string) => {
      if (!filter) {
        return { data: [], previousPageCursor: undefined, nextPageCursor: undefined };
      }
      const response = await groupRolesService.getRoleMembers(
        groupId,
        filter.id as number,
        pageParam
      );
      return {
        ...response,
        previousPageCursor: response.previousPageCursor || undefined,
        nextPageCursor: response.nextPageCursor || undefined
      };
    },
    [groupId]
  );

  const queryKey = useCallback(
    (filter: RoleFilterOption | null) => {
      return ['groupMembers', groupId, filter?.id as number];
    },
    [groupId]
  );

  return {
    filterOptions,
    defaultFilter,
    queryFunction,
    queryKey
  };
};
