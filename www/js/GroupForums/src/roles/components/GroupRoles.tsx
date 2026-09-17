import type { FunctionComponent } from 'react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Icon } from '@rbx/foundation-ui';
import { useTranslation, withTranslation } from '@rbx/intl';
import {
  Typography,
  Grid,
  makeStyles,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  useMediaQuery,
  Button,
  NavigateBeforeIcon,
  ChevronRightIcon,
  useTheme,
} from '@rbx/ui';
import type {
  GroupPermissions,
  GroupRoleMetadata,
  GroupRolePermissions,
} from '../../clients/groups';
import ErrorState from '../../components/ErrorState';
import TranslationNamespace from '../../constants/TranslationNamespace';
import useCurrentGroup from '../../hooks/useCurrentGroup';
import { PermissionsContainer } from '../../permissions/containers/PermissionsContainer';
import { CreatorTypes, EntityTypes } from '../../permissions/utils/types';
import type { CreatorDetails, EntityDetails } from '../../permissions/utils/types';
import {
  useCreateRole,
  useDeleteRole,
  useGetGroupProductFeatures,
  useGetGroupsRoles,
  useUpdateRoleMetadata,
} from '../../queries/rolesQueries';
import {
  DefaultMemberRoleIdNumber,
  DefaultNewRoleRank,
  GuestRoleRank,
} from '../../utils/constants';
import { OrganizationsEventName, logOrganizationsEvent } from '../../utils/eventUtils';
import {
  canEditRolePermissions,
  canViewAnyRoleTab,
  canViewRoleMembersTab,
  canViewRolePermissionsTab,
  canViewRoleSettingsTab,
} from '../../utils/groupPermissions';
import { getRandomRoleColorType, getRoleIconName, getRoleStyle } from '../../utils/groupUtils';
import { ConfigureRoleTab } from '../../utils/types';
import type { RoleCreationMetadata, RoleMetadataForNewRole } from '../../utils/types';
import CreateRoleModal from './CreateRoleModal';
import RoleIdCopyRow from './RoleIdCopyRow';
import RoleMembers from './RoleMembers';
import RoleSettings from './RoleSettings';
import RolesSidebar from './RolesSidebar';

const CONFIGURE_ROLE_TABS: ConfigureRoleTab[] = [
  ConfigureRoleTab.Permissions,
  ConfigureRoleTab.Members,
  ConfigureRoleTab.Settings,
];

export const getSelectedConfigureRoleTab = (
  currentTab: ConfigureRoleTab | undefined,
  availableTabs: ConfigureRoleTab[],
): ConfigureRoleTab | undefined =>
  currentTab !== undefined && availableTabs.includes(currentTab) ? currentTab : availableTabs[0];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type JsonResponse = {
  json: () => Promise<unknown>;
};

type ErrorResponseBody = {
  errors: unknown[];
};

const isJsonResponse = (value: unknown): value is JsonResponse =>
  isRecord(value) && typeof value.json === 'function';

const isErrorResponseBody = (value: unknown): value is ErrorResponseBody =>
  isRecord(value) && Array.isArray(value.errors);

export const getUserFacingErrorMessage = async (error: unknown): Promise<string | null> => {
  const response = isRecord(error) && 'response' in error ? error.response : error;
  if (!isJsonResponse(response)) {
    return null;
  }

  try {
    const responseBody = await response.json();
    if (!isErrorResponseBody(responseBody)) {
      return null;
    }

    const firstError = responseBody.errors[0];
    if (!isRecord(firstError) || typeof firstError.userFacingMessage !== 'string') {
      return null;
    }

    return firstError.userFacingMessage.trim() || null;
  } catch {
    return null;
  }
};

