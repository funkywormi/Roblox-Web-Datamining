import React from 'react';
import { Icon } from '@rbx/foundation-ui';
import { useTheme } from 'react-utilities';
import classNames from 'classnames';
import { Role, AssignedRole, RoleColorValues } from '../types';
import { colorIntToColorTokenMap } from '../constants/groupRoleColorConstants';
import useGuacConfig from '../hooks/useGuacConfig';

interface RoleIconProps {
  role: Role | AssignedRole;
  size: 'XSmall' | 'Small' | 'Medium' | 'Large';
  className?: string;
}

const getIconName = (role: Role | AssignedRole) => {
  if (role?.isBase) {
    return 'icon-filled-square-person';
  }
  return role?.isPrivate
    ? 'icon-filled-lock-closed'
    : 'icon-filled-person-rectangle-horizontal-line';
};

const RoleIcon = ({ role, size, className }: RoleIconProps): JSX.Element | null => {
  const theme = useTheme();
  const { isLoading: isLoadingGuac, data: groupDetailsUi } = useGuacConfig('group-details-ui');

  if (!isLoadingGuac && !groupDetailsUi?.displayRoleColor) {
    return null;
  }

  const iconName = getIconName(role);
  const colorToken =
    colorIntToColorTokenMap[role.color ?? RoleColorValues.Invalid] ??
    colorIntToColorTokenMap[RoleColorValues.Invalid];
  const colorCssVar = theme === 'dark' ? colorToken.Dark : colorToken.Light;
  return (
    <Icon
      name={iconName}
      style={{ color: `var(--${colorCssVar})` }}
      size={size}
      className={classNames(className, 'role-icon')}
    />
  );
};

export default RoleIcon;
