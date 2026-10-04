import type { ComponentProps, FunctionComponent } from 'react';
import React from 'react';
import { Button, Tooltip, TooltipTrigger } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleMetadata } from '../../../clients/groups';
import useCurrentGroup from '../../../hooks/useCurrentGroup';
import {
  isEarlyTesterRole,
  useRoleEarlyTesterAssignment,
} from '../../../queries/earlyTestersQueries';
import { useGetGroupsRoles } from '../../../queries/rolesQueries';
import { MAX_EARLY_TESTERS } from '../../../utils/constants';
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
  const { group, organization } = useCurrentGroup();
  const { data, isLoading, isError } = useRoleEarlyTesterAssignment(group.id, role.id);
  const { data: roles } = useGetGroupsRoles(organization?.groupId);
  const [open, setOpen] = React.useState(false);
  const memberCount =
    roles?.find((candidate) => candidate.id === role.id)?.memberCount ?? role.memberCount ?? 0;
  const isAtCapacity =
    !isLoading && !isError && isEarlyTesterRole(data, role.id) && memberCount >= MAX_EARLY_TESTERS;

  const button = (
    <Button
      variant={variant}
      size={size}
      className={isAtCapacity ? 'pointer-events-none' : undefined}
      isDisabled={isAtCapacity}
      onClick={() => setOpen(true)}>
      {translate('Action.AddMembers')}
    </Button>
  );

  return (
    <>
      {isAtCapacity ? (
        <Tooltip
          position='top-center'
          title={translate('Error.ReachedEarlyTesterLimit', {
            maxEarlyTesters: String(MAX_EARLY_TESTERS),
          })}>
          <TooltipTrigger asChild>
            <span className='inline-block cursor-not-allowed'>{button}</span>
          </TooltipTrigger>
        </Tooltip>
      ) : (
        button
      )}
      <AddUserToRoleDialog open={open} onClose={() => setOpen(false)} role={role} />
    </>
  );
};

export default AddUserToRoleButton;
