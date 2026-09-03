import React from 'react';
import { withTranslations } from 'react-utilities';
import classNames from 'classnames';
import { Dropdown, Menu, MenuItem, MenuSection, Button, Chip } from '@rbx/foundation-ui';
import { groupsConfig } from '../translation.config';
import { Role } from '../types';
import RoleIcon from './RoleIcon';

type RoleListItem = Role & {
  pillText?: string;
  isDisabled?: boolean;
};

export type ConfigureRolesListProps = {
  roles: RoleListItem[];
  selectedRoleId?: number;
  onSelectRoleId: (roleId: number) => void;
  isAddButtonVisible?: boolean;
  isAddButtonDisabled?: boolean;
  onAddRole: () => void;
  actionText: string;
};

const ConfigureRolesList = ({
  roles,
  selectedRoleId,
  onSelectRoleId,
  isAddButtonVisible = true,
  isAddButtonDisabled = false,
  onAddRole,
  actionText
}: ConfigureRolesListProps): JSX.Element => {
  return (
    <div className='group-config-roles-list-container'>
      <div className='menu-vertical-container'>
        <div className='group-config-roles-list'>
          {roles.map(role => (
            <Button
              key={role.id}
              className={classNames(
                'group-config-roles-list-button',
                role.id === selectedRoleId && 'active'
              )}
              size='Small'
              variant='Standard'
              isDisabled={role.isDisabled}
              onClick={() => onSelectRoleId(role.id)}>
              <div className='flex width-full items-center'>
                <div className='flex grow-1 min-width-0 items-center'>
                  <RoleIcon role={role} size='Small' />
                  <span className='grow-1 min-width-0 text-align-x-left text-no-wrap text-truncate-end'>
                    {role.name}
                  </span>
                </div>
                {role.pillText && (
                  <Chip
                    className='shrink-0 bg-system-contrast content-inverse-system-contrast'
                    as='button'
                    text={role.pillText}
                    variant='Standard'
                    size='Small'
                    isChecked={false}
                  />
                )}
              </div>
            </Button>
          ))}
          {isAddButtonVisible && (
            <Button
              className='group-config-roles-list-add-button'
              variant='Standard'
              size='Medium'
              isDisabled={isAddButtonDisabled}
              onClick={onAddRole}>
              {actionText}
            </Button>
          )}
        </div>
      </div>
      <div className='menu-dropdown-container'>
        <Dropdown
          className='group-config-roles-dropdown'
          size='Small'
          value={selectedRoleId?.toString() || ''}
          placeholder={actionText}
          onValueChange={roleId => {
            onSelectRoleId(Number(roleId));
          }}>
          <Menu>
            <MenuSection>
              {roles.map(role => (
                <MenuItem
                  key={role.id}
                  title={role.name}
                  value={role.id.toString()}
                  disabled={role.isDisabled}
                  leading={<RoleIcon role={role} size='XSmall' />}
                />
              ))}
            </MenuSection>
          </Menu>
        </Dropdown>
        <Button
          className='group-config-roles-list-add-button'
          variant='Standard'
          size='Small'
          onClick={onAddRole}>
          {actionText}
        </Button>
      </div>
    </div>
  );
};

export default withTranslations(ConfigureRolesList, groupsConfig);
