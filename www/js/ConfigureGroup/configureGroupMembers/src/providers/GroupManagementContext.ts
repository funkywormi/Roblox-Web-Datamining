import { createContext } from 'react';
import type { GroupPermissions, GroupRolePermissions } from '../clients/groups';
import type { Organization } from '../clients/organizationApi';
import type {
  GroupData,
  AuthenticatedUser,
  GroupManagementSurface,
  GroupManagementNavigation,
  GroupManagementStudio,
  GroupManagementLogger,
} from '../utils/types';

export interface GroupManagementContextValue {
  group: GroupData;
  user: AuthenticatedUser;
  surface: GroupManagementSurface;
  navigation: GroupManagementNavigation;
  organization: Organization | null | undefined;
  permissions: GroupPermissions | null | undefined;
  rolePermissions?: GroupRolePermissions | null;
  isOwner?: boolean;
  refreshOrganization: () => void;
  refreshPermission: () => Promise<void>;
  showToast: (message: string, isError?: boolean) => void;
  isOrganizationRefreshRequired: boolean;
  isOrganizationLoading: boolean;
  studio?: GroupManagementStudio;
  unifiedLogger?: GroupManagementLogger;
}

const GroupManagementContext = createContext<GroupManagementContextValue | null>(null);
GroupManagementContext.displayName = 'GroupManagement';

export default GroupManagementContext;
