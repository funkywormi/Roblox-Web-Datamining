import React, { useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@rbx/foundation-ui';
import { useQuery } from '@tanstack/react-query';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { groupsConfig } from '../../translation.config';
import forumsService from '../../services/forumsService';
import { getCategoryRolesKey } from '../../services/queryKeys';
import RoleIcon from '../../../shared/components/RoleIcon';

type RoleRestrictedCategoryDialogProps = {
  groupId: number;
  categoryId: string;
  onClose: () => void;
} & WithTranslationsProps;

const RoleRestrictedCategoryDialog = ({
  groupId,
  categoryId,
  onClose,
  translate
}: RoleRestrictedCategoryDialogProps): JSX.Element => {
  const { isLoading, isError, data: roles = [] } = useQuery({
    queryKey: getCategoryRolesKey(groupId, categoryId),
    queryFn: async () => {
      const response = await forumsService.getGroupForumCategoryRoles(groupId, categoryId);
      return response.data.sort((roleA, roleB) => roleB.rank - roleA.rank);
    },
    retry: false,
    refetchOnWindowFocus: false
  });

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose]
  );

  return (
    <Dialog
      open
      onOpenChange={handleOpenChange}
      size='Small'
      type='Default'
      isModal
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <DialogContent
        className='padding-large user-roles-list-dialog-content'
        aria-describedby={undefined}>
        <DialogTitle>{translate('Heading.RoleRestrictedCategory')}</DialogTitle>
        {isLoading && <span className='spinner spinner-sm spinner-short' />}
        {isError && <div>{translate('NetworkError')}</div>}
        {!isLoading && !isError && roles.length === 0 && (
          <div className='text-body-medium content-muted'>
            {translate('Description.RoleRestrictedCategoryNoRoles')}
          </div>
        )}
        {!isLoading && !isError && roles.length > 0 && (
          <React.Fragment>
            <div className='text-body-medium content-muted'>
              {translate('Description.RoleRestrictedCategoryRolesList')}
            </div>
            <div className='group-forums-restricted-category-roles-list-container'>
              {roles.map(role => (
                <div key={role.id} className='padding-top-medium flex items-center'>
                  <RoleIcon role={role} size='Medium' />
                  <span className='grow-1 min-width-0 text-align-x-left text-no-wrap text-truncate-end text-label-medium'>
                    {role.name}
                  </span>
                </div>
              ))}
            </div>
          </React.Fragment>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default withTranslations(RoleRestrictedCategoryDialog, groupsConfig);
