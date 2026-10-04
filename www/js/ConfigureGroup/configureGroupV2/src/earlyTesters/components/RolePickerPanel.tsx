import type { FunctionComponent } from 'react';
import React from 'react';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleMetadata } from '../../clients/groups';
import EarlyTesterRoleList from './EarlyTesterRoleList';

export type RolePickerPanelProps = {
  roles: GroupRoleMetadata[];
  selectedRoleId?: number;
  onSelectRole: (role: GroupRoleMetadata) => void;
};

/**
 * Inline role picker for a universe that does not have an early-tester role yet.
 */
const RolePickerPanel: FunctionComponent<RolePickerPanelProps> = ({
  roles,
  selectedRoleId,
  onSelectRole,
}) => {
  const { translate } = useTranslation();

  return (
    <div className='gap-medium flex flex-col'>
      <div className='gap-xsmall flex flex-col'>
        <span className='content-emphasis text-heading-small'>
          {translate('Heading.EarlyTesterRole')}
        </span>
        <span className='content-muted text-body-medium'>
          {translate('Description.EarlyTesterRole')}
        </span>
      </div>
      <EarlyTesterRoleList
        roles={roles}
        selectedRoleId={selectedRoleId}
        onSelectRole={onSelectRole}
      />
    </div>
  );
};

export default RolePickerPanel;
