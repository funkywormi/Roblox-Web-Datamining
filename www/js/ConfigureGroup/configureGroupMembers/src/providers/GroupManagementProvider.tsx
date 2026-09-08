import type { FunctionComponent, PropsWithChildren } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import groupsClient from '../clients/groups';
import type { GroupPermissions, GroupRolePermissions } from '../clients/groups';
import type { Organization } from '../clients/organizationApi';
import organizationApiClient from '../clients/organizationApi';
import { getResolvedGroupRolePermissions } from '../queries/groupPermissionsQueries';
import type {
  GroupManagementSurface,
  GroupData,
  AuthenticatedUser,
  GroupManagementNavigation,
  GroupManagementStudio,
  GroupManagementLogger,
} from '../utils/types';
import GroupManagementContext from './GroupManagementContext';

type GroupManagementProviderProps = PropsWithChildren<{
  group: GroupData;
  user: AuthenticatedUser;
  surface: GroupManagementSurface;
  navigation: GroupManagementNavigation;
  showToast: (message: string, isError?: boolean) => void;
  isUnified?: boolean;
  studio?: GroupManagementStudio;
  unifiedLogger?: GroupManagementLogger;
}>;

const GroupManagementProvider: FunctionComponent<GroupManagementProviderProps> = ({
  group,
  user,
  surface,
  navigation,
  showToast,
  isUnified = true,
  studio,
  unifiedLogger,
  children,
}) => {
  const [organization, setOrganization] = useState<Organization | undefined | null>();
  const [permissions, setPermissions] = useState<GroupPermissions | undefined | null>();
  const [rolePermissions, setRolePermissions] = useState<GroupRolePermissions | undefined | null>();
  const [isOwner, setIsOwner] = useState(false);
  const [isOrganizationRefreshRequired, setIsOrganizationRefreshRequired] =
    useState<boolean>(false);
  const [isOrganizationLoading, setIsOrganizationLoading] = useState<boolean>(false);

  const groupId = group.id;

  const getPermissions = useCallback(async () => {
    if (groupId === undefined || groupId === null) {
      setPermissions(null);
      setRolePermissions(null);
      setIsOwner(false);
      return;
    }

    try {
      const [permissionsResponse, resolvedRolePermissions, authenticatedUserIsOwner] =
        await Promise.all([
          groupsClient.getGroupPermissions(groupId),
          getResolvedGroupRolePermissions(groupId),
          groupsClient.getAuthenticatedUserIsOwner(groupId).catch(() => false),
        ]);
      setPermissions(permissionsResponse.permissions ?? {});
      setRolePermissions(resolvedRolePermissions);
      setIsOwner(authenticatedUserIsOwner);
    } catch {
      setPermissions(null);
      setRolePermissions(null);
      setIsOwner(false);
    }
  }, [groupId]);

  const getOrganization = useCallback(async () => {
    setIsOrganizationLoading(true);

    try {
      if (!groupId || !isUnified) {
        setOrganization(null);
        setPermissions(null);
        setRolePermissions(null);
        setIsOwner(false);
        return;
      }

      const organizationResponse = await organizationApiClient.organizationClient.getOrganization(
        groupId.toString(),
      );

      setOrganization(organizationResponse);
      await getPermissions();

      setIsOrganizationRefreshRequired(false);
    } catch {
      setOrganization(null);
      setPermissions(null);
      setRolePermissions(null);
      setIsOwner(false);
    } finally {
      setIsOrganizationLoading(false);
    }
  }, [groupId, isUnified, getPermissions]);

  const refreshOrganization = useCallback(() => {
    setIsOrganizationRefreshRequired(true);
    void getOrganization();
  }, [getOrganization]);

  const refreshPermission = useCallback(async () => {
    await getPermissions();
  }, [getPermissions]);

  const value = useMemo(
    () => ({
      group,
      user,
      surface,
      navigation,
      showToast,
      studio,
      unifiedLogger,
      organization,
      permissions,
      rolePermissions,
      isOwner,
      refreshOrganization,
      refreshPermission,
      isOrganizationRefreshRequired,
      isOrganizationLoading,
    }),
    [
      group,
      user,
      surface,
      navigation,
      showToast,
      studio,
      unifiedLogger,
      organization,
      permissions,
      rolePermissions,
      isOwner,
      refreshOrganization,
      refreshPermission,
      isOrganizationRefreshRequired,
      isOrganizationLoading,
    ],
  );

  useEffect(() => {
    // oxlint-disable-next-line react/react-compiler -- initial fetch sets the loading state before starting its asynchronous request
    void getOrganization();
  }, [getOrganization]);

  return (
    <GroupManagementContext.Provider value={value}>{children}</GroupManagementContext.Provider>
  );
};

export default GroupManagementProvider;
