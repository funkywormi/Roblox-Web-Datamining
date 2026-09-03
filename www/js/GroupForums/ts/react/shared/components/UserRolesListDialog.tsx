import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation, TranslationProvider } from 'react-utilities';
import { Dialog, DialogTitle, DialogContent } from '@rbx/foundation-ui';
import groupMembershipService from '../services/groupMembershipService';
import { AssignedRole } from '../types';
import { groupsConfig } from '../translation.config';
import RoleIcon from './RoleIcon';

interface RolesListDialogProps {
  open: boolean;
  onClose: () => void;
  groupId: number;
  userId: number;
}

const RolesListDialogInner: React.FC<RolesListDialogProps> = ({
  open,
  onClose,
  groupId,
  userId
}) => {
  const { translate } = useTranslation();

  const [roles, setRoles] = useState<AssignedRole[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  // TODO: Ideally, in the future, we will have user roles info available already
  // waiting on organizations API merge
  const fetchUserData = useCallback(async () => {
    setIsError(false);
    setIsLoading(true);
    try {
      const response = await groupMembershipService.getUsersInGroup({
        groupId,
        userIds: [userId]
      });
      const userData = response.data.find(user => user.user.userId === userId);
      if (userData) {
        setRoles(userData.roles);
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [groupId, userId]);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line no-void
      void fetchUserData();
    }
  }, [open, fetchUserData]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        onClose();
      }
    },
    [onClose]
  );

  // Portal UI still sits under this dialog in the *React* tree, so clicks (e.g. close affordance)
  // bubble to ancestors like a wrapping <a>. Outside-dismiss paths often stopPropagation themselves.
  const stopBubblingToReactAncestors = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
      size='Small'
      type='Default'
      isModal
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <div role='presentation' onClick={stopBubblingToReactAncestors}>
        <DialogContent
          className='padding-large user-roles-list-dialog-content'
          aria-describedby={undefined}>
          <DialogTitle>{translate('Heading.Roles')}</DialogTitle>
          {isLoading && <span className='spinner spinner-sm spinner-short' />}
          {isError && <div>{translate('NetworkError')}</div>}
          <div className='padding-bottom-medium'>
            {roles.map(role => (
              <div key={role.id} className='padding-top-medium flex items-center'>
                <RoleIcon role={role} size='Medium' />
                <span className='grow-1 min-width-0 text-align-x-left text-no-wrap text-truncate-end'>
                  {role.name}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </div>
    </Dialog>
  );
};

const RolesListDialog: React.FC<RolesListDialogProps> = props => (
  <TranslationProvider config={groupsConfig}>
    <RolesListDialogInner {...props} />
  </TranslationProvider>
);

export default RolesListDialog;
