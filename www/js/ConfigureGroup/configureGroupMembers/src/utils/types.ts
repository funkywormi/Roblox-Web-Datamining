import type { ReactNode } from 'react';
import type { UnifiedLogger } from '@rbx/unified-logger';
import type { GroupRoleMetadata } from '../clients/groups';

export enum CreatorType {
  User = 'User',
  Group = 'Group',
}

export enum ConfigureRoleTab {
  Permissions = 'Permissions',
  Members = 'Members',
  Settings = 'Settings',
}

export enum GroupMemberDisplayType {
  Everyone = 'Everyone',
}

export interface RoleCreationMetadata {
  metadata?: GroupRoleMetadata;
  isNewRole?: boolean;
}
export type RoleMetadataForNewRole = Pick<
  GroupRoleMetadata,
  'color' | 'name' | 'rank' | 'description' | 'isPrivate'
>;

export enum GroupManagementSurface {
  Creator = 'Creator',
  Community = 'Community',
}

export interface GroupData {
  id: number;
}

export interface AuthenticatedUser {
  id: number;
  name?: string;
  displayName?: string;
}

export interface GroupManagementNavigation {
  currentRoleId: string | null;
  navigateToRole: ((roleId: string) => void) | null;
  getInvitationLinkUrl?: (organizationId: string) => string;
  getUserProfileUrl?: (userId: number) => string;
  getLegacyRolesUrl?: (groupId: string) => string;
}

export interface GroupManagementStudio {
  open: () => void;
  dialog?: ReactNode;
}

export type GroupManagementLogger = UnifiedLogger;
