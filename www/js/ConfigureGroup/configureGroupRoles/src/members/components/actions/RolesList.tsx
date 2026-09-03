import type { ChangeEvent, FunctionComponent } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Icon,
  Menu,
  MenuItem,
  MenuLabel,
  MenuSection,
  MenuSeparator,
  TextInput,
} from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import type { GroupRoleMetadata } from '../../../clients/groups';
import type { MemberRole } from '../../../utils/constants';
import { isManageableRole } from '../../../utils/groupUtils';
import RoleIcon from '../common/RoleIcon';

const SEARCH_THRESHOLD = 8;

export type RolesListProps = {
  assignableRoles: GroupRoleMetadata[];
  memberRoles: MemberRole[];
  onAddRole: (role: GroupRoleMetadata) => void;
  onRemoveRole: (role: MemberRole) => void;
};

/**
 * Menu showing every role the member already holds alongside the roles the authenticated user can
 * still add. Current roles the user cannot assign are listed but not removable.
 */
const RolesList: FunctionComponent<RolesListProps> = ({
  assignableRoles,
  memberRoles,
  onAddRole,
  onRemoveRole,
}) => {
  const { translate } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');

  // Keyed off every assignable role so the box doesn't appear and disappear as roles are added.
  const showSearch = assignableRoles.length > SEARCH_THRESHOLD;

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setSearchTerm(event.target.value),
    [],
  );

  const assignableRoleIds = useMemo(
    () => new Set(assignableRoles.map((role) => role.id)),
    [assignableRoles],
  );

  const { currentRoles, addableRoles, hasAddableRoles } = useMemo(() => {
    const memberRoleIds = new Set(memberRoles.map((role) => role.id));
    const unassignedRoles = assignableRoles
      .filter((role) => isManageableRole(role) && !memberRoleIds.has(role.id))
      .toReversed();
    const matchesSearch = (role: GroupRoleMetadata) =>
      !searchTerm || (role.name ?? '').toLowerCase().includes(searchTerm.toLowerCase());

    return {
      currentRoles: memberRoles.filter(isManageableRole),
      addableRoles: unassignedRoles.filter(matchesSearch),
      hasAddableRoles: unassignedRoles.length > 0,
    };
  }, [assignableRoles, memberRoles, searchTerm]);

  return (
    <div className='flex flex-col gap-small [width:240px]'>
      <Menu size='Small'>
        <div className='max-height-[380px] width-[240px] clip-x scroll-y [&::-webkit-scrollbar]:width-[12px] [&::-webkit-scrollbar]:bg-[transparent] [&::-webkit-scrollbar-thumb]:bg-[var(--color-shift-300)] [&::-webkit-scrollbar-thumb]:[border:3px_solid_var(--color-surface-100)] [&::-webkit-scrollbar-thumb]:radius-[10px]'>
          {currentRoles.length > 0 && (
            <>
              <MenuLabel title={translate('Label.CurrentRoles')} />
              <MenuSection>
                {currentRoles.map((role) => {
                  const isRemovable = assignableRoleIds.has(role.id);
                  return (
                    <MenuItem
                      key={role.id}
                      value={`remove-${role.id ?? ''}`}
                      title={role.name ?? ''}
                      leading={
                        <RoleIcon roleId={role.id} color={role.color} isPrivate={role.isPrivate} />
                      }
                      trailing={
                        isRemovable ? <Icon name='icon-regular-minus' size='Small' /> : null
                      }
                      disabled={!isRemovable}
                      onSelect={() => onRemoveRole(role)}
                    />
                  );
                })}
              </MenuSection>
            </>
          )}

          {currentRoles.length > 0 && hasAddableRoles && <MenuSeparator />}

          {hasAddableRoles && (
            <>
              <MenuLabel title={translate('Label.AddRoles')} />
              {showSearch && (
                <div className='padding-x-small padding-bottom-small'>
                  <TextInput
                    size='Small'
                    value={searchTerm}
                    leadingIconName='icon-regular-magnifying-glass'
                    placeholder={translate('Label.SearchRoles')}
                    onChange={handleSearchChange}
                  />
                </div>
              )}
              {addableRoles.length > 0 ? (
                <MenuSection>
                  {addableRoles.map((role) => (
                    <MenuItem
                      key={role.id}
                      value={`add-${role.id ?? ''}`}
                      title={role.name ?? ''}
                      leading={
                        <RoleIcon roleId={role.id} color={role.color} isPrivate={role.isPrivate} />
                      }
                      trailing={<Icon name='icon-filled-plus-small' size='Small' />}
                      onSelect={() => onAddRole(role)}
                    />
                  ))}
                </MenuSection>
              ) : (
                <div className='padding-medium text-align-x-center text-body-small content-muted'>
                  {translate('Label.NoResults')}
                </div>
              )}
            </>
          )}
        </div>
      </Menu>
    </div>
  );
};

export default RolesList;
