import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Loading, useSystemFeedback } from 'react-style-guide';
import { useTranslation, queryClient as globalQueryClient } from 'react-utilities';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@rbx/foundation-ui';
import { CurrentUser } from 'Roblox';
import { Group, GroupPermissions, Role } from '../../shared/types';
import Banner from '../../shared/components/Banner';
import ConfigureRolesList from '../../shared/components/ConfigureRolesList';
import groupRolesService, { RolePermissionsResponse } from '../services/groupRolesService';
import groupSettingsService from '../../configureGroupSettings/services/groupSettingsService';
import PermissionsTab from '../components/ConfigureGroupRolePermissionsTab';
import SettingsTab from '../components/ConfigureGroupRoleSettingsTab';
import CreateRoleDialog from '../components/CreateRoleDialog';
import { useConfigurationMetadata } from '../../shared/contexts/ConfigurationMetadataContext';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import OwnerDeprecationBanner from '../../shared/components/OwnerDeprecationBanner';
import getLowestDeletableRoleId from '../../shared/utils/roleUtils';
import { isUnlockedOwnerRole } from '../../shared/utils/communityOwnership';
import useGuacConfig from '../../shared/hooks/useGuacConfig';

type ConfigureGroupRolesContainerProps = {
  group: Group;
};

const IS_DISMISSED_BASE_MEMBER_ROLE_BANNER_STORAGE_KEY = 'visit-base-member-role-local-storage-key';

const EMPTY_ROLES: RolePermissionsResponse[] = [];
const sortRoles = (data: RolePermissionsResponse[]): RolePermissionsResponse[] => {
  return [...data].reverse();
};

