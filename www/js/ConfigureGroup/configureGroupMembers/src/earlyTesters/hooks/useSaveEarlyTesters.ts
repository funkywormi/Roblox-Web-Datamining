import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GroupRoleMetadata, GroupUserWithRoles } from '../../clients/groups';
import groupsClient, { RolePermissionsForEntityEnum } from '../../clients/groups';
import { getEarlyTesterAssignmentQueryKey } from '../../queries/earlyTestersQueries';
import { useAddUserToRole, useRemoveUserFromRole } from '../../queries/usersQueries';
import { EARLY_TESTER_PERMISSION_ID } from '../../utils/constants';
import tryParseResponseError from '../../utils/tryParseResponseError';

type SaveEarlyTestersParams = {
  groupId: number;
  universeId: string;
  previousRoleId?: number;
  nextRole: GroupRoleMetadata | null;
  membersToAdd: GroupUserWithRoles[];
  membersToRemove: GroupUserWithRoles[];
};

const PRECONDITION_FAILED_STATUS = 412;
// groups-api returns 412 with the generic error code when group-membership could not acquire
// the early-tester seat lock for the role. Other 412 codes (e.g. the role being full) are final.
const LOCK_CONTENTION_ERROR_CODE = 0;
const MAX_MEMBER_UPDATE_ATTEMPTS = 3;
const MEMBER_UPDATE_RETRY_DELAY_MS = 250;

const delay = (duration: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, duration);
  });

const isLockContentionError = async (error: unknown): Promise<boolean> => {
  const responseError = await tryParseResponseError(error);
  return (
    responseError?.status === PRECONDITION_FAILED_STATUS &&
    responseError.code === LOCK_CONTENTION_ERROR_CODE
  );
};

const withLockContentionRetry = async (update: () => Promise<unknown>): Promise<void> => {
  for (let attempt = 1; ; attempt += 1) {
    try {
      await update();
      return;
    } catch (error) {
      if (attempt >= MAX_MEMBER_UPDATE_ATTEMPTS || !(await isLockContentionError(error))) {
        throw error;
      }
      await delay(MEMBER_UPDATE_RETRY_DELAY_MS * attempt);
    }
  }
};

export function useSaveEarlyTesters() {
  const queryClient = useQueryClient();
  const { mutateAsync: addUserToRole } = useAddUserToRole();
  const { mutateAsync: removeUserFromRole } = useRemoveUserFromRole();

  return useMutation({
    mutationFn: async ({
      groupId,
      universeId,
      previousRoleId,
      nextRole,
      membersToAdd,
      membersToRemove,
    }: SaveEarlyTestersParams) => {
      const nextRoleId = nextRole?.id;
      const groupIdString = String(groupId);

      if (previousRoleId != null && previousRoleId !== nextRoleId) {
        await groupsClient.updateUniverseRolePermissions(groupId, previousRoleId, universeId, {
          permissions: { [EARLY_TESTER_PERMISSION_ID]: RolePermissionsForEntityEnum.Denied },
        });
      }

      if (nextRoleId != null) {
        // Early-tester roles serialize member changes behind a per-role lock that fails fast, so
        // concurrent requests collide. Apply changes one at a time, removals first to free seats.
        for (const member of membersToRemove) {
          await withLockContentionRetry(() =>
            removeUserFromRole({ groupId: groupIdString, member, roleId: nextRoleId }),
          );
        }
        for (const member of membersToAdd) {
          await withLockContentionRetry(() =>
            addUserToRole({ groupId: groupIdString, member, roleId: nextRoleId }),
          );
        }

        if (nextRoleId !== previousRoleId) {
          await groupsClient.updateUniverseRolePermissions(groupId, nextRoleId, universeId, {
            permissions: { [EARLY_TESTER_PERMISSION_ID]: RolePermissionsForEntityEnum.Granted },
          });
        }
      }
    },
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({
        queryKey: getEarlyTesterAssignmentQueryKey(variables.groupId, variables.universeId),
      });
    },
  });
}
