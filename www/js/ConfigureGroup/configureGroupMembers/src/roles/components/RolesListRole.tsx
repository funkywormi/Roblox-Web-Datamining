import React, { useState } from 'react';
import type { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { Button, Icon } from '@rbx/foundation-ui';
import { buttonClasses, Grid, makeStyles } from '@rbx/ui';
import type { GroupRoleColorType } from '../../clients/groups';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import RoleIcon from '../../members/components/common/RoleIcon';
import { DefaultMemberRoleId, GuestRoleRank } from '../../utils/constants';
import { canViewAnyRoleTab } from '../../utils/groupPermissions';

const useRolesSidebarStyles = makeStyles()((theme) => ({
  roleButtonContainer: {
    width: '100%',
    height: 'fit-content !important',
    flexGrow: '1 !important',
    display: 'flex',
    justifyContent: 'flex-start',
    textTransform: 'none',
    [`&.${buttonClasses.endIcon}`]: {
      flexShrink: 0,
      flexGrow: 0,
      justifySelf: 'flex-end',
    },
    [`& > span:nth-child(2)`]: {
      flexGrow: 1,
      maxWidth: '100%',
      minWidth: 0,
      [`& > span:nth-child(1)`]: {
        width: '100%',
      },
    },
  },
  buttonContentContainer: {
    width: '100%',
    maxWidth: '100%',
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '6px 0px',
  },
  textContainer: {
    display: 'block',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    flexGrow: 1,
    flexShrink: 1,
    textAlign: 'left',
    paddingLeft: theme.spacing(1),
  },
  selectedButton: {
    borderRadius: 4,
    background: theme.palette.states.selected,
  },
  disabledButton: {
    '&&.Mui-disabled': {
      color: 'var(--inverse-content-default)',
    },
  },
}));

type TRolesListRoleProps = {
  roleId: string;
  roleRank?: number;
  roleName: string;
  roleColor: GroupRoleColorType;
  isPrivate?: boolean;
  isNewRole: boolean;
  disabled: boolean;
  isSelected: boolean;
  isMobile: boolean;
  isAnyRoleDragging?: boolean;
  isDragging?: boolean;
  onClickRole: () => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null | undefined;
};

const RolesListRole: React.FC<TRolesListRoleProps> = ({
  roleId,
  roleRank,
  roleName,
  roleColor,
  isPrivate = false,
  isNewRole,
  disabled,
  isSelected,
  isMobile,
  isAnyRoleDragging = false,
  isDragging = false,
  onClickRole,
  dragHandleProps,
}) => {
  const {
    classes: {
      roleButtonContainer,
      selectedButton,
      textContainer,
      buttonContentContainer,
      disabledButton,
    },
    cx,
  } = useRolesSidebarStyles();
  const { isOwner, permissions, rolePermissions } = useCurrentGroup();
  const [isHovered, setIsHovered] = useState(false);

  const permissionsForRole = rolePermissions?.[roleId];
  const isDefaultMemberRole = roleId === DefaultMemberRoleId;
  const canViewAnyTab = canViewAnyRoleTab(
    permissionsForRole,
    isDefaultMemberRole,
    roleRank === GuestRoleRank,
    isOwner,
  );
  const isExistingRoleDisabled = !isNewRole && !canViewAnyTab;

  const canCreateRoles = isOwner === true || permissions?.canCreateRoles === true;
  const isNewRoleDisabled = isNewRole && !canCreateRoles;

  const shouldShowDragHandleIcon = isMobile || isDragging || (!isAnyRoleDragging && isHovered);

  return (
    <Button
      data-testid={`role-button-${roleId}`}
      key={roleId}
      size='Small'
      color='primary'
      variant={isSelected ? 'Standard' : 'Utility'}
      isDisabled={disabled || isNewRoleDisabled || isExistingRoleDisabled}
      onClick={onClickRole}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cx(
        roleButtonContainer,
        {
          [selectedButton]: isSelected,
        },
        (disabled || isNewRoleDisabled || isExistingRoleDisabled) && disabledButton,
      )}>
      <Grid container className={buttonContentContainer}>
        <div className='flex grow-1 flex-row items-center width-full'>
          <RoleIcon
            roleId={roleId === '' ? null : Number(roleId)}
            color={roleColor}
            isPrivate={isPrivate}
            size='Medium'
          />
          <span className={textContainer}>{roleName}</span>
          {!!dragHandleProps && (
            <span
              className={`flex grow-0 shrink-0 ${!shouldShowDragHandleIcon ? 'min-w-0 w-0' : ''}`}
              {...dragHandleProps}>
              <Icon
                name='icon-regular-three-bars-horizontal-triangles-vertical'
                size='Medium'
                className={shouldShowDragHandleIcon ? 'visible' : 'invisible'}
              />
            </span>
          )}
        </div>
      </Grid>
    </Button>
  );
};

export default RolesListRole;
