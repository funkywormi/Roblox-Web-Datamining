import type { FunctionComponent } from 'react';
import React from 'react';
import { Icon, List, ListItem, ListItemChevronTrailingAccessory } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleMetadata, GroupUserWithRoles } from '../../clients/groups';
import RoleIcon from '../../members/components/common/RoleIcon';
import { MAX_EARLY_TESTERS } from '../../utils/constants';
import DisabledPermissionTooltip from './DisabledPermissionTooltip';
import EarlyTesterMemberRow from './EarlyTesterMemberRow';
import MemberCountChip from './MemberCountChip';

export type ManageEarlyTestersPanelProps = {
  role: GroupRoleMetadata;
  members: GroupUserWithRoles[];
  maxMembers: number;
  onOpenRolePicker: () => void;
  onOpenAddMembers: () => void;
  onRemoveMember: (member: GroupUserWithRoles) => void;
  canChangeRole?: boolean;
  canEditMembers?: boolean;
  readOnlyTooltip?: string;
};

const ManageEarlyTestersPanel: FunctionComponent<ManageEarlyTestersPanelProps> = ({
  role,
  members,
  maxMembers,
  onOpenRolePicker,
  onOpenAddMembers,
  onRemoveMember,
  canChangeRole = true,
  canEditMembers = true,
  readOnlyTooltip = '',
}) => {
  const { translate } = useTranslation();
  const isAtCapacity = members.length >= maxMembers;
  const addMembersLocked = !canEditMembers || isAtCapacity;
  const addMembersTooltip = !canEditMembers
    ? readOnlyTooltip
    : translate('Error.ReachedEarlyTesterLimit', {
        maxEarlyTesters: String(MAX_EARLY_TESTERS),
      });

  const addMembersRow = (
    <ListItem
      isContained
      size='Small'
      divider={members.length > 0 ? 'Full' : 'None'}
      title={translate('Heading.AddMembers')}
      trailing={<ListItemChevronTrailingAccessory />}
      onSelect={addMembersLocked ? undefined : onOpenAddMembers}
      className={addMembersLocked ? 'pointer-events-none opacity-[0.5]' : undefined}
    />
  );

  const roleButton = (
    <button
      type='button'
      disabled={!canChangeRole}
      onClick={canChangeRole ? onOpenRolePicker : undefined}
      className={`items-center gap-small padding-medium bg-none stroke-thin stroke-emphasis radius-medium flex flex-row width-[260px] max-width-full${
        canChangeRole ? '' : ' pointer-events-none opacity-[0.5]'
      }`}>
      <RoleIcon roleId={role.id} color={role.color} isPrivate={role.isPrivate} size='Small' />
      <span className='content-default text-body-medium grow-1 shrink-1 basis-0 text-align-x-left text-truncate-end'>
        {role.name}
      </span>
      <Icon name='icon-regular-chevron-large-down' size='Small' />
    </button>
  );

  return (
    <div className='gap-medium flex flex-col'>
      <div className='gap-xsmall flex flex-col'>
        <div className='items-center flex flex-row justify-between'>
          <span className='content-emphasis text-heading-small'>
            {translate('Heading.ManageEarlyTesterMembers')}
          </span>
          <MemberCountChip count={members.length} max={maxMembers} />
        </div>
        <span className='content-muted text-body-medium'>
          {translate('Description.ManageEarlyTesterMembers', {
            maxEarlyTesters: String(maxMembers),
          })}
        </span>
      </div>
      <DisabledPermissionTooltip
        isDisabled={!canChangeRole}
        title={readOnlyTooltip}
        className='width-fit cursor-not-allowed'>
        {roleButton}
      </DisabledPermissionTooltip>
      <List className='stroke-thin stroke-default radius-medium flex flex-col clip'>
        <DisabledPermissionTooltip isDisabled={addMembersLocked} title={addMembersTooltip}>
          {addMembersRow}
        </DisabledPermissionTooltip>
        {members.map((member, index) => (
          <EarlyTesterMemberRow
            key={member.user?.userId}
            member={member}
            divider={index === members.length - 1 ? 'None' : 'Full'}
            onRemove={onRemoveMember}
            canRemove={canEditMembers}
            readOnlyTooltip={readOnlyTooltip}
          />
        ))}
      </List>
    </div>
  );
};

export default ManageEarlyTestersPanel;
