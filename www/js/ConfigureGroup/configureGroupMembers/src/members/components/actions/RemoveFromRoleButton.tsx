import type { FunctionComponent } from 'react';
import React, { useCallback } from 'react';
import { IconButton } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleMetadata } from '../../../clients/groups';
import useMemberPermissions from '../../../hooks/useMemberPermissions';
import useMemberRoleActions from '../../../hooks/useMemberRoleActions';
import type { GroupMembersMenuState, Member } from '../../../utils/constants';

export type RemoveFromRoleButtonProps = {
  member: Member;
  menuState: GroupMembersMenuState;
  role: GroupRoleMetadata | null;
};

/** Removes a member from the role currently being configured. */
const RemoveFromRoleButton: FunctionComponent<RemoveFromRoleButtonProps> = ({
  member,
  menuState,
  role,
}) => {
  const { translate } = useTranslation();
  const { canAssignRoleId } = useMemberPermissions();
  const { memberRoles, removeRole } = useMemberRoleActions(member, menuState);

  const onRemove = useCallback(() => {
    if (role) {
      removeRole(role);
    }
  }, [removeRole, role]);

  const isStillInRole = memberRoles.some((memberRole) => memberRole.id === role?.id);

  if (!role || !canAssignRoleId(role.id) || !isStillInRole) {
    return null;
  }

  return (
    <IconButton
      icon='icon-regular-circle-minus'
      ariaLabel={translate('Action.Remove')}
      variant='Utility'
      size='Small'
      className='shrink-0'
      onClick={onRemove}
    />
  );
};

export default RemoveFromRoleButton;
