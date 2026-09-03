import type { ComponentProps, CSSProperties } from 'react';
import type { Icon } from '@rbx/foundation-ui';
import type { GroupRoleColorType } from '../clients/groups';
import type { MemberRole } from './constants';
import {
  DefaultMemberRoleIdNumber,
  DefaultRoleColor,
  GuestRoleRank,
  PickableRoleColorsList,
  RoleColorTokenMap,
} from './constants';

export const getRoleStyle = (
  color?: GroupRoleColorType,
  themeMode?: string,
  property: 'fill' | 'background' | 'color' = 'fill',
): CSSProperties => {
  const resolvedColor = typeof color === 'number' ? color : DefaultRoleColor;
  const tokens = RoleColorTokenMap[resolvedColor];
  const token = themeMode === 'dark' ? tokens.dark : tokens.light;
  return { [property]: `var(--${token})` };
};

export const getRoleIconName = (
  roleId?: number | null,
  isPrivate?: boolean,
): ComponentProps<typeof Icon>['name'] => {
  if (roleId === DefaultMemberRoleIdNumber) {
    return 'icon-filled-square-person';
  }
  if (isPrivate === true) {
    return 'icon-filled-lock-closed';
  }
  return 'icon-filled-person-rectangle-horizontal-line';
};

/**
 * Whether a role is one that can be granted to or taken from an individual member. Every member
 * implicitly holds the default member role, and the deprecated guest role belongs to nobody, so
 * neither belongs on a member's chips or in their role menu.
 */
export const isManageableRole = (role: MemberRole) =>
  role.id !== DefaultMemberRoleIdNumber && role.rank !== GuestRoleRank;

export const getRandomRoleColorType = () => {
  const randomIndex = Math.floor(Math.random() * PickableRoleColorsList.length);
  return PickableRoleColorsList[randomIndex];
};
