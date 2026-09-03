import type { ComponentProps, FunctionComponent } from 'react';
import React from 'react';
import { Button } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleMetadata } from '../../../clients/groups';
import { AddUserToRoleDialog } from './AddUserToRoleDialog';

export type AddUserToRoleButtonProps = {
  role: GroupRoleMetadata;
  variant?: ComponentProps<typeof Button>['variant'];
  size?: ComponentProps<typeof Button>['size'];
};

const AddUserToRoleButton: FunctionComponent<AddUserToRoleButtonProps> = ({
  role,
  variant = 'Standard',
  size = 'Small',
}) => {
  const { translate } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setOpen(true)}>
        {translate('Action.AddMembers')}
      </Button>
      <AddUserToRoleDialog open={open} onClose={() => setOpen(false)} role={role} />
    </>
  );
};

export default AddUserToRoleButton;
