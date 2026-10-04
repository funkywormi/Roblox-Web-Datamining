import type { FunctionComponent } from 'react';
import React from 'react';
import {
  Button,
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleMetadata } from '../../clients/groups';
import { GROUP_ROLES_HREF } from '../../utils/constants';
import EarlyTesterRoleList from './EarlyTesterRoleList';

export type RolePickerDialogProps = {
  open: boolean;
  roles: GroupRoleMetadata[];
  selectedRoleId?: number;
  onOpenChange: (open: boolean) => void;
  onSelectRole: (role: GroupRoleMetadata) => void;
  onConfirm: () => void;
};

/**
 * Role picker once an early tester role is already chosen, saved or not.
 */
const RolePickerDialog: FunctionComponent<RolePickerDialogProps> = ({
  open,
  roles,
  selectedRoleId,
  onOpenChange,
  onSelectRole,
  onConfirm,
}) => {
  const { translate } = useTranslation();

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      isModal
      size='Large'
      hasCloseAffordance
      closeLabel={translate('Action.Close')}>
      <DialogContent className='width-full'>
        <DialogBody className='gap-medium flex flex-col'>
          <DialogTitle className='text-heading-small margin-y-none'>
            {translate('Heading.ChangeRole')}
          </DialogTitle>
          <div className='gap-xsmall flex flex-col'>
            <span className='content-default text-label-medium'>
              {translate('Heading.EarlyTesterRole')}
            </span>
            <span className='content-muted text-body-small'>
              {translate('Description.EarlyTesterRole')}
            </span>
          </div>
          <div className='max-height-[500px] scroll-y'>
            <EarlyTesterRoleList
              roles={roles}
              selectedRoleId={selectedRoleId}
              onSelectRole={onSelectRole}
              isFullWidth
            />
          </div>
        </DialogBody>
        <DialogFooter className='gap-small flex flex-row'>
          <Button
            variant='Emphasis'
            size='Medium'
            className='grow-1 basis-0'
            isDisabled={selectedRoleId == null}
            onClick={onConfirm}>
            {translate('Button.Select')}
          </Button>
          <Button
            as='a'
            href={GROUP_ROLES_HREF}
            target='_blank'
            rel='noopener noreferrer'
            variant='Standard'
            size='Medium'
            className='grow-1 basis-0'>
            {translate('Button.GoToRoles')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RolePickerDialog;
