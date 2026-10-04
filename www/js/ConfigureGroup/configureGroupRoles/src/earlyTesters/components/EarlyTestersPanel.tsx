import type { FunctionComponent } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import verifyIdDark from '@rbx/foundation-images/pictograms/verifyid_dark.svg';
import verifyIdLight from '@rbx/foundation-images/pictograms/verifyid_light.svg';
import { Button, ProgressCircle } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleMetadata, GroupUserWithRoles } from '../../clients/groups';
import EmptyState from '../../components/EmptyState';
import ErrorState from '../../components/ErrorState';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import { usePermissionsTranslation } from '../../permissions/providers/TranslationProvider';
import type { EntityDetails } from '../../permissions/utils/types';
import { useEarlyTesterAssignment } from '../../queries/earlyTestersQueries';
import {
  useCreateRole,
  useGetAllGroupUsersWithRole,
  useGetGroupsRoles,
} from '../../queries/rolesQueries';
import {
  AGE_VERIFICATION_URL,
  DefaultMemberRoleIdNumber,
  GROUP_ROLES_HREF,
  GuestRoleRank,
  MAX_EARLY_TESTERS,
} from '../../utils/constants';
import { useEarlyTesterRoleAccess } from '../hooks/useEarlyTesterRoleAccess';
import { useSaveEarlyTesters } from '../hooks/useSaveEarlyTesters';
import AddEarlyTesterMembersDialog from './AddEarlyTesterMembersDialog';
import ChooseEarlyTestersPanel from './ChooseEarlyTestersPanel';
import DisabledPermissionTooltip from './DisabledPermissionTooltip';
import ManageEarlyTestersPanel from './ManageEarlyTestersPanel';
import RolePickerDialog from './RolePickerDialog';
import RolePickerPanel from './RolePickerPanel';

const VERIFY_AGE_ILLUSTRATION = { light: verifyIdLight, dark: verifyIdDark };

export type EarlyTestersPanelProps = {
  entity: EntityDetails;
};

