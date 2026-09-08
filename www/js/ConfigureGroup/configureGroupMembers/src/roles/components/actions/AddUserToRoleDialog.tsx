import type { FunctionComponent } from 'react';
import React, { useState, useRef } from 'react';
import { useTranslation } from '@rbx/intl';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  makeStyles,
  Typography,
} from '@rbx/ui';
import type { GroupRoleMetadata } from '../../../clients/groups';
import type { User } from '../../../clients/users';
import useCurrentGroup from '../../../hooks/useCurrentGroup';
import { useAddInvitedToRole, useAddUserToRole } from '../../../queries/usersQueries';
import { UserSelect, useUserOptionsForOrgRoles } from '../../../userSelect';
import type { UserCategory } from '../../../userSelect';
import { logOrganizationsEvent, OrganizationsEventName } from '../../../utils/eventUtils';
import { SelectedUserList } from './SelectedUserList';

export interface AddUserToRoleDialogProps {
  open: boolean;
  onClose: () => void;
  role: GroupRoleMetadata;
}

const useStyles = makeStyles()((theme) => ({
  responsiveFullScreen: {
    width: 900,
    maxWidth: 900,
    [theme.breakpoints.down('Large')]: {
      width: 600,
      maxWidth: 600,
    },
    [theme.breakpoints.down('Medium')]: {
      margin: `-24px 0`,
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
    },
  },
}));

export const AddUserToRoleDialog: FunctionComponent<
  React.PropsWithChildren<AddUserToRoleDialogProps>
> = ({ open, onClose, role }) => {
  const {
    organization,
    group,
    refreshPermission,
    user: currentUser,
    unifiedLogger,
    showToast,
  } = useCurrentGroup();
  const { translate } = useTranslation();
  const { mutateAsync: addUserToRole } = useAddUserToRole();
  const { mutateAsync: addInvitedToRole } = useAddInvitedToRole();
  const userSelectParams = useUserOptionsForOrgRoles(role.id?.toString());
  const {
    classes: { responsiveFullScreen },
  } = useStyles();
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const invitationStatus = useRef<Set<number>>(new Set());

  const closeDialog = () => {
    setSelectedUsers([]);
    onClose();
  };

  const addUserToRoleDraft = (user: User, userStatus: UserCategory | 'unknown') => {
    if (selectedUsers.some((existingUser) => existingUser.id === user.id)) {
      return;
    }
    const newUser = { ...user };
    if (userStatus === 'InvitePending' && user.id !== undefined) {
      invitationStatus.current.add(user.id);
    }
    setSelectedUsers((prev) => [...prev, newUser]);
  };

  const removeDraftUserFromRole = (userId: number) => {
    setSelectedUsers((userList) => userList.filter((selectedUser) => selectedUser.id !== userId));
    invitationStatus.current.delete(userId);
  };

  const addUsersToRole = async () => {
    closeDialog();
    const organizationId = organization?.id;
    if (!organizationId) {
      return;
    }
    if (!selectedUsers.length) {
      return;
    }
    try {
      const requests = selectedUsers
        .filter(
          (userInvite): userInvite is typeof userInvite & { id: number } =>
            userInvite?.id !== undefined,
        )
        .map((userInvite) => {
          if (!role?.id) {
            return Promise.resolve();
          }
          const isInvitation = invitationStatus.current.has(userInvite.id);
          if (isInvitation) {
            return addInvitedToRole({
              organizationId: organization?.id,
              member: {
                user: { userId: userInvite.id },
                invitationId: userInvite.id.toString(),
              },
              roleId: role.id,
            });
          }
          return addUserToRole({
            groupId: group.id.toString(),
            member: {
              user: { userId: userInvite.id },
            },
            roleId: role.id,
          });
        });
      await Promise.all(requests);

      if (
        currentUser.id !== undefined &&
        selectedUsers.some((selectedUser) => selectedUser.id === currentUser.id)
      ) {
        await refreshPermission();
      }
      showToast(translate('Message.RoleAddedToUsers'));
    } catch {
      showToast(translate('Error.AddingUsersToRole'), true);
    } finally {
      logOrganizationsEvent(unifiedLogger, OrganizationsEventName.ClickOrgsAddMemberToRole, {
        group_id: organization?.groupId ?? '',
        role_id: role.id?.toString() ?? '',
        user_ids: selectedUsers
          .map((user) => (user.id !== undefined ? user.id.toString() : ''))
          .join(','),
      });
      setSelectedUsers([]);
    }
  };

  return (
    <Dialog open={open} onClose={closeDialog} classes={{ paper: responsiveFullScreen }}>
      <DialogContent>
        <Grid container mb={1}>
          <Typography variant='h3' align='left'>
            {translate('Label.AddMemberToRole', { roleName: role.name ?? '' })}
          </Typography>
        </Grid>
        <>
          <Grid container mb={2}>
            <UserSelect onSelect={addUserToRoleDraft} {...userSelectParams} />
          </Grid>
          <SelectedUserList selectedUsers={selectedUsers} removeUser={removeDraftUserFromRole} />
        </>
      </DialogContent>
      <DialogActions>
        <Grid container justifyContent='flex-end' spacing={1}>
          <Grid item>
            <Button
              data-testid='close-button'
              fullWidth
              variant='contained'
              color='secondary'
              size='large'
              onClick={closeDialog}>
              {translate('Action.Cancel')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              data-testid='invite-button'
              fullWidth
              variant='contained'
              color='primaryBrand'
              size='large'
              onClick={addUsersToRole}
              disabled={!selectedUsers.length}>
              {translate('Label.Add')}
            </Button>
          </Grid>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserToRoleDialog;
