import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import type { EarlyTesterAssignmentResponse } from '../clients/groups';
import groupsClient from '../clients/groups';
import { MAX_EARLY_TESTERS } from '../utils/constants';

const EARLY_TESTER_KEY_PREFIX = 'groupsApi_earlyTester';

export const getEarlyTesterAssignmentQueryKey = (groupId?: number, universeId?: string) => [
  EARLY_TESTER_KEY_PREFIX,
  groupId,
  universeId,
];

export const getRoleEarlyTesterAssignmentQueryKey = (groupId?: number, roleId?: number) => [
  EARLY_TESTER_KEY_PREFIX,
  'role',
  groupId,
  roleId,
];

export function isEarlyTesterRole(
  assignment: EarlyTesterAssignmentResponse | null | undefined,
  roleId: number | undefined,
): boolean {
  if (roleId == null || assignment == null) {
    return false;
  }
  return assignment.universeRole?.id === roleId || assignment.groupRole?.id === roleId;
}

/**
 * Reports which role, if any, currently holds the early-tester permission for this universe —
 * plus whether any role holds it group-wide, or on any of the group's other universes.
 */
export function useEarlyTesterAssignment(groupId: number | undefined, universeId: string) {
  return useQuery<EarlyTesterAssignmentResponse | null>({
    enabled: groupId !== undefined,
    placeholderData: keepPreviousData,
    queryKey: getEarlyTesterAssignmentQueryKey(groupId, universeId),
    queryFn: () => {
      if (!groupId) {
        return null;
      }
      return groupsClient.getUniverseEarlyTester(groupId, universeId);
    },
  });
}

/**
 * Reports whether this role holds the early-tester permission on any of the group's universes.
 */
export function useRoleEarlyTesterAssignment(
  groupId: number | undefined,
  roleId: number | undefined,
) {
  return useQuery<EarlyTesterAssignmentResponse | null>({
    enabled: groupId !== undefined && roleId !== undefined,
    queryKey: getRoleEarlyTesterAssignmentQueryKey(groupId, roleId),
    queryFn: () => {
      if (groupId === undefined || roleId === undefined) {
        return null;
      }
      return groupsClient.getRoleEarlyTester(groupId, roleId);
    },
  });
}

/**
 * Role ids that cannot take another member: they hold the early-tester permission and already
 * have {@link MAX_EARLY_TESTERS} members. Roles still loading or that failed to load are omitted.
 */
export function useEarlyTesterRolesAtCapacity(
  groupId: number | undefined,
  roles: readonly { id?: number; memberCount?: number }[],
): ReadonlySet<number> {
  const fullRoles = roles.filter(
    (role): role is { id: number; memberCount?: number } =>
      role.id != null && (role.memberCount ?? 0) >= MAX_EARLY_TESTERS,
  );

  const results = useQueries({
    queries: fullRoles.map((role) => ({
      enabled: groupId !== undefined,
      staleTime: 60_000,
      queryKey: getRoleEarlyTesterAssignmentQueryKey(groupId, role.id),
      queryFn: () => {
        if (groupId === undefined) {
          return null;
        }
        return groupsClient.getRoleEarlyTester(groupId, role.id);
      },
    })),
  });

  return new Set(
    fullRoles.flatMap((role, index) => {
      const result = results[index];
      if (result?.isLoading || result?.isError || !isEarlyTesterRole(result?.data, role.id)) {
        return [];
      }
      return [role.id];
    }),
  );
}
