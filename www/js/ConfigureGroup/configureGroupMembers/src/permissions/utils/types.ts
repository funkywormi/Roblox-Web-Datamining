import type {
  PermissionRequest,
  PermissionResponse as APIPermissionResponse,
} from '@rbx/client-organizations-service-api/v1';
import type { GroupRoleColorType } from '../../clients/groups';

export enum EntityTypes {
  UNIVERSE = 'Universe',
  GROUP = 'Group',
}

export enum CreatorTypes {
  MEMBER_ROLE = 'Member',
  GUEST_ROLE = 'GuestRole',
  ROLE = 'Role',
  USER = 'User',
  LEGACY_ROLE = 'LegacyRole',
  GROUP = 'Group',
}

export enum CreatorFilterChipTypes {
  ALL = 'All',
  USER = 'User',
  ROLE = 'Role',
}

export type PermissionResponse = APIPermissionResponse & {
  isInherited?: boolean;
};

export type { PermissionRequest };

export type DevelopPermissionsResponse = {
  data?: {
    userId?: string;
    userName?: string;
    action?: string;
    groupId?: string;
    groupName?: string;
    rolesetId?: string;
    rolesetName?: string;
    rank?: string;
  }[];
};

export type EntityPermissionsMetadata = PermissionGroupMetadata[];

export interface PermissionGroupMetadata {
  groupId: string;
  permissions: PermissionMetadata[];
}

export interface PermissionMetadata {
  permissionId: string;
  inheritsFrom?: string[];
}

export type CreatorDetails = {
  id: string;
  name: string;
  color?: GroupRoleColorType;
  isPrivate?: boolean;
  disabled?: boolean;
  type: CreatorTypes;
  subtext?: string;
  link?: string;
};

export type EntityDetails = {
  id: string;
  type: EntityTypes;
  name?: string;
  owner?: CreatorDetails;
};

export type CreatorFilter = Array<CreatorTypes | CreatorDetails>;

export type CreatorGroupDetails = {
  creatorsList: CreatorDetails[];
  type: CreatorTypes;
};

export type PermissionsUIConfig = {
  showMobileView?: boolean;
  singleCreatorExperience?: boolean;
  showConfirmationOnSave?: boolean;
  showUniverseTicketReviewerPermission?: boolean;
};