const ConfigureGroupRolesContainer: React.FC<ConfigureGroupRolesContainerProps> = ({ group }) => {
  const { translate } = useTranslation();
  const { systemFeedbackService, SystemFeedbackComponent } = useSystemFeedback();
  const queryClient = useQueryClient();
  const { roleConfiguration } = useConfigurationMetadata();
  const { maxRank, minRank, limit } = roleConfiguration;
  const isLoggedInUserOwner = group.owner?.userId === Number(CurrentUser.userId);
  const { data: configureGroupUi } = useGuacConfig('configure-group-ui');
  const { features } = useCommunityProductFeatures();

  const { data: groupSettings } = useQuery({
    queryKey: ['groupSettings', group.id],
    queryFn: () => groupSettingsService.getGroupSettings(group.id),
    enabled: Boolean(configureGroupUi?.displayAutoAssignRoleDeleteWarning)
  });

  const [selectedRoleId, setSelectedRoleId] = useState<number>();
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState<boolean>(false);

  const groupRolesQueryKey = ['groupRolePermissions', group.id] as const;

  const { data: rolesWithPerms = EMPTY_ROLES, isLoading: isLoadingRoles } = useQuery({
    queryKey: groupRolesQueryKey,
    queryFn: async () => groupRolesService.getAllGroupRolePermissions(group.id),
    select: sortRoles
  });

  const isAddButtonDisabled = rolesWithPerms.length >= limit;

  useEffect(() => {
    if (!selectedRoleId && rolesWithPerms.length > 0) {
      setSelectedRoleId(rolesWithPerms[0].role.id);
    }
  }, [selectedRoleId, rolesWithPerms]);

  const onPermissionsUpdated = (roleId: number, permissionName: string, value: boolean) => {
    queryClient.setQueryData<Array<RolePermissionsResponse>>(
      groupRolesQueryKey,
      prevRolesWithPerms =>
        (prevRolesWithPerms ?? []).map(roleWithPerms => {
          if (roleWithPerms.role.id === roleId) {
            const categoryKey = Object.entries(
              roleWithPerms.permissions
            ).find(([, subPermissions]) =>
              Object.prototype.hasOwnProperty.call(subPermissions, permissionName)
            )?.[0] as keyof GroupPermissions;
            return {
              ...roleWithPerms,
              permissions: {
                ...roleWithPerms.permissions,
                [categoryKey]: {
                  ...roleWithPerms.permissions[categoryKey],
                  [permissionName]: value
                }
              }
            };
          }
          return roleWithPerms;
        })
    );
  };

  const onRoleCreated = async (newRole: Role) => {
    systemFeedbackService.success(translate('Message.RoleCreateSuccess'));

    const permissions = await groupRolesService.getGroupRolePermissions(group.id, newRole.id);

    const newPermedRole = {
      groupId: group.id,
      role: newRole,
      permissions
    };

    queryClient.setQueryData<Array<RolePermissionsResponse>>(
      groupRolesQueryKey,
      prevRolesWithPerms =>
        // sort here to ensure the new role is inserted in the correct order by rank
        [...(prevRolesWithPerms ?? []), newPermedRole].sort((a, b) => a.role.rank - b.role.rank)
    );

    setSelectedRoleId(newRole.id);
  };

  const onRoleUpdated = (updatedRole: Role) => {
    queryClient.setQueryData<Array<RolePermissionsResponse>>(
      groupRolesQueryKey,
      prevRolesWithPerms =>
        (prevRolesWithPerms ?? [])
          .map(roleWithPerms => {
            if (roleWithPerms.role.id === updatedRole.id) {
              return {
                ...roleWithPerms,
                role: {
                  ...roleWithPerms.role,
                  name: updatedRole.name,
                  rank: updatedRole.rank,
                  description: updatedRole.description,
                  color: updatedRole.color
                }
              };
            }
            return roleWithPerms;
          })
          // required so the role list remains sorted by rank after an update
          .sort((a, b) => a.role.rank - b.role.rank)
    );

    // invalidate the group-roles cache so other tabs (e.g. Members) refetch with updated data
    // eslint-disable-next-line no-void
    void globalQueryClient.invalidateQueries({ queryKey: ['group-roles', group.id] });
    // eslint-disable-next-line no-void
    void globalQueryClient.invalidateQueries({ queryKey: ['group-members', group.id] });
  };

  const onRoleDeleted = (roleId: number) => {
    queryClient.setQueryData<Array<RolePermissionsResponse>>(
      groupRolesQueryKey,
      prevRolesWithPerms => {
        const filtered = (prevRolesWithPerms ?? []).filter(
          roleWithPerms => roleWithPerms.role.id !== roleId
        );
        if (roleId === selectedRoleId) {
          // select the last role (displayed at top) if the selected role was deleted
          setSelectedRoleId(filtered[filtered.length - 1]?.role.id);
        }
        return filtered;
      }
    );
  };

  const selectedRole = useMemo(() => {
    return rolesWithPerms.find(roleWithPerms => roleWithPerms.role.id === selectedRoleId);
  }, [rolesWithPerms, selectedRoleId]);

  const lowestDeletableRoleId = useMemo(
    () =>
      getLowestDeletableRoleId(
        rolesWithPerms.map(r => r.role),
        minRank,
        maxRank,
        features.IsOwnerRolesetDeprecated
      ),
    [rolesWithPerms, minRank, maxRank, features.IsOwnerRolesetDeprecated]
  );

  const roles = useMemo(() => {
    return rolesWithPerms.map(roleWithPerms => ({
      ...roleWithPerms.role,
      pillText: roleWithPerms.role.isBase ? translate('Label.New') : undefined
    }));
  }, [translate, rolesWithPerms]);

  if (isLoadingRoles) {
    return <Loading />;
  }

  return (
    <React.Fragment>
      <div className='margin-bottom-small margin-left-small margin-right-small'>
        <Banner
          content={translate('Message.BaseMemberRoleInfo')}
          iconName='icon-filled-triangle-exclamation'
          flavor='flat'
          isDismissedLocalStorageKey={IS_DISMISSED_BASE_MEMBER_ROLE_BANNER_STORAGE_KEY}
        />
      </div>
      <div className='configure-group-roles-container flex flex-col medium:flex-row margin-left-small margin-right-small'>
        <ConfigureRolesList
          roles={roles}
          selectedRoleId={selectedRoleId}
          onSelectRoleId={setSelectedRoleId}
          isAddButtonVisible={isLoggedInUserOwner}
          isAddButtonDisabled={isAddButtonDisabled}
          onAddRole={() => setIsCreateRoleDialogOpen(true)}
          actionText={translate('Action.CreateRole')}
        />
        {!selectedRole || !selectedRole.permissions ? (
          <Loading />
        ) : (
          <div className='grow-1 margin-top-small margin-left-none medium:margin-top-none medium:margin-left-small'>
            <h3>{translate('Heading.ConfigureGroup', { groupName: selectedRole.role.name })}</h3>
            {isUnlockedOwnerRole(selectedRole.role, maxRank, features.IsOwnerRolesetDeprecated) && (
              <OwnerDeprecationBanner groupId={group.id} />
            )}
            <Tabs
              key={selectedRole.role.id}
              size='Medium'
              variant='Contained'
              defaultValue='permissions'>
              <TabsList>
                <TabsTrigger value='permissions'>{translate('Heading.Permissions')}</TabsTrigger>
                <TabsTrigger value='settings'>{translate('Heading.Settings')}</TabsTrigger>
              </TabsList>
              <TabsContent value='permissions'>
                <PermissionsTab
                  groupId={group.id}
                  role={selectedRole.role}
                  isLoggedInUserOwner={isLoggedInUserOwner}
                  permissions={selectedRole.permissions}
                  onPermissionsUpdated={(permissionName, value) =>
                    onPermissionsUpdated(selectedRole.role.id, permissionName, value)
                  }
                />
              </TabsContent>
              <TabsContent value='settings'>
                <SettingsTab
                  groupId={group.id}
                  role={selectedRole.role}
                  isLoggedInUserOwner={isLoggedInUserOwner}
                  isLowestDeletableRole={selectedRole.role.id === lowestDeletableRoleId}
                  isAutoAssignRoleDisabled={groupSettings?.isAutoAssignRoleDisabled}
                  onRoleUpdated={onRoleUpdated}
                  onRoleDeleted={onRoleDeleted}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
        <CreateRoleDialog
          groupId={group.id}
          open={isCreateRoleDialogOpen}
          onOpenChange={setIsCreateRoleDialogOpen}
          onRoleCreated={onRoleCreated}
          onRoleCreateError={() =>
            systemFeedbackService.warning(translate('Message.RoleCreateFail'))
          }
        />
      </div>
      <SystemFeedbackComponent />
    </React.Fragment>
  );
};

export default ConfigureGroupRolesContainer;
