import type { FunctionComponent } from 'react';
import React from 'react';
import { IconButton } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { Grid } from '@rbx/ui';
import type { User } from '../../../clients/users';
import UserThumbnailWithNames from '../../../members/components/common/UserThumbnailWithNames';

export interface SelectedUserListProps {
  selectedUsers: User[];
  removeUser: (userId: number) => void;
}

export const SelectedUserList: FunctionComponent<SelectedUserListProps> = ({
  selectedUsers,
  removeUser,
}) => {
  const { translate } = useTranslation();

  return (
    <Grid container>
      {selectedUsers.map((userInvites) => (
        <Grid item key={userInvites.id} XSmall={12} mt={2} mb={2}>
          <Grid container alignItems='center' flexWrap='wrap' spacing={1}>
            <Grid item flex='1 1 0' sx={{ overflow: 'hidden' }}>
              <UserThumbnailWithNames
                target={{
                  id: userInvites.id,
                  name: userInvites.name,
                  displayName: userInvites.displayName,
                }}
                disableLink
              />
            </Grid>
            <Grid item flex='0 0 auto'>
              <IconButton
                icon='icon-regular-circle-minus'
                ariaLabel={translate('Action.Remove')}
                variant='Utility'
                size='Small'
                onClick={() => {
                  if (userInvites.id !== undefined) {
                    removeUser(userInvites.id);
                  }
                }}
              />
            </Grid>
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};

export default SelectedUserList;