const getConfigureRoleTabs = (
  roleId: number | undefined,
  roleRank: number | undefined,
  isNewRole: boolean | undefined,
  permissions: GroupPermissions | null | undefined,
  rolePermissions: GroupRolePermissions | null | undefined,
  isOwner = false,
): ConfigureRoleTab[] => {
  if (isNewRole === true) {
    return isOwner || permissions?.canCreateRoles === true ? CONFIGURE_ROLE_TABS : [];
  }

  const permissionsForRole =
    roleId === undefined ? undefined : rolePermissions?.[roleId.toString()];
  return CONFIGURE_ROLE_TABS.filter((tab) => {
    switch (tab) {
      case ConfigureRoleTab.Permissions:
        return canViewRolePermissionsTab(permissionsForRole, isOwner);
      case ConfigureRoleTab.Members:
        return canViewRoleMembersTab(
          permissionsForRole,
          roleId === DefaultMemberRoleIdNumber,
          roleRank === GuestRoleRank,
          isOwner,
        );
      case ConfigureRoleTab.Settings:
        return canViewRoleSettingsTab(permissionsForRole, roleRank === GuestRoleRank, isOwner);
      default:
        return false;
    }
  });
};

const renderRoleIcon = (role: GroupRoleMetadata, size: 'Small' | 'Medium', paletteMode: string) => (
  <Icon
    name={getRoleIconName(role.id, role.isPrivate)}
    size={size}
    style={getRoleStyle(role.color, paletteMode, 'color')}
  />
);

const renderRoleHeaderLabel = (role: GroupRoleMetadata, paletteMode: string) => (
  <span className='inline-flex items-center gap-small'>
    {renderRoleIcon(role, 'Small', paletteMode)}
    {role.name}
  </span>
);

const useGroupRolesStyles = makeStyles()((theme) => ({
  container: {
    width: '100%',
    '& > *:not(:last-child)': {
      paddingBottom: 24,
    },
  },
  innerContainer: {
    gap: '16px',
  },
  horizontalDivider: {
    marginTop: 4,
    color: theme.palette.components.divider,
    width: '100%',
  },
  verticalDivider: {
    flex: '0 0 auto',
    margin: '0px 16px',
    color: theme.palette.components.divider,
    height: '100%',
    border: `1px solid ${theme.palette.components.divider}`,
  },
  tabContent: {
    flex: '2',
    minWidth: 0,
  },
  column: {
    flex: '1',
    minWidth: 0,
    maxWidth: '216px',
  },
  roleButton: {
    span: {
      display: 'flex',
      justifyContent: 'space-between',
      width: '100%',
    },
  },
  beforeButton: {
    padding: '8px 5px',
  },
}));

export type GroupRolesProps = {
  disabled?: boolean;
};

