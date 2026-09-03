import type { FunctionComponent } from 'react';
import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Button,
  Icon,
  IconButton,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import useMemberPermissions from '../../hooks/useMemberPermissions';
import useMemberRoleActions from '../../hooks/useMemberRoleActions';
import type { GroupMembersMenuState, Member, MemberRole } from '../../utils/constants';
import { isManageableRole } from '../../utils/groupUtils';
import RolesList from './actions/RolesList';
import RoleIcon from './common/RoleIcon';

const OVERFLOW_AFFORDANCE_WIDTH = 56;
const CHIP_GAP_WIDTH = 8;

const measureVisibleChips = (container: HTMLElement): number => {
  const available = container.clientWidth;
  const chips = [...container.querySelectorAll<HTMLElement>('[data-role-chip]')];
  const widthWithGap = (chip: HTMLElement) => chip.offsetWidth + CHIP_GAP_WIDTH;

  const affordanceWidth =
    container.querySelector<HTMLElement>('[data-role-affordance]')?.offsetWidth ?? 0;
  const totalChipWidth = chips.reduce((total, chip) => total + widthWithGap(chip), 0);

  if (totalChipWidth + affordanceWidth <= available) {
    return chips.length;
  }

  const budget = available - OVERFLOW_AFFORDANCE_WIDTH;
  let used = 0;
  let fitCount = 0;
  for (const chip of chips) {
    used += widthWithGap(chip);
    if (used > budget && fitCount > 0) {
      break;
    }
    fitCount += 1;
  }

  return Math.max(1, fitCount);
};

export type GroupMemberRoleChipsProps = {
  member: Member;
  menuState: GroupMembersMenuState;
};

/**
 * The member's roles as chips, collapsing to a "+N more" chip when they overflow the row.
 * Chips are removable and new roles can be added when the role's resolved `canAssign` allows it.
 */
const GroupMemberRoleChips: FunctionComponent<GroupMemberRoleChipsProps> = ({
  member,
  menuState,
}) => {
  const { translate } = useTranslation();
  const { assignableRoles, canAssignRoleId } = useMemberPermissions();
  const { memberRoles, addRole, removeRole } = useMemberRoleActions(member, menuState);

  const containerRef = useRef<HTMLDivElement>(null);
  const measuredWidthRef = useRef(-1);
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  const chipRoles = useMemo(() => memberRoles.filter(isManageableRole), [memberRoles]);

  const [prevRoleCount, setPrevRoleCount] = useState(chipRoles.length);
  if (prevRoleCount !== chipRoles.length) {
    setPrevRoleCount(chipRoles.length);
    setVisibleCount(null);
  }

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(() => {
      if (container.clientWidth !== measuredWidthRef.current) {
        setVisibleCount(null);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (visibleCount !== null || !container) {
      return;
    }
    measuredWidthRef.current = container.clientWidth;
    setVisibleCount(measureVisibleChips(container));
  }, [visibleCount]);

  const renderedCount = visibleCount ?? chipRoles.length;
  const overflowCount = Math.max(0, chipRoles.length - renderedCount);

  const renderChip = useCallback(
    (role: MemberRole) => {
      const isRemovable = canAssignRoleId(role.id);

      return (
        <Button
          key={role.id}
          data-role-chip
          variant='Standard'
          size='Small'
          className='shrink-0 !radius-circle'
          isDisabled={!isRemovable}
          onClick={isRemovable ? () => removeRole(role) : undefined}>
          <span className='flex items-center gap-xsmall'>
            <RoleIcon roleId={role.id} color={role.color} isPrivate={role.isPrivate} />
            <span className='text-truncate-end'>{role.name}</span>
            {isRemovable && <Icon name='icon-regular-x-small' size='XSmall' />}
          </span>
        </Button>
      );
    },
    [canAssignRoleId, removeRole],
  );

  return (
    <div ref={containerRef} className='flex items-center gap-small min-width-0 grow-1'>
      {chipRoles.slice(0, renderedCount).map(renderChip)}

      {(overflowCount > 0 || assignableRoles.length > 0) && (
        <Popover>
          <PopoverTrigger asChild>
            {overflowCount > 0 ? (
              <Button
                data-role-affordance
                variant='Standard'
                size='Small'
                className='shrink-0 !radius-circle padding-right-medium padding-left-medium'>
                {translate('Label.MoreChips', { count: overflowCount.toString() })}
              </Button>
            ) : (
              <IconButton
                data-role-affordance
                variant='Standard'
                size='Small'
                isCircular
                icon='icon-filled-plus-small'
                ariaLabel={translate('Label.AddRole')}
                className='shrink-0'
              />
            )}
          </PopoverTrigger>
          <PopoverContent align='end' ariaLabel={translate('Label.Roles')}>
            <RolesList
              assignableRoles={assignableRoles}
              memberRoles={memberRoles}
              onAddRole={addRole}
              onRemoveRole={removeRole}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
};

export default GroupMemberRoleChips;
