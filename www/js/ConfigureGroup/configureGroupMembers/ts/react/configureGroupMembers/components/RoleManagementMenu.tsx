import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Icon, Menu, MenuItem, MenuSection, MenuSeparator } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { Role, AssignedRole } from '../../shared/types';
import SearchableList from '../../shared/components/SearchableList';
import RoleIcon from '../../shared/components/RoleIcon';

type RoleManagementMenuProps = {
  currentRoles?: Array<AssignedRole>;
  // Roles the acting user may add or remove.
  manageableRoles?: Array<Role>;
  hideTrailingIcons?: boolean;
  addRoleCallback?: (roleId: number) => Promise<void>;
  removeRoleCallback?: (roleId: number) => Promise<void>;
};

const removeIcon = <Icon name='icon-regular-minus' size='Small' />;
const addIcon = <Icon name='icon-regular-plus-large' size='Small' />;

const MENU_MAX_HEIGHT_PX = 350;

const RoleManagementMenu: React.FC<RoleManagementMenuProps> = ({
  currentRoles,
  manageableRoles,
  hideTrailingIcons,
  addRoleCallback,
  removeRoleCallback
}) => {
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [menuHeight, setMenuHeight] = useState<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  const containerStyle = useMemo(() => {
    // lock the menu from changing height so it doesn't jump around the screen
    return {
      ...(menuHeight ? { minHeight: `${menuHeight}px` } : {})
    };
  }, [menuHeight]);

  useLayoutEffect(() => {
    if (containerRef.current) {
      const { height } = containerRef.current.getBoundingClientRect();
      if (menuHeight === undefined || height > menuHeight) {
        setMenuHeight(Math.min(height, MENU_MAX_HEIGHT_PX));
      }
    }
  }, [currentRoles?.length, manageableRoles?.length, menuHeight]);

  const onAddRoleClicked = addRoleCallback
    ? async (roleId: number) => {
        setIsLoading(true);
        try {
          await addRoleCallback(roleId);
        } catch {
          systemFeedbackService.warning(translate('NetworkError'));
        }
        setIsLoading(false);
      }
    : undefined;

  const onRemoveRoleClicked = removeRoleCallback
    ? async (roleId: number) => {
        setIsLoading(true);
        try {
          await removeRoleCallback(roleId);
        } catch {
          systemFeedbackService.warning(translate('NetworkError'));
        }
        setIsLoading(false);
      }
    : undefined;

  const searchMatchFunction = (role: Role, query: string) => {
    if (query === '') return true;
    return role.name?.toLowerCase().includes(query.toLowerCase()) ?? false;
  };

  const addableUnassignedRoles = useMemo(() => {
    return manageableRoles?.filter(role => !currentRoles?.find(r => r.id === role.id));
  }, [manageableRoles, currentRoles]);

  return (
    <Menu size='Small'>
      <div className='group-role-management-menu' style={containerStyle} ref={containerRef}>
        {currentRoles?.length ? (
          <MenuSection>
            <div className='text-caption-medium padding-x-medium padding-y-small'>
              {translate('Label.CurrentRoles')}
            </div>
            <React.Fragment>
              {currentRoles.map(assignedRole => {
                const canRemoveRole = Boolean(manageableRoles?.find(r => r.id === assignedRole.id));
                return (
                  <MenuItem
                    key={assignedRole.id}
                    className='group-role-management-menu-item'
                    value={assignedRole.id.toString()}
                    title={assignedRole.name}
                    leading={<RoleIcon role={assignedRole} size='XSmall' />}
                    trailing={!hideTrailingIcons && canRemoveRole ? removeIcon : null}
                    disabled={!canRemoveRole || isLoading}
                    onSelect={() => onRemoveRoleClicked?.(assignedRole.id)}
                  />
                );
              })}
            </React.Fragment>
          </MenuSection>
        ) : null}
        {addableUnassignedRoles?.length ? (
          <React.Fragment>
            {currentRoles?.length ? <MenuSeparator /> : null}
            <MenuSection>
              <div className='text-caption-medium padding-x-medium padding-y-small'>
                {translate('Action.AddRoles')}
              </div>
              <SearchableList
                items={addableUnassignedRoles}
                searchInputSize='Small'
                searchContainerClassName='group-role-management-menu-item padding-x-small padding-bottom-small'
                matchFunction={searchMatchFunction}
                renderItem={(role: Role) => (
                  <MenuItem
                    key={role.id}
                    className='group-role-management-menu-item'
                    value={role.id.toString()}
                    title={role.name}
                    leading={<RoleIcon role={role} size='XSmall' />}
                    trailing={!hideTrailingIcons ? addIcon : null}
                    disabled={isLoading}
                    onSelect={() => onAddRoleClicked?.(role.id)}
                  />
                )}
              />
            </MenuSection>
          </React.Fragment>
        ) : null}
      </div>
    </Menu>
  );
};

export default RoleManagementMenu;
