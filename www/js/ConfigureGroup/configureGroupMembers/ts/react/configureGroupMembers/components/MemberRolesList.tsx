import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Chip,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Button,
  Icon,
  Tooltip,
  TooltipTrigger
} from '@rbx/foundation-ui';
import classNames from 'classnames';
import { useTranslation } from 'react-utilities';
import RoleManagementMenu from './RoleManagementMenu';
import { Role, AssignedRole } from '../../shared/types';
import RoleIcon from '../../shared/components/RoleIcon';

type MemberRolesListProps = {
  className?: string;
  currentRoles?: Array<AssignedRole>;
  // Roles the acting user may add or remove.
  manageableRoles?: Array<Role>;
  assignRoleCallback?: (roleId: number) => Promise<void>;
  unassignRoleCallback?: (roleId: number) => Promise<void>;
};

const MORE_CHIP_BUFFER_PX = 50;
const ROLE_CHIP_CLASSNAME = 'group-role-chip';

const MemberRolesList: React.FC<MemberRolesListProps> = ({
  className,
  currentRoles,
  manageableRoles,
  assignRoleCallback,
  unassignRoleCallback
}) => {
  const { translate } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [hiddenChipsCount, setHiddenChipsCount] = useState<number>(0);

  const updateChipVisibility = useCallback(() => {
    let hiddenCount = 0;

    if (containerRef.current) {
      const maxRightEdge = containerRef.current.offsetWidth - MORE_CHIP_BUFFER_PX;
      const chipNodes = containerRef.current.childNodes;

      // reset all chips to visible for layout calculations
      for (let i = 0; i < chipNodes.length; i++) {
        const chipNode = chipNodes[i] as HTMLElement;
        chipNode.style.display = 'unset';
      }

      for (let i = 0; i < chipNodes.length; i++) {
        const chipNode = chipNodes[i] as HTMLElement;
        if (chipNode.classList.contains(ROLE_CHIP_CLASSNAME)) {
          const chipRightEdge = chipNode.offsetLeft + chipNode.offsetWidth;
          if (chipRightEdge < maxRightEdge) {
            chipNode.style.display = 'unset';
          } else {
            // short-circuit here, as all following chips should also be out of bounds
            // iterate backwards so hiding elements doesn't affect subsequent children
            for (let j = chipNodes.length - 1; j >= i; j--) {
              const otherChipNode = chipNodes[j] as HTMLElement;
              if (otherChipNode.classList.contains(ROLE_CHIP_CLASSNAME)) {
                otherChipNode.style.display = 'none';
                hiddenCount += 1;
              }
            }
            break;
          }
        }
      }
    }

    setHiddenChipsCount(hiddenCount);
  }, []);

  const manageableRolesById = useMemo(() => {
    const map: Record<number, Role> = {};
    manageableRoles?.forEach(role => {
      map[role.id] = role;
    });
    return map;
  }, [manageableRoles]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver(() => {
      updateChipVisibility();
    });

    resizeObserver.observe(containerRef.current);

    // eslint-disable-next-line consistent-return
    return () => {
      resizeObserver.disconnect();
    };
  }, [updateChipVisibility]);

  useEffect(() => {
    updateChipVisibility();
  }, [currentRoles, manageableRoles, updateChipVisibility]);

  return (
    <div
      className={classNames('flex gap-small min-width-0 relative', className)}
      ref={containerRef}>
      {currentRoles?.map(assignedRole => {
        const canRemoveRole = !!manageableRolesById[assignedRole.id];
        const roleChip = (
          <Button
            key={assignedRole.id}
            variant='Standard'
            size='Small'
            className={classNames(ROLE_CHIP_CLASSNAME, 'shrink-0', 'role-chip')}>
            <div className='flex grow-1 min-width-0 items-center'>
              <RoleIcon role={assignedRole} size='Small' />
              <span className='grow-1 min-width-0 text-align-x-left text-no-wrap text-truncate-end'>
                {assignedRole.name}
              </span>
              {unassignRoleCallback && canRemoveRole && (
                <Icon
                  className='margin-left-[4px] content-default hover:content-emphasis'
                  name='icon-regular-x-small'
                  size='Small'
                  onClick={() => unassignRoleCallback?.(assignedRole.id)}
                  aria-label={translate('Action.RemoveRole')}
                />
              )}
            </div>
          </Button>
        );

        if (!assignedRole.isPrivate) {
          return roleChip;
        }

        return (
          <Tooltip
            key={assignedRole.id}
            position='top-center'
            title={translate('Info.PrivateRole')}>
            <TooltipTrigger asChild>{roleChip}</TooltipTrigger>
          </Tooltip>
        );
      })}
      {manageableRoles?.length || hiddenChipsCount ? (
        <Popover>
          <PopoverTrigger className='bg-none stroke-none padding-none shrink-0'>
            <Chip
              as='button'
              text={`+${hiddenChipsCount > 0 ? hiddenChipsCount : ''}`}
              variant='Standard'
              size='Medium'
              isChecked={false}
            />
          </PopoverTrigger>
          <PopoverContent ariaLabel='content'>
            <RoleManagementMenu
              addRoleCallback={assignRoleCallback}
              removeRoleCallback={unassignRoleCallback}
              currentRoles={currentRoles}
              manageableRoles={manageableRoles}
            />
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  );
};

export default MemberRolesList;
