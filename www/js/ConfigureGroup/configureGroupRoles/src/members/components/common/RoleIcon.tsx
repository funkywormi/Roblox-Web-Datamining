import type { FunctionComponent } from 'react';
import React from 'react';
import type { TIconSize } from '@rbx/foundation-ui';
import { Icon, Tooltip, TooltipTrigger } from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { useTheme } from '@rbx/ui';
import type { GroupRoleColorType } from '../../../clients/groups';
import TranslationNamespace from '../../../constants/TranslationNamespace';
import { getRoleIconName, getRoleStyle } from '../../../utils/groupUtils';

export type RoleIconProps = {
  roleId?: number | null;
  color?: GroupRoleColorType;
  isPrivate?: boolean;
  size?: TIconSize;
  className?: string;
};

/** Role icon with the role's configured color, showing a lock for private roles. */
const RoleIcon: FunctionComponent<RoleIconProps> = ({
  roleId,
  color,
  isPrivate = false,
  size = 'Small',
  className,
}) => {
  const { palette } = useTheme();
  const { translateWithNamespace } = useTranslation();

  const icon = (
    <Icon
      data-testid={`role-icon-${roleId ?? ''}`}
      name={getRoleIconName(roleId, isPrivate)}
      size={size}
      className={className}
      style={getRoleStyle(color, palette.mode, 'color')}
    />
  );

  if (!isPrivate) {
    return icon;
  }

  return (
    <Tooltip
      position='top-center'
      title={translateWithNamespace(TranslationNamespace.GroupManagement, 'Info.PrivateRole')}>
      <TooltipTrigger asChild>{icon}</TooltipTrigger>
    </Tooltip>
  );
};

export default RoleIcon;
