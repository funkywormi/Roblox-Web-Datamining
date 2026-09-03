import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from '@rbx/intl';
import {
  useAddInvitedToRole,
  useAddUserToRole,
  useGetGroupsRoles,
  useRemoveInvitedFromRole,
  useRemoveUserFromRole,
} from '../queries';
import type { Member, MemberRole } from '../utils/constants';
import { GroupMembersMenuState } from '../utils/constants';
import { OrganizationsEventName, logOrganizationsEvent } from '../utils/eventUtils';
import type { RoleHierarchy } from '../utils/roleHierarchy';
import { buildRoleHierarchy, getHierarchyPosition } from '../utils/roleHierarchy';
import useCurrentGroup from './useCurrentGroup';

type MemberRoleActions = {
  memberRoles: MemberRole[];
  addRole: (role: MemberRole) => void;
  removeRole: (role: MemberRole) => void;
};

type PendingRoleChange = { role: MemberRole; isAdd: boolean };

type PendingRoleChanges = ReadonlyMap<number, PendingRoleChange>;

const NoPendingChanges: PendingRoleChanges = new Map();
const NoRoles: MemberRole[] = [];

const applyPendingChanges = (
  serverRoles: MemberRole[] | undefined,
  pendingChanges: PendingRoleChanges,
): MemberRole[] => {
  if (pendingChanges.size === 0) {
    return serverRoles ?? NoRoles;
  }

  const rolesById = new Map((serverRoles ?? NoRoles).map((role) => [role.id, role]));
  pendingChanges.forEach(({ role, isAdd }, roleId) => {
    if (isAdd) {
      rolesById.set(roleId, role);
    } else {
      rolesById.delete(roleId);
    }
  });

  return [...rolesById.values()];
};

const byHierarchy = (hierarchy: RoleHierarchy) => (a: MemberRole, b: MemberRole) => {
  const positionA = getHierarchyPosition(hierarchy, a.id);
  const positionB = getHierarchyPosition(hierarchy, b.id);
  return positionA === positionB ? 0 : positionA - positionB;
};

const dropSettledChanges = (
  pendingChanges: PendingRoleChanges,
  serverRoles: MemberRole[] | undefined,
): PendingRoleChanges => {
  if (pendingChanges.size === 0) {
    return pendingChanges;
  }

  const serverRoleIds = new Set((serverRoles ?? NoRoles).map((role) => role.id));
  const remaining = new Map(pendingChanges);
  pendingChanges.forEach(({ isAdd }, roleId) => {
    if (isAdd === serverRoleIds.has(roleId)) {
      remaining.delete(roleId);
    }
  });

  return remaining.size === pendingChanges.size ? pendingChanges : remaining;
};

const useMemberRoleActions = (
  member: Member,
  menuState: GroupMembersMenuState,
): MemberRoleActions => {
  const { translate } = useTranslation();
  const {
    organization,
    refreshPermission,
    user: currentUser,
    unifiedLogger,
    showToast,
  } = useCurrentGroup();

  const { mutate: addUserToRole } = useAddUserToRole();
  const { mutate: addInvitedToRole } = useAddInvitedToRole();
  const { mutate: removeUserFromRole } = useRemoveUserFromRole();
  const { mutate: removeInvitedFromRole } = useRemoveInvitedFromRole();

  const serverRoles = member.roles;
  const [pendingChanges, setPendingChanges] = useState<PendingRoleChanges>(NoPendingChanges);
  const [prevServerRoles, setPrevServerRoles] = useState(serverRoles);
  if (prevServerRoles !== serverRoles) {
    setPrevServerRoles(serverRoles);
    setPendingChanges((previous) => dropSettledChanges(previous, serverRoles));
  }

  const { data: groupRoles } = useGetGroupsRoles(organization?.groupId);
  const hierarchy = useMemo(() => buildRoleHierarchy(groupRoles), [groupRoles]);

  const memberRoles = useMemo(
    () => applyPendingChanges(serverRoles, pendingChanges).toSorted(byHierarchy(hierarchy)),
    [serverRoles, pendingChanges, hierarchy],
  );

  const beginChange = useCallback((role: MemberRole, isAdd: boolean) => {
    setPendingChanges((previous) => new Map(previous).set(role.id ?? 0, { role, isAdd }));
  }, []);

  const revertChange = useCallback((role: MemberRole) => {
    setPendingChanges((previous) => {
      const remaining = new Map(previous);
      remaining.delete(role.id ?? 0);
      return remaining;
    });
  }, []);

  const isInvited = menuState === GroupMembersMenuState.Invited;

  const addRole = useCallback(
    (role: MemberRole) => {
      if (!organization?.id || !member.user?.userId || !role.id) {
        return;
      }
      beginChange(role, true);

      const onError = () => {
        revertChange(role);
        showToast(translate('Error.AddingRole'), true);
      };

      if (isInvited) {
        addInvitedToRole(
          { organizationId: organization.id, member, roleId: role.id },
          { onSuccess: () => showToast(translate('Message.RoleAdded')), onError },
        );
      } else {
        addUserToRole(
          { groupId: organization.groupId, member, roleId: role.id },
          {
            onSuccess: () => {
              if (member.user?.userId === currentUser?.id) {
                void refreshPermission();
              }
              showToast(translate('Message.RoleAdded'));
            },
            onError,
          },
        );
      }

      logOrganizationsEvent(unifiedLogger, OrganizationsEventName.ClickOrgsAddRoleToMember, {
        group_id: organization.groupId ?? '',
        role_id: role.id.toString(),
        user_id: member.user.userId.toString(),
        member_status: menuState,
      });
    },
    [
      organization,
      member,
      isInvited,
      menuState,
      addInvitedToRole,
      addUserToRole,
      beginChange,
      revertChange,
      currentUser,
      refreshPermission,
      showToast,
      translate,
      unifiedLogger,
    ],
  );

  const removeRole = useCallback(
    (role: MemberRole) => {
      if (!organization?.id || !member.user?.userId || !role.id) {
        return;
      }
      beginChange(role, false);

      const onError = () => {
        revertChange(role);
        showToast(translate('Error.RemovingRole'), true);
      };

      if (isInvited) {
        removeInvitedFromRole(
          { organizationId: organization.id, member, roleId: role.id },
          { onSuccess: () => showToast(translate('Message.RoleRemoved')), onError },
        );
      } else {
        removeUserFromRole(
          { groupId: organization.groupId, member, roleId: role.id },
          {
            onSuccess: () => {
              if (member.user?.userId === currentUser?.id) {
                void refreshPermission();
              }
              showToast(translate('Message.RoleRemoved'));
            },
            onError,
          },
        );
      }

      logOrganizationsEvent(unifiedLogger, OrganizationsEventName.ClickOrgsRemoveRoleFromMember, {
        group_id: organization.groupId ?? '',
        role_id: role.id.toString(),
        user_id: member.user.userId.toString(),
        member_status: menuState,
      });
    },
    [
      organization,
      member,
      isInvited,
      menuState,
      removeInvitedFromRole,
      removeUserFromRole,
      beginChange,
      revertChange,
      currentUser,
      refreshPermission,
      showToast,
      translate,
      unifiedLogger,
    ],
  );

  return { memberRoles, addRole, removeRole };
};

export default useMemberRoleActions;
