import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { GroupRoleMetadata, GroupUserWithRoles } from '../../clients/groups';
import groupsClient, { RolePermissionsForEntityEnum } from '../../clients/groups';
import { getEarlyTesterAssignmentQueryKey } from '../../queries/earlyTestersQueries';
import { useAddUserToRole, useRemoveUserFromRole } from '../../queries/usersQueries';
import { EARLY_TESTER_PERMISSION_ID } from '../../utils/constants';

type SaveEarlyTestersParams = {
  groupId: number;
  universeId: string;
  previousRoleId?: number;
  nextRole: GroupRoleMetadata | null;
  membersToAdd: GroupUserWithRoles[];
  membersToRemove: GroupUserWithRoles[];
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
        await Promise.all([
          ...membersToRemove.map((member) =>
            removeUserFromRole({ groupId: groupIdString, member, roleId: nextRoleId }),
          ),
          ...membersToAdd.map((member) =>
            addUserToRole({ groupId: groupIdString, member, roleId: nextRoleId }),
          ),
        ]);

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
