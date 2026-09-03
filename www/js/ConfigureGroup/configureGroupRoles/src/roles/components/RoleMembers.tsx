import type { FunctionComponent } from 'react';
import React, { useCallback, useState } from 'react';
import { Chip } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { Grid } from '@rbx/ui';
import type { GroupRoleMetadata } from '../../clients/groups';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import GroupMembersTable from '../../members/components/GroupMembersTable';
import { useGetInvitationsWithRole } from '../../queries/rolesQueries';
import {
  DefaultMemberRoleIdNumber,
  GroupMembersMenuState,
  MembersPageSize,
} from '../../utils/constants';
import { canAssignRole } from '../../utils/groupPermissions';
import AddUserToRoleButton from './actions/AddUserToRoleButton';

export type RoleMembersProps = {
  role: GroupRoleMetadata;
};

const RoleMembers: FunctionComponent<RoleMembersProps> = ({ role }) => {
  const { translate } = useTranslation();

  const { isOwner, organization, permissions, rolePermissions } = useCurrentGroup();
  const canInviteMembers = permissions?.canInviteMembers === true;
  const { data: { invitationRoles } = {} } = useGetInvitationsWithRole(
    canInviteMembers ? organization?.id : undefined,
    canInviteMembers ? role.id?.toString() : undefined,
    undefined,
    MembersPageSize,
    role.id === DefaultMemberRoleIdNumber,
  );

  const [menuState, setMenuState] = useState(GroupMembersMenuState.Members);
  const setMenuStateMembers = useCallback(() => setMenuState(GroupMembersMenuState.Members), []);
  const setMenuStateInvited = useCallback(() => setMenuState(GroupMembersMenuState.Invited), []);
  const effectiveMenuState =
    invitationRoles?.length === 0 ? GroupMembersMenuState.Members : menuState;

  const canAddToRole =
    role.id !== undefined &&
    (isOwner === true || canAssignRole(rolePermissions?.[role.id.toString()]));

  return (
    <Grid container gap={2} paddingTop={2}>
      <Grid container item alignItems='center' justifyContent='space-between'>
        <Grid container item gap={1} alignItems='center' style={{ flex: '1 0 0' }}>
          {invitationRoles && invitationRoles.length > 0 && (
            <>
              <Chip
                text={translate(`Label.Members`)}
                isChecked={effectiveMenuState === GroupMembersMenuState.Members}
                onCheckedChange={setMenuStateMembers}
                size='Medium'
                variant='Standard'
              />
              <Chip
                text={translate(`Label.Invited`)}
                isChecked={effectiveMenuState === GroupMembersMenuState.Invited}
                onCheckedChange={setMenuStateInvited}
                size='Medium'
                variant='Standard'
              />
            </>
          )}
        </Grid>
        {canAddToRole && <AddUserToRoleButton role={role} />}
      </Grid>
      <GroupMembersTable
        menuState={effectiveMenuState}
        roleFilter={role}
        isRoleMembersPage
        emptyStateAction={
          canAddToRole ? (
            <AddUserToRoleButton role={role} variant='Emphasis' size='Medium' />
          ) : undefined
        }
      />
    </Grid>
  );
};

export default RoleMembers;