const EarlyTestersPanel: FunctionComponent<EarlyTestersPanelProps> = ({ entity }) => {
  const { translate } = useTranslation();
  const { translate: translatePermission } = usePermissionsTranslation();
  const {
    organization,
    isOwnerAgeVerified,
    isOwnerAgeVerifiedError,
    retryOwnerAgeVerification,
    showToast,
  } = useCurrentGroup();
  const groupId = organization?.groupId ? Number(organization.groupId) : undefined;
  const universeId = entity.id;
  const { canEditMembers, canEditAssignment } = useEarlyTesterRoleAccess(universeId, true);
  const disabledPermissionText = translatePermission('DisabledPermission.Info');
  const readOnlyTooltip = typeof disabledPermissionText === 'string' ? disabledPermissionText : '';

  const {
    data: assignment,
    isPending: isAssignmentPending,
    isError: isAssignmentError,
    refetch: refetchAssignment,
  } = useEarlyTesterAssignment(groupId, universeId);
  const { data: allRoles } = useGetGroupsRoles(organization?.groupId);
  const eligibleRoles = useMemo(
    () =>
      (allRoles ?? [])
        .filter((role) => role.id !== DefaultMemberRoleIdNumber && role.rank !== GuestRoleRank)
        .toReversed(),
    [allRoles],
  );

  const [pendingRole, setPendingRole] = useState<GroupRoleMetadata | null>(
    () => assignment?.universeRole ?? null,
  );
  const [pendingMembers, setPendingMembers] = useState<Map<number, GroupUserWithRoles>>(new Map());
  const [trackedAssignment, setTrackedAssignment] = useState(assignment);
  const [savedDraftRoleId, setSavedDraftRoleId] = useState<number | null>(null);
  const [membersRoleId, setMembersRoleId] = useState<number | undefined>();
  const [isRolePickerOpen, setIsRolePickerOpen] = useState(false);
  const [pickedRoleId, setPickedRoleId] = useState<number | undefined>();
  const [isAddMembersOpen, setIsAddMembersOpen] = useState(false);

  if (trackedAssignment !== assignment) {
    setTrackedAssignment(assignment);
    setPendingRole(assignment?.universeRole ?? null);
    setSavedDraftRoleId(null);
  }

  const {
    data: roleMembers,
    isPlaceholderData,
    isSuccess,
  } = useGetAllGroupUsersWithRole(organization?.groupId ?? '', pendingRole?.id);
  const roleMembersReady = pendingRole?.id != null && isSuccess && !isPlaceholderData;

  if (pendingRole?.id !== membersRoleId && roleMembersReady) {
    const members = new Map<number, GroupUserWithRoles>();
    for (const member of roleMembers?.data ?? []) {
      if (member.user?.userId != null) {
        members.set(member.user.userId, member);
      }
    }
    setMembersRoleId(pendingRole.id);
    setPendingMembers(members);
  } else if (
    pendingRole?.id != null &&
    pendingRole.id !== membersRoleId &&
    membersRoleId !== undefined
  ) {
    setMembersRoleId(undefined);
    setPendingMembers(new Map());
  }

  const { mutateAsync: saveEarlyTesters, isPending: isSaving } = useSaveEarlyTesters();
  const { mutateAsync: createRole, isPending: isCreatingRole } = useCreateRole();

  const handleOpenRolePicker = useCallback(() => {
    if (!canEditAssignment) {
      return;
    }
    setPickedRoleId(pendingRole?.id);
    setIsRolePickerOpen(true);
  }, [canEditAssignment, pendingRole?.id]);

  const handleSelectPickedRole = useCallback((role: GroupRoleMetadata) => {
    setPickedRoleId(role.id);
  }, []);

  const handleCloseRolePicker = useCallback(() => {
    setIsRolePickerOpen(false);
  }, []);

  const handleConfirmRole = useCallback(() => {
    const role = eligibleRoles.find((candidate) => candidate.id === pickedRoleId);
    if (role) {
      setPendingRole(role);
    }
    setIsRolePickerOpen(false);
  }, [eligibleRoles, pickedRoleId]);

  const handleAddMembers = useCallback((members: GroupUserWithRoles[]) => {
    setPendingMembers((prev) => {
      const next = new Map(prev);
      for (const member of members) {
        if (member.user?.userId != null) {
          next.set(member.user.userId, member);
        }
      }
      return next;
    });
  }, []);

  const handleToggleMember = useCallback((member: GroupUserWithRoles) => {
    const userId = member.user?.userId;
    if (userId == null) {
      return;
    }
    setPendingMembers((prev) => {
      const next = new Map(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.set(userId, member);
      }
      return next;
    });
  }, []);

  const handleRemoveMember = useCallback((member: GroupUserWithRoles) => {
    const userId = member.user?.userId;
    if (userId == null) {
      return;
    }
    setPendingMembers((prev) => {
      const next = new Map(prev);
      next.delete(userId);
      return next;
    });
  }, []);

  const previousMemberIds = useMemo(() => {
    if (!roleMembersReady) {
      return new Set<number | undefined>();
    }
    return new Set((roleMembers?.data ?? []).map((member) => member.user?.userId));
  }, [roleMembers, roleMembersReady]);
  const pendingMemberList = useMemo(() => Array.from(pendingMembers.values()), [pendingMembers]);
  const existingMemberIds = useMemo(() => new Set(pendingMembers.keys()), [pendingMembers]);

  const canAdd =
    canEditAssignment &&
    pendingRole === null &&
    pendingMembers.size > 0 &&
    pendingMembers.size <= MAX_EARLY_TESTERS;
  const savedRoleId = assignment?.universeRole?.id ?? savedDraftRoleId;
  const hasUnsavedRole = pendingRole != null && pendingRole.id == null;
  const roleChanged = hasUnsavedRole || (pendingRole?.id ?? null) !== savedRoleId;
  const membersChanged = useMemo(() => {
    const savedMemberIds = new Set<number>();
    for (const userId of previousMemberIds) {
      if (userId != null) {
        savedMemberIds.add(userId);
      }
    }
    if (pendingMembers.size !== savedMemberIds.size) {
      return true;
    }
    for (const userId of pendingMembers.keys()) {
      if (!savedMemberIds.has(userId)) {
        return true;
      }
    }
    return false;
  }, [pendingMembers, previousMemberIds]);
  const hasPendingChanges =
    pendingRole !== null &&
    (canEditAssignment
      ? roleChanged || membersChanged
      : canEditMembers && membersChanged && !roleChanged);
  // keepPreviousData still holds the previous role's members until the new role loads.
  // Saving in that window would remove those people from the new role.
  const membersAreCurrent =
    pendingRole?.id == null || (roleMembersReady && membersRoleId === pendingRole.id);
  const canSave = hasPendingChanges && membersAreCurrent;

  const handleOpenAddMembers = useCallback(() => {
    setIsAddMembersOpen(true);
  }, []);

  const handleCreateDraft = useCallback(() => {
    const roleName = translate('Label.EarlyTesterRole', { experienceName: entity.name ?? '' });
    setPendingRole({
      name: roleName,
      isPrivate: true,
    });
  }, [translate, entity.name]);

  const handleSave = useCallback(async () => {
    if (groupId === undefined || pendingRole === null) {
      return;
    }
    if (!canEditAssignment && (!canEditMembers || roleChanged)) {
      return;
    }
    if (pendingRole.id != null && (!roleMembersReady || membersRoleId !== pendingRole.id)) {
      return;
    }

    try {
      let targetRole = pendingRole;
      if (targetRole.id == null) {
        const roleName = targetRole.name;
        if (roleName == null || roleName === '') {
          return;
        }
        targetRole = await createRole({
          groupId,
          name: roleName,
          description: '',
          rank: 1,
          usingGroupFunds: false,
          isPrivate: true,
        });
        if (targetRole.id != null) {
          setPendingRole(targetRole);
        }
      }
      if (!targetRole.id) {
        return;
      }

      const savedMembers = roleMembersReady ? (roleMembers?.data ?? []) : [];
      const membersToAdd = pendingMemberList.filter(
        (member) => member.user?.userId != null && !previousMemberIds.has(member.user.userId),
      );
      const membersToRemove = savedMembers.filter(
        (member) => member.user?.userId != null && !pendingMembers.has(member.user.userId),
      );

      await saveEarlyTesters({
        groupId,
        universeId,
        previousRoleId: assignment?.universeRole?.id,
        nextRole: targetRole,
        membersToAdd,
        membersToRemove,
      });
      if (pendingRole.id == null) {
        setSavedDraftRoleId(targetRole.id);
      }
    } catch {
      showToast(translate('Response.UnknownError'), true);
    }
  }, [
    groupId,
    universeId,
    assignment,
    pendingRole,
    pendingMembers,
    previousMemberIds,
    roleMembers,
    saveEarlyTesters,
    createRole,
    canEditAssignment,
    canEditMembers,
    roleChanged,
    roleMembersReady,
    membersRoleId,
    pendingMemberList,
    showToast,
    translate,
  ]);

  const handleCancel = useCallback(() => {
    setPendingRole(assignment?.universeRole ?? null);
    setSavedDraftRoleId(null);
    setMembersRoleId(undefined);
    setPendingMembers(new Map());
  }, [assignment]);

  const handleAddOrSave = useCallback(() => {
    if (canSave) {
      void handleSave();
    } else {
      handleCreateDraft();
    }
  }, [canSave, handleSave, handleCreateDraft]);

  if (canEditAssignment && isOwnerAgeVerifiedError) {
    return <ErrorState onRetry={retryOwnerAgeVerification} />;
  }

  if (canEditAssignment && isOwnerAgeVerified === false) {
    return (
      <EmptyState
        illustration={VERIFY_AGE_ILLUSTRATION}
        title={translate('Heading.AgeCheckEarlyTesters')}
        description={translate('Description.AgeCheckEarlyTesters')}
        action={
          AGE_VERIFICATION_URL ? (
            <Button
              as='a'
              href={AGE_VERIFICATION_URL}
              target='_blank'
              rel='noopener noreferrer'
              variant='Emphasis'
              size='Medium'>
              {translate('Action.Verify')}
            </Button>
          ) : undefined
        }
      />
    );
  }

  if ((canEditAssignment && isOwnerAgeVerified == null) || isAssignmentPending) {
    return (
      <div className='flex justify-center padding-large'>
        <ProgressCircle
          variant='Indeterminate'
          size='Large'
          ariaLabel={translate('Label.Loading')}
        />
      </div>
    );
  }

  if (isAssignmentError) {
    return <ErrorState onRetry={refetchAssignment} />;
  }

  const isSavePending = isSaving || isCreatingRole;
  const showInlineRolePicker = isRolePickerOpen && pendingRole == null;

  return (
    <div className='gap-medium flex flex-col width-full'>
      {showInlineRolePicker ? (
        <RolePickerPanel
          roles={eligibleRoles}
          selectedRoleId={pickedRoleId}
          onSelectRole={handleSelectPickedRole}
        />
      ) : pendingRole ? (
        <ManageEarlyTestersPanel
          role={pendingRole}
          members={pendingMemberList}
          maxMembers={MAX_EARLY_TESTERS}
          onOpenRolePicker={handleOpenRolePicker}
          onOpenAddMembers={handleOpenAddMembers}
          onRemoveMember={handleRemoveMember}
          canChangeRole={canEditAssignment}
          canEditMembers={canEditMembers}
          readOnlyTooltip={readOnlyTooltip}
        />
      ) : (
        canEditAssignment &&
        groupId !== undefined && (
          <ChooseEarlyTestersPanel
            groupId={groupId}
            selection={pendingMembers}
            onToggleMember={handleToggleMember}
            onOpenRolePicker={handleOpenRolePicker}
          />
        )
      )}

      <div className='sticky bottom-[0px] items-center gap-small padding-y-medium bg-surface-0 flex flex-row width-full [z-index:1]'>
        {showInlineRolePicker ? (
          <>
            <Button
              variant='Emphasis'
              size='Medium'
              isDisabled={pickedRoleId == null}
              onClick={handleConfirmRole}>
              {translate('Button.Select')}
            </Button>
            <Button variant='Standard' size='Medium' onClick={handleCloseRolePicker}>
              {translate('Button.Back')}
            </Button>
          </>
        ) : (
          <>
            <DisabledPermissionTooltip
              isDisabled={!canEditAssignment && !canEditMembers}
              title={readOnlyTooltip}
              className='inline-block cursor-not-allowed'>
              <Button
                variant='Emphasis'
                size='Medium'
                isDisabled={isSavePending || (!canAdd && !canSave)}
                isLoading={isSavePending}
                className={
                  !canEditAssignment && !canEditMembers ? 'pointer-events-none' : undefined
                }
                onClick={handleAddOrSave}>
                {translate(canEditAssignment && !hasPendingChanges ? 'Button.Add' : 'Action.Save')}
              </Button>
            </DisabledPermissionTooltip>
            {pendingRole && (canEditAssignment || canEditMembers) && (
              <Button
                variant='Standard'
                size='Medium'
                isDisabled={isSavePending}
                onClick={handleCancel}>
                {translate('Action.Cancel')}
              </Button>
            )}
          </>
        )}
        <Button
          as='a'
          href={GROUP_ROLES_HREF}
          target='_blank'
          rel='noopener noreferrer'
          variant='Utility'
          size='Medium'>
          {translate('Action.ManageRoles')}
        </Button>
      </div>
      <RolePickerDialog
        open={isRolePickerOpen && pendingRole != null}
        roles={eligibleRoles}
        selectedRoleId={pickedRoleId}
        onOpenChange={setIsRolePickerOpen}
        onSelectRole={handleSelectPickedRole}
        onConfirm={handleConfirmRole}
      />
      {groupId !== undefined && pendingRole && (
        <AddEarlyTesterMembersDialog
          open={isAddMembersOpen}
          groupId={groupId}
          roleName={pendingRole.name ?? ''}
          memberCount={pendingMembers.size}
          maxMembers={MAX_EARLY_TESTERS}
          existingMemberIds={existingMemberIds}
          remainingCapacity={MAX_EARLY_TESTERS - pendingMembers.size}
          onOpenChange={setIsAddMembersOpen}
          onConfirm={handleAddMembers}
        />
      )}
    </div>
  );
};

export default EarlyTestersPanel;