const GroupRoles: FunctionComponent<React.PropsWithChildren<GroupRolesProps>> = ({
  disabled = false,
}) => {
  const { translate, translateWithNamespace } = useTranslation();
  const { palette } = useTheme();
  const {
    group,
    isOwner,
    organization,
    permissions,
    rolePermissions,
    refreshPermission,
    unifiedLogger,
    navigation,
    showToast,
  } = useCurrentGroup();

  // Warm the product-features cache on roles-page load so RoleSettings reads it from cache
  // and never flashes a loading state when a role is opened.
  useGetGroupProductFeatures(group?.id);
  const roleId = Number.parseInt(navigation?.currentRoleId ?? '0', 10);

  const {
    classes: {
      container,
      innerContainer,
      horizontalDivider,
      column,
      roleButton,
      tabContent,
      beforeButton,
    },
  } = useGroupRolesStyles();

  const [isRoleSaving, setIsRoleSaving] = useState<boolean>(false);
  const [localRoles, setLocalRoles] = useState<RoleCreationMetadata[]>();
  const [selectedRole, setSelectedRole] = useState<RoleCreationMetadata>();
  const [selectedTab, setSelectedTab] = useState<ConfigureRoleTab>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('Medium'));

  const {
    data: fetchedRoles,
    isLoading,
    isError: isErrorFetchingRoles,
    refetch: refetchRoles,
  } = useGetGroupsRoles(organization?.groupId);

  const { mutateAsync: updateRoleMetadataAsync } = useUpdateRoleMetadata();
  const { mutateAsync: createRoleAsync } = useCreateRole();
  const { mutate: deleteRole } = useDeleteRole();

  const [prevFetchedRoles, setPrevFetchedRoles] = useState<typeof fetchedRoles | null>(null);
  if (fetchedRoles !== prevFetchedRoles) {
    setPrevFetchedRoles(fetchedRoles);
    if (fetchedRoles) {
      setLocalRoles(fetchedRoles.map((metadata) => ({ metadata, isNewRole: false })));
    }
  }

  useEffect(() => {
    if (isErrorFetchingRoles) {
      showToast(translate('Error.GroupRoles'), true);
    }
  }, [isErrorFetchingRoles, showToast, translate]);

  const [prevLocalRolesForAutoSelect, setPrevLocalRolesForAutoSelect] = useState(localRoles);
  const accessibleRoleIds = useMemo(
    () =>
      (localRoles ?? []).flatMap((role) => {
        const candidateRoleId = role.metadata?.id;
        if (
          candidateRoleId === undefined ||
          !canViewAnyRoleTab(
            rolePermissions?.[candidateRoleId.toString()],
            candidateRoleId === DefaultMemberRoleIdNumber,
            role.metadata?.rank === GuestRoleRank,
            isOwner,
          )
        ) {
          return [];
        }
        return [candidateRoleId.toString()];
      }),
    [isOwner, localRoles, rolePermissions],
  );
  const selectableRoleIds = rolePermissions === undefined ? undefined : accessibleRoleIds;
  const [prevSelectableRoleIds, setPrevSelectableRoleIds] = useState(selectableRoleIds);
  const [pendingNavigationId, setPendingNavigationId] = useState<string | undefined>(undefined);

  const autoSelectInputsChanged =
    prevLocalRolesForAutoSelect !== localRoles || prevSelectableRoleIds !== selectableRoleIds;

  if (
    !isMobile &&
    !selectedRole &&
    localRoles !== undefined &&
    selectableRoleIds !== undefined &&
    autoSelectInputsChanged
  ) {
    setPrevLocalRolesForAutoSelect(localRoles);
    setPrevSelectableRoleIds(selectableRoleIds);

    const accessibleRoles = localRoles.filter(
      (role) =>
        role.metadata?.id !== undefined && selectableRoleIds.includes(role.metadata.id.toString()),
    );
    const role = roleId
      ? accessibleRoles.find((accessibleRole) => accessibleRole.metadata?.id === roleId)
      : undefined;
    const fallback = accessibleRoles[accessibleRoles.length - 1];
    const nextSelectedRole = role ?? fallback;
    if (!role && fallback?.metadata?.id !== undefined) {
      setPendingNavigationId(fallback.metadata.id.toString());
    }
    setSelectedRole(nextSelectedRole);
    setSelectedTab(
      getConfigureRoleTabs(
        nextSelectedRole?.metadata?.id,
        nextSelectedRole?.metadata?.rank,
        nextSelectedRole?.isNewRole,
        permissions,
        rolePermissions,
        isOwner,
      )[0],
    );
  }

  useEffect(() => {
    if (pendingNavigationId !== undefined) {
      navigation?.navigateToRole?.(pendingNavigationId);
      // Reset to prevent a loop when `navigation` changes.
      // oxlint-disable-next-line react/react-compiler -- one-shot navigation trigger reset
      setPendingNavigationId(undefined);
    }
  }, [navigation, pendingNavigationId]);

  const handleCreateRole = useCallback(
    async (role: RoleMetadataForNewRole) => {
      if (!organization?.id || !role.name || role.color === undefined) {
        return;
      }

      setIsRoleSaving(true);

      try {
        const createRoleResponse = await createRoleAsync({
          groupId: Number.parseInt(organization.groupId, 10),
          name: role.name,
          description: role.description ?? '',
          rank: role.rank ?? DefaultNewRoleRank,
          isPrivate: role.isPrivate,
        });

        const roleCreationMetadata: RoleCreationMetadata = {
          metadata: createRoleResponse,
          isNewRole: true,
        };

        setLocalRoles((prevRoles) => {
          if (!prevRoles) {
            return prevRoles;
          }
          const memberIndex = prevRoles.findIndex(
            (r) => r.metadata?.id === DefaultMemberRoleIdNumber,
          );
          const insertIndex = memberIndex >= 0 ? memberIndex + 1 : prevRoles.length;
          return [
            ...prevRoles.slice(0, insertIndex),
            roleCreationMetadata,
            ...prevRoles.slice(insertIndex),
          ];
        });
        setSelectedRole(roleCreationMetadata);
        setSelectedTab(ConfigureRoleTab.Settings);
        void refreshPermission();
        setIsCreateModalOpen(false);
      } catch (error: unknown) {
        showToast(
          (await getUserFacingErrorMessage(error)) ??
            translateWithNamespace(TranslationNamespace.Organization, 'Error.SavingRoleSettings'),
          true,
        );
      } finally {
        setIsRoleSaving(false);
      }
    },
    [organization, refreshPermission, showToast, translateWithNamespace, createRoleAsync],
  );

  const handleUpdateRoleSettings = useCallback(
    async (role: GroupRoleMetadata) => {
      if (!organization?.id || role.id === undefined || !role.name || role.color === undefined) {
        return;
      }

      setIsRoleSaving(true);

      try {
        const updateRoleMetadataResponse = await updateRoleMetadataAsync({
          groupId: Number.parseInt(organization.groupId, 10),
          rolesetId: role.id,
          name: role.name,
          description: role.description ?? '',
          rank: role.rank ?? DefaultNewRoleRank,
          color: role.color,
          isPrivate: role.isPrivate,
        });

        setLocalRoles((prevRoles): RoleCreationMetadata[] | undefined => {
          const newRolesList = prevRoles?.map((prevRole) => {
            if (prevRole?.metadata?.id === role.id) {
              const updatedRole: RoleCreationMetadata = {
                metadata: {
                  ...prevRole.metadata,
                  ...updateRoleMetadataResponse,
                  isPrivate: updateRoleMetadataResponse.isPrivate ?? false,
                },
                isNewRole: prevRole.isNewRole,
              };
              return updatedRole;
            }
            return prevRole;
          });

          return newRolesList;
        });

        setSelectedRole((prevSelectedRole) => {
          if (!prevSelectedRole) {
            return prevSelectedRole;
          }
          const roleMetadata = {
            ...prevSelectedRole.metadata,
            ...updateRoleMetadataResponse,
            isPrivate: updateRoleMetadataResponse.isPrivate ?? false,
          };
          return {
            metadata: roleMetadata,
            isNewRole: prevSelectedRole.isNewRole,
          };
        });

        showToast(translateWithNamespace(TranslationNamespace.Groups, 'Message.RoleUpdateSuccess'));
      } catch (error: unknown) {
        showToast(
          (await getUserFacingErrorMessage(error)) ??
            translateWithNamespace(TranslationNamespace.Organization, 'Error.SavingRoleSettings'),
          true,
        );
      } finally {
        setIsRoleSaving(false);
      }
    },
    [organization, showToast, translateWithNamespace, updateRoleMetadataAsync],
  );

  const handleDeleteRole = useCallback(
    (role: GroupRoleMetadata) => {
      if (!organization?.id || role.id === undefined) {
        return;
      }

      setIsRoleSaving(true);

      deleteRole(
        {
          groupId: Number.parseInt(organization.groupId, 10),
          rolesetId: role.id,
        },
        {
          onError: () => {
            showToast(
              translateWithNamespace(TranslationNamespace.Organization, 'Error.DeletingRole'),
              true,
            );
          },
          onSuccess: () => {
            if (isMobile) {
              setSelectedTab(undefined);
              setSelectedRole(undefined);
            }

            logOrganizationsEvent(unifiedLogger, OrganizationsEventName.ClickOrgsDeleteRole, {
              group_id: organization.groupId ?? '',
              role_id: role.id?.toString() ?? '',
            });
            setLocalRoles((prev) => prev?.filter((r) => r.metadata?.id !== role.id));
            setSelectedRole(undefined);
          },
          onSettled: () => {
            setIsRoleSaving(false);
          },
        },
      );
    },
    [organization, unifiedLogger, isMobile, showToast, translateWithNamespace, deleteRole],
  );

  const handleSelectRole = useCallback(
    (role: GroupRoleMetadata | null, autoSelectTab = true) => {
      if (role && role.id) {
        navigation?.navigateToRole?.(role.id.toString());
        setSelectedRole({ metadata: role });
        if (autoSelectTab) {
          const availableTabs = getConfigureRoleTabs(
            role.id,
            role.rank,
            false,
            permissions,
            rolePermissions,
            isOwner,
          );
          setSelectedTab((currentTab) => getSelectedConfigureRoleTab(currentTab, availableTabs));
        }
      } else {
        setIsCreateModalOpen(true);
      }
    },
    [isOwner, setIsCreateModalOpen, navigation, permissions, rolePermissions],
  );

  const handleCreateRoleSubmit = useCallback(
    async (name: string, isPrivate: boolean) => {
      const roleMetadata: RoleMetadataForNewRole = {
        name,
        rank: DefaultNewRoleRank,
        description: '',
        color: getRandomRoleColorType(),
        isPrivate,
      };
      await handleCreateRole(roleMetadata);
    },
    [handleCreateRole],
  );

  const newRolePermissionsTabContent = useMemo(() => {
    const isDefaultMemberRole = selectedRole?.metadata?.id === DefaultMemberRoleIdNumber;
    const isGuestRole = selectedRole?.metadata?.rank === GuestRoleRank;
    const selectedRoleId = selectedRole?.metadata?.id;
    const isRecentlyCreatedRole =
      selectedRole?.isNewRole === true &&
      (isOwner === true || permissions?.canCreateRoles === true);
    const canEditPermissions =
      isRecentlyCreatedRole || isOwner
        ? true
        : canEditRolePermissions(
            selectedRoleId === undefined ? undefined : rolePermissions?.[selectedRoleId.toString()],
          );
    const creatorType = isDefaultMemberRole
      ? CreatorTypes.MEMBER_ROLE
      : isGuestRole
        ? CreatorTypes.GUEST_ROLE
        : CreatorTypes.ROLE;
    const creatorFilter = [
      {
        type: creatorType,
        id: selectedRole?.metadata?.id?.toString() ?? '',
        name: selectedRole?.metadata?.name ?? '',
        disabled: !canEditPermissions,
      },
    ] satisfies CreatorDetails[];
    const entity = {
      type: EntityTypes.GROUP,
      id: organization?.groupId ?? '',
    } satisfies EntityDetails;
    return (
      <Grid container>
        <PermissionsContainer
          creatorFilter={creatorFilter}
          entity={entity}
          uiConfig={{
            singleCreatorExperience: true,
            showConfirmationOnSave: isDefaultMemberRole,
          }}
        />
      </Grid>
    );
  }, [
    isOwner,
    organization?.groupId,
    permissions?.canCreateRoles,
    rolePermissions,
    selectedRole?.isNewRole,
    selectedRole?.metadata?.id,
    selectedRole?.metadata?.name,
    selectedRole?.metadata?.rank,
  ]);

  const roleMembersTabContent = useMemo(() => {
    if (!selectedRole?.metadata) {
      return null;
    }

    const { isNewRole } = selectedRole;
    const isRecentlyCreatedRole =
      isNewRole === true && (isOwner === true || permissions?.canCreateRoles === true);
    const permissionsForRole =
      selectedRole.metadata.id === undefined
        ? undefined
        : rolePermissions?.[selectedRole.metadata.id.toString()];
    const canViewRoleMembers =
      canViewRoleMembersTab(
        permissionsForRole,
        selectedRole.metadata.id === DefaultMemberRoleIdNumber,
        selectedRole.metadata.rank === GuestRoleRank,
        isOwner,
      ) || isRecentlyCreatedRole;

    return (
      <>
        {permissions === undefined ? (
          <Grid container justifyContent='center'>
            <CircularProgress />
          </Grid>
        ) : (
          <>{canViewRoleMembers && <RoleMembers role={selectedRole.metadata} />}</>
        )}
      </>
    );
  }, [isOwner, permissions, rolePermissions, selectedRole]);

  const roleSettingsTabContent = useMemo(() => {
    if (!selectedRole?.metadata) {
      return null;
    }

    const { isNewRole } = selectedRole;
    const isRecentlyCreatedRole =
      isNewRole === true && (isOwner === true || permissions?.canCreateRoles === true);
    const permissionsForRole =
      selectedRole.metadata.id === undefined
        ? undefined
        : rolePermissions?.[selectedRole.metadata.id.toString()];
    const canViewRoleSettings =
      canViewRoleSettingsTab(
        permissionsForRole,
        selectedRole.metadata.rank === GuestRoleRank,
        isOwner,
      ) || isRecentlyCreatedRole;

    return (
      <>
        {permissions === undefined ? (
          <Grid container justifyContent='center'>
            <CircularProgress />
          </Grid>
        ) : (
          <>
            {canViewRoleSettings && (
              <RoleSettings
                key={selectedRole.metadata?.id}
                role={selectedRole.metadata}
                disabled={!canViewRoleSettings}
                onSave={handleUpdateRoleSettings}
                onDelete={handleDeleteRole}
                saving={isRoleSaving}
              />
            )}
          </>
        )}
      </>
    );
  }, [
    handleDeleteRole,
    handleUpdateRoleSettings,
    isRoleSaving,
    isOwner,
    permissions,
    rolePermissions,
    selectedRole,
  ]);
  const visibleRoleTabs = useMemo(
    () =>
      getConfigureRoleTabs(
        selectedRole?.metadata?.id,
        selectedRole?.metadata?.rank,
        selectedRole?.isNewRole,
        permissions,
        rolePermissions,
        isOwner,
      ),
    [
      isOwner,
      permissions,
      rolePermissions,
      selectedRole?.isNewRole,
      selectedRole?.metadata?.id,
      selectedRole?.metadata?.rank,
    ],
  );

  if (isErrorFetchingRoles) {
    return <ErrorState onRetry={refetchRoles} />;
  }

  if (isMobile) {
    if (selectedRole === undefined) {
      return (
        <>
          <Grid container className={container} wrap='wrap'>
            <Grid item XSmall>
              <RolesSidebar
                roles={localRoles}
                setRoles={setLocalRoles}
                selectedRole={selectedRole}
                onSelectedRole={handleSelectRole}
                loading={isLoading}
                disabled={disabled}
                isMobile={isMobile}
              />
            </Grid>
          </Grid>
          <CreateRoleModal
            open={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onConfirm={handleCreateRoleSubmit}
            saving={isRoleSaving}
            canSetVisibility={permissions?.canCreateRoles === true}
          />
        </>
      );
    }
    if (selectedRole.metadata !== undefined && selectedTab === undefined) {
      return (
        <Grid container>
          <Grid item XSmall={12} style={{ marginBottom: 12 }}>
            <Button
              startIcon={<NavigateBeforeIcon />}
              onClick={() => setSelectedRole(undefined)}
              color='primary'
              className={beforeButton}>
              {translate('Heading.Roles')}
            </Button>
          </Grid>
          <Grid item XSmall={12} style={{ margin: '12px 12px 32px' }}>
            <Grid container>
              {renderRoleIcon(selectedRole.metadata, 'Medium', palette.mode)}
              <Typography variant='body1' style={{ marginLeft: 8 }}>
                {selectedRole.metadata.name}
              </Typography>
            </Grid>
          </Grid>
          <Grid item XSmall={12} style={{ padding: '0px 12px 32px' }}>
            <Divider className={horizontalDivider} />
          </Grid>
          {visibleRoleTabs.map((tab) => (
            <Grid item XSmall={12} key={tab}>
              <Button
                disabled={
                  tab === ConfigureRoleTab.Members &&
                  (selectedRole?.metadata?.id === DefaultMemberRoleIdNumber ||
                    selectedRole?.metadata?.rank === 0)
                }
                onClick={() => setSelectedTab(tab)}
                fullWidth
                color='primary'
                className={roleButton}>
                {translate(`Label.${tab}`)}
                <ChevronRightIcon />
              </Button>
            </Grid>
          ))}
        </Grid>
      );
    }

    if (selectedRole.metadata !== undefined && selectedTab === ConfigureRoleTab.Permissions) {
      return (
        <Grid
          container
          style={{
            display: selectedTab !== ConfigureRoleTab.Permissions ? 'none' : 'block',
          }}>
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={() => setSelectedTab(undefined)}
            color='primary'
            className={beforeButton}>
            {renderRoleHeaderLabel(selectedRole.metadata, palette.mode)}
          </Button>
          <Grid container className={container}>
            {newRolePermissionsTabContent}
          </Grid>
        </Grid>
      );
    }
    if (selectedRole.metadata !== undefined && selectedTab === ConfigureRoleTab.Members) {
      return (
        <Grid container>
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={() => setSelectedTab(undefined)}
            color='primary'
            className={beforeButton}>
            {renderRoleHeaderLabel(selectedRole.metadata, palette.mode)}
          </Button>
          <Grid container className={container}>
            {roleMembersTabContent}
          </Grid>
        </Grid>
      );
    }
    if (selectedRole.metadata !== undefined && selectedTab === ConfigureRoleTab.Settings) {
      return (
        <Grid container>
          <Button
            startIcon={<NavigateBeforeIcon />}
            onClick={() => setSelectedTab(undefined)}
            color='primary'
            className={beforeButton}>
            {renderRoleHeaderLabel(selectedRole.metadata, palette.mode)}
          </Button>
          <Grid container className={container}>
            {roleSettingsTabContent}
          </Grid>
        </Grid>
      );
    }
  }

  return (
    <Grid container className={container} wrap='wrap'>
      <Grid container className={innerContainer}>
        <Grid item className={column}>
          <RolesSidebar
            roles={localRoles}
            setRoles={setLocalRoles}
            selectedRole={selectedRole}
            onSelectedRole={handleSelectRole}
            loading={isLoading}
            disabled={disabled}
            isMobile={isMobile}
          />
        </Grid>

        <Grid container item justifyContent='center' className={tabContent}>
          {selectedRole && (
            <Grid container direction='column' alignContent='flex-start' wrap='wrap'>
              <Grid container direction='column' alignContent='flex-start' wrap='wrap'>
                <Tabs
                  orientation='horizontal'
                  value={selectedTab}
                  variant='fullWidth'
                  className='width-full'
                  style={{ borderBottom: '1px solid var(--color-stroke-default)' }}>
                  {visibleRoleTabs.map((tab) => (
                    <Tab
                      key={tab}
                      label={translateWithNamespace(
                        TranslationNamespace.GroupManagement,
                        `Label.${tab}`,
                      )}
                      value={tab}
                      disabled={
                        tab === ConfigureRoleTab.Members &&
                        (selectedRole?.metadata?.id === DefaultMemberRoleIdNumber ||
                          selectedRole?.metadata?.rank === 0)
                      }
                      onClick={() => setSelectedTab(tab)}
                    />
                  ))}
                </Tabs>
              </Grid>

              {!selectedRole && (
                <Grid container justifyContent='center'>
                  <CircularProgress />
                </Grid>
              )}
              {selectedRole && (
                <Grid
                  container
                  className='padding-top-large'
                  style={{
                    display: selectedTab !== ConfigureRoleTab.Permissions ? 'none' : 'block',
                  }}>
                  {newRolePermissionsTabContent}
                  {selectedRole.metadata?.id != null && (
                    <Grid item XSmall={12} style={{ paddingTop: 24 }}>
                      <RoleIdCopyRow roleId={selectedRole.metadata.id} />
                    </Grid>
                  )}
                </Grid>
              )}

              {selectedRole && selectedTab === ConfigureRoleTab.Members && (
                <>{roleMembersTabContent}</>
              )}

              {selectedRole && selectedTab === ConfigureRoleTab.Settings && (
                <>{roleSettingsTabContent}</>
              )}
            </Grid>
          )}
        </Grid>
      </Grid>
      <CreateRoleModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateRoleSubmit}
        saving={isRoleSaving}
        canSetVisibility={permissions?.canCreateRoles === true}
      />
    </Grid>
  );
};

export default withTranslation(GroupRoles, [
  TranslationNamespace.Groups,
  TranslationNamespace.Organization,
  TranslationNamespace.Permissions,
  TranslationNamespace.GroupManagement,
]);
