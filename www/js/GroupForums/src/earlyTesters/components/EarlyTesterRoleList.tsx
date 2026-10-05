import type { FunctionComponent } from 'react';
import React from 'react';
import { Icon, List, ListItem } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleMetadata } from '../../clients/groups';
import RoleIcon from '../../members/components/common/RoleIcon';
import { MAX_EARLY_TESTERS } from '../../utils/constants';

export type EarlyTesterRoleListProps = {
  roles: GroupRoleMetadata[];
  selectedRoleId?: number;
  onSelectRole: (role: GroupRoleMetadata) => void;
  /** The dialog stretches each row. The inline picker uses a fixed 440px row. */
  isFullWidth?: boolean;
};

const EarlyTesterRoleList: FunctionComponent<EarlyTesterRoleListProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
  isFullWidth = false,
}) => {
  const { translate } = useTranslation();

  return (
    <List className='gap-xxsmall flex flex-col'>
      {roles.map((role) => {
        const isEligible = (role.memberCount ?? 0) <= MAX_EARLY_TESTERS;
        const isSelected = selectedRoleId === role.id;

        return (
          <ListItem
            key={role.id}
            isContained
            size='Small'
            divider='None'
            title={role.name}
            description={isEligible ? undefined : translate('Description.TooManyMembers')}
            leading={
              <RoleIcon
                roleId={role.id}
                color={role.color}
                isPrivate={role.isPrivate}
                size='Small'
              />
            }
            trailing={isSelected ? <Icon name='icon-regular-check' size='Small' /> : undefined}
            onSelect={isEligible ? () => onSelectRole(role) : undefined}
            className={`${isFullWidth ? 'width-full' : 'width-[440px]'} max-width-full radius-medium padding-x-small [&_.padding-y-large]:padding-y-medium ${
              isSelected ? 'stroke-thin stroke-system-contrast' : ''
            } ${isEligible ? '' : '[&_.content-emphasis]:content-muted'}`}
          />
        );
      })}
    </List>
  );
};

export default EarlyTesterRoleList;
