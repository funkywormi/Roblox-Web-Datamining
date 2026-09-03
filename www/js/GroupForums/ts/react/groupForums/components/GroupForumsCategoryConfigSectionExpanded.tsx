import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import classNames from 'classnames';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useSystemFeedback } from 'react-style-guide';
import {
  Button,
  Dialog,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogFooter,
  Toggle,
  Tooltip,
  TooltipTrigger
} from '@rbx/foundation-ui';
import type { GroupRolePermissions as ResolvedGroupRolePermissions } from '@rbx/group-management';
import { groupsConfig } from '../translation.config';
import { Group, GroupPermissions } from '../../shared/types';
import forumsService from '../services/forumsService';
import {
  ChannelModerationType,
  ForumCategory,
  ForumCategoryRolePermissionResponse
} from '../types';
import RoleSelectDialog from '../../shared/components/dialogs/RoleSelectDialog';
import ForumRolesEmptyStateComponent from './ForumRolesEmptyStateComponent';
import ConfigureRolePermissionsSection from '../../shared/components/ConfigureRolePermissionsSection';
import ConfigureRolesList from '../../shared/components/ConfigureRolesList';
import {
  getCategoryRolePermissionsKey,
  getCategoryRolesPermissionsKey
} from '../services/queryKeys';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import { getUnifiedForumPermissionName } from '../services/unifiedForumPermissions';
import useUnifiedForumCategoryRolePermissions from '../hooks/useUnifiedForumCategoryRolePermissions';
import useForumCategoryRoleOverrides from '../hooks/useForumCategoryRoleOverrides';
import useForumCategoryRolePermissionsConfiguration from '../hooks/useForumCategoryRolePermissionsConfiguration';

export type GroupForumsCategoryConfigSectionExpandedProps = {
  group: Group;
  forumCategory: ForumCategory;
  refetchForumCategories: () => Promise<void>;
  canManageCategory: boolean;
  isUnified: boolean;
  resolvedRolePermissions: ResolvedGroupRolePermissions;
} & WithTranslationsProps;

const GroupForumsCategoryConfigSectionExpanded = ({
  group,
  forumCategory,
  refetchForumCategories,
  canManageCategory,
  isUnified,
  resolvedRolePermissions,
  translate
}: GroupForumsCategoryConfigSectionExpandedProps): JSX.Element | null => {
  const [isAddRoleDialogVisible, setIsAddRoleDialogVisible] = useState(false);
  const [selectedRoleId, setSelectedRoleId] = useState<number | undefined>(undefined);
  const pendingAddedRoleIdRef = useRef<number | undefined>(undefined);
  const { systemFeedbackService } = useSystemFeedback();
  const queryClient = useQueryClient();
  const rolesPermissionsQueryKey = getCategoryRolesPermissionsKey(group.id, forumCategory.id);

  const { features } = useCommunityProductFeatures();

  const { data: groupDetailsUi } = useGuacConfig('group-details-ui');
  const isEligibleForRoleRestricted =
    groupDetailsUi?.eligibleForRestrictedCommunications === 'Eligible';
  const showRoleRestrictedToggle = canManageCategory && features.ForumsRestrictedCategories;
  const isUnrestrictedMessagesCategory =
    forumCategory.isRestricted === true &&
    forumCategory.moderationType === ChannelModerationType.Unrestricted;
  const roleRestrictedToggleDisabled =
    !isEligibleForRoleRestricted || isUnrestrictedMessagesCategory;
  const [isRoleRestricted, setIsRoleRestricted] = useState<boolean>(
    forumCategory.isRestricted ?? false
  );
  const [isRemoveRoleRestrictionDialogVisible, setIsRemoveRoleRestrictionDialogVisible] = useState(
    false
  );

  useEffect(() => {
    setIsRoleRestricted(forumCategory.isRestricted ?? false);
  }, [forumCategory.isRestricted]);

  const {
    isLoading: isRolesPermissionsQueryLoading,
    data: rolesPermissions,
    refetch: refetchPermissions
  } = useForumCategoryRoleOverrides({
    groupId: group.id,
    categoryId: forumCategory.id,
    onError: () => systemFeedbackService.warning(translate('NetworkError'))
  });

  useEffect(() => {
    if (!rolesPermissions) {
      return;
    }
    if (
      pendingAddedRoleIdRef.current !== undefined &&
      pendingAddedRoleIdRef.current === selectedRoleId
    ) {
      const pendingRoleIsLoaded = rolesPermissions.some(
        rolePermissions => rolePermissions.role.id === selectedRoleId
      );
      if (!pendingRoleIsLoaded) {
        return;
      }
      pendingAddedRoleIdRef.current = undefined;
    }
    const selectedRoleIsEditable = rolesPermissions.some(
      rolePermissions =>
        rolePermissions.role.id === selectedRoleId &&
        (!isUnified ||
          resolvedRolePermissions[rolePermissions.role.id]?.canEditPermissions === true)
    );
    if (!selectedRoleIsEditable) {
      setSelectedRoleId(
        rolesPermissions.find(
          rolePermissions =>
            !isUnified ||
            resolvedRolePermissions[rolePermissions.role.id]?.canEditPermissions === true
        )?.role.id
      );
    }
  }, [isUnified, resolvedRolePermissions, rolesPermissions, selectedRoleId]);

  const selectedRolePermissions = rolesPermissions?.find(
    rolePermissions => rolePermissions.role.id === selectedRoleId
  );
  const {
    data: unifiedSelectedRolePermissions,
    isLoading: isUnifiedSelectedRolePermissionsLoading
  } = useUnifiedForumCategoryRolePermissions({
    groupId: group.id,
    categoryId: forumCategory.id,
    roleId: selectedRoleId,
    enabled:
      isUnified &&
      !!selectedRoleId &&
      resolvedRolePermissions[selectedRoleId]?.canEditPermissions === true,
    onError: () => systemFeedbackService.warning(translate('NetworkError'))
  });
  const roles =
    rolesPermissions?.map(rolePermissions => ({
      ...rolePermissions.role,
      isDisabled:
        isUnified && resolvedRolePermissions[rolePermissions.role.id]?.canEditPermissions !== true
    })) || [];
  const roleIds = roles?.map(role => role.id) || [];
  const networkErrorTranslation = translate('NetworkError');

  const showAddRoleDialog = useCallback(() => {
    setIsAddRoleDialogVisible(true);
  }, [setIsAddRoleDialogVisible]);

  const hideAddRoleDialog = useCallback(() => {
    setIsAddRoleDialogVisible(false);
  }, [setIsAddRoleDialogVisible]);

  const addRoleMutation = useMutation(
    async (roleId: number) => {
      hideAddRoleDialog();
      await forumsService.addGroupForumCategoryRolesPermissions(group.id, forumCategory.id, roleId);
    },
    {
      onSuccess: (_, roleId: number) => {
        pendingAddedRoleIdRef.current = roleId;
        setSelectedRoleId(roleId);
        systemFeedbackService.success(translate('Message.RoleUpdateSuccess'));
      },
      onError: () => {
        systemFeedbackService.warning(networkErrorTranslation);
      },
      onSettled: async () => {
        const { data: refreshedRolesPermissions } = await refetchPermissions();
        const pendingAddedRoleId = pendingAddedRoleIdRef.current;
        if (
          pendingAddedRoleId !== undefined &&
          !refreshedRolesPermissions?.some(
            rolePermissions => rolePermissions.role.id === pendingAddedRoleId
          )
        ) {
          pendingAddedRoleIdRef.current = undefined;
          setSelectedRoleId(undefined);
        }
      }
    }
  );

  const removeRoleMutation = useMutation(
    async (roleId: number) => {
      await forumsService.deleteGroupForumCategoryRolesPermissions(
        group.id,
        forumCategory.id,
        roleId
      );
    },
    {
      onSuccess: (_, roleId: number) => {
        if (!rolesPermissions) {
          return;
        }

        const newRolesPermissions = rolesPermissions.filter(
          rolePermissions => rolePermissions.role.id !== roleId
        );
        queryClient.setQueryData(rolesPermissionsQueryKey, newRolesPermissions);
        queryClient.removeQueries({
          queryKey: getCategoryRolePermissionsKey(group.id, forumCategory.id, roleId)
        });

        setSelectedRoleId(newRolesPermissions[0]?.role.id);

        systemFeedbackService.success(translate('Message.RoleDeleteSuccess'));
      },
      onError: () => {
        systemFeedbackService.warning(networkErrorTranslation);
      }
    }
  );

  const toggleRoleRestrictionMutation = useMutation(
    async (next: boolean) => {
      setIsRoleRestricted(next);
      await forumsService.toggleRestrictedGroupForumCategory(group.id, forumCategory.id, next);
    },
    {
      onSuccess: async () => {
        systemFeedbackService.success(translate('Message.PermissionUpdateSuccess'));
        await refetchForumCategories();
      },
      onError: (_err, next: boolean) => {
        setIsRoleRestricted(!next);
        systemFeedbackService.warning(networkErrorTranslation);
      }
    }
  );

  const handleRoleRestrictedToggleChange = useCallback(
    (next: boolean) => {
      if (!next && isRoleRestricted) {
        setIsRemoveRoleRestrictionDialogVisible(true);
      } else {
        toggleRoleRestrictionMutation.mutate(next);
      }
    },
    [isRoleRestricted, toggleRoleRestrictionMutation]
  );

  const confirmRemoveRoleRestriction = useCallback(() => {
    setIsRemoveRoleRestrictionDialogVisible(false);
    toggleRoleRestrictionMutation.mutate(false);
  }, [toggleRoleRestrictionMutation]);

  const dismissRemoveRoleRestrictionDialog = useCallback(() => {
    setIsRemoveRoleRestrictionDialogVisible(false);
  }, []);

  const handleRemoveRoleRestrictionDialogOpenChange = useCallback((open: boolean) => {
    if (!open) {
      setIsRemoveRoleRestrictionDialogVisible(false);
    }
  }, []);

  const updateSelectedRolesForumsPermission = useCallback(
    (roleId: number, permissionName: string, value: boolean) => {
      if (!rolesPermissions) return;
      const newRolesPermissions = rolesPermissions.map(rolePermissions => {
        if (rolePermissions.role.id === roleId) {
          const newRolePermissions = {
            ...rolePermissions,
            permissions: {
              ...rolePermissions.permissions,
              groupForumsPermissions: {
                ...rolePermissions.permissions.groupForumsPermissions,
                [permissionName as keyof GroupPermissions['groupForumsPermissions']]: value
              }
            }
          };
          return newRolePermissions;
        }
        return rolePermissions;
      });
      queryClient.setQueryData(rolesPermissionsQueryKey, newRolesPermissions);
    },
    [rolesPermissions, queryClient, rolesPermissionsQueryKey]
  );

  const updateSelectedRoleUnifiedForumsPermission = useCallback(
    (roleId: number, unifiedPermissionName: string, value: boolean) => {
      const rolePermissionsQueryKey = getCategoryRolePermissionsKey(
        group.id,
        forumCategory.id,
        roleId
      );
      const currentPermissions = queryClient.getQueryData<ForumCategoryRolePermissionResponse>(
        rolePermissionsQueryKey
      );
      const currentPermissionMetadata = currentPermissions?.permissions?.[unifiedPermissionName];
      if (!currentPermissions || !currentPermissionMetadata) {
        return;
      }
      queryClient.setQueryData<ForumCategoryRolePermissionResponse>(rolePermissionsQueryKey, {
        ...currentPermissions,
        permissions: {
          ...currentPermissions.permissions,
          [unifiedPermissionName]: {
            ...currentPermissionMetadata,
            isGranted: value
          }
        }
      });
    },
    [group.id, forumCategory.id, queryClient]
  );

  const togglePermissionMutation = useMutation(
    async ({
      permissionName,
      value,
      roleId
    }: {
      permissionName: string;
      value: boolean;
      roleId: number;
    }) => {
      if (isUnified) {
        const unifiedPermissionName = getUnifiedForumPermissionName(permissionName);
        if (!unifiedPermissionName) {
          throw new Error(`Unsupported forum permission: ${permissionName}`);
        }
        // optimistically update state
        updateSelectedRoleUnifiedForumsPermission(roleId, unifiedPermissionName, value);
        return forumsService.updateUnifiedGroupForumCategoryRolePermissions(
          group.id,
          forumCategory.id,
          roleId,
          {
            [unifiedPermissionName]: value ? 'granted' : 'denied'
          }
        );
      }
      // optimistically update state
      updateSelectedRolesForumsPermission(roleId, permissionName, value);
      await forumsService.updateGroupForumCategoryRolesPermissions(
        group.id,
        forumCategory.id,
        roleId,
        {
          [permissionName]: value
        }
      );
      return undefined;
    },
    {
      onSuccess: (updatedPermissions, { roleId }) => {
        if (isUnified && updatedPermissions) {
          queryClient.setQueryData(
            getCategoryRolePermissionsKey(group.id, forumCategory.id, roleId),
            updatedPermissions
          );
        }
        systemFeedbackService.success(translate('Message.PermissionUpdateSuccess'));
      },
      onError: (
        err,
        {
          permissionName,
          value,
          roleId
        }: {
          permissionName: string;
          value: boolean;
          roleId: number;
        }
      ) => {
        if (isUnified) {
          const unifiedPermissionName = getUnifiedForumPermissionName(permissionName);
          if (unifiedPermissionName) {
            updateSelectedRoleUnifiedForumsPermission(roleId, unifiedPermissionName, !value);
          }
        } else {
          updateSelectedRolesForumsPermission(roleId, permissionName, !value);
        }
        systemFeedbackService.warning(networkErrorTranslation);
      }
    }
  );

  const selectedRolePermissionsConfiguration = useForumCategoryRolePermissionsConfiguration({
    features,
    isUnified,
    legacyPermissions: selectedRolePermissions?.permissions.groupForumsPermissions,
    unifiedPermissions: unifiedSelectedRolePermissions
  });

  const isLoading = useMemo(
    () =>
      isRolesPermissionsQueryLoading ||
      addRoleMutation.isLoading ||
      removeRoleMutation.isLoading ||
      (isUnified &&
        !!selectedRoleId &&
        resolvedRolePermissions[selectedRoleId]?.canEditPermissions === true &&
        isUnifiedSelectedRolePermissionsLoading),
    [
      isRolesPermissionsQueryLoading,
      isUnifiedSelectedRolePermissionsLoading,
      isUnified,
      resolvedRolePermissions,
      selectedRoleId,
      addRoleMutation,
      removeRoleMutation
    ]
  );

  const handleTogglePermission = useCallback(
    async (permissionName: string, value: boolean) => {
      if (!selectedRolePermissions) return;
      await togglePermissionMutation.mutateAsync({
        permissionName,
        value,
        roleId: selectedRolePermissions.role.id
      });
    },
    [selectedRolePermissions, togglePermissionMutation]
  );

  const handleRemoveRole = useCallback(async () => {
    if (!selectedRolePermissions) return;
    await removeRoleMutation.mutateAsync(selectedRolePermissions.role.id);
  }, [selectedRolePermissions, removeRoleMutation]);

  const noOp = useCallback(() => undefined, []);

  let roleRestrictedToggleContent: JSX.Element;
  if (isUnrestrictedMessagesCategory) {
    roleRestrictedToggleContent = (
      <React.Fragment>
        <Toggle
          label={translate('Label.RoleRestrictedToggle')}
          hint={translate('Description.RoleRestrictedToggle')}
          size='Medium'
          placement='End'
          isChecked={isRoleRestricted}
          isDisabled
          onCheckedChange={noOp}
          data-testid='restrict-category-toggle'
        />
        <span
          className='text-body-medium content-default opacity-[0.5] block'
          data-testid='unrestricted-messages-category-description'>
          {translate('Description.UnrestrictedMessagesCategory')}
        </span>
      </React.Fragment>
    );
  } else if (roleRestrictedToggleDisabled) {
    roleRestrictedToggleContent = (
      <Tooltip position='top-center' hasBeak title={translate('Label.RoleRestrictedAgeGate')}>
        <TooltipTrigger asChild>
          <div>
            <Toggle
              label={translate('Label.RoleRestrictedToggle')}
              hint={translate('Description.RoleRestrictedToggle')}
              size='Medium'
              placement='End'
              isChecked={isRoleRestricted}
              isDisabled
              onCheckedChange={noOp}
              data-testid='restrict-category-toggle'
            />
          </div>
        </TooltipTrigger>
      </Tooltip>
    );
  } else {
    roleRestrictedToggleContent = (
      <Toggle
        label={translate('Label.RoleRestrictedToggle')}
        hint={translate('Description.RoleRestrictedToggle')}
        size='Medium'
        placement='End'
        isChecked={isRoleRestricted}
        isDisabled={toggleRoleRestrictionMutation.isLoading}
        onCheckedChange={handleRoleRestrictedToggleChange}
        data-testid='restrict-category-toggle'
      />
    );
  }

  return (
    <React.Fragment>
      {isAddRoleDialogVisible && (
        <RoleSelectDialog
          groupId={group.id}
          onSelect={async role => {
            await addRoleMutation.mutateAsync(role.id);
          }}
          onClose={hideAddRoleDialog}
          hiddenRoleIds={roleIds}
          hideGuestRole
          hideOwnerRole
          isUnified={isUnified}
          resolvedRolePermissions={resolvedRolePermissions}
        />
      )}
      {isRemoveRoleRestrictionDialogVisible && (
        <Dialog
          open
          onOpenChange={handleRemoveRoleRestrictionDialogOpenChange}
          isModal
          size='Small'
          type='Default'
          hasCloseAffordance
          closeLabel={translate('Action.Close')}>
          <DialogContent data-testid='unrestrict-confirm-dialog'>
            <DialogTitle className='padding-right-large padding-left-large padding-top-large'>
              {translate('Heading.UnrestrictDialog')}
            </DialogTitle>
            <DialogBody>
              <p className='text-body-medium content-default'>
                {translate('Description.UnrestrictDialog')}
              </p>
            </DialogBody>
            <DialogFooter className='flex gap-x-small'>
              <Button
                variant='Emphasis'
                size='Medium'
                className='fill basis-0'
                onClick={confirmRemoveRoleRestriction}>
                {translate('Action.Continue')}
              </Button>
              <Button
                variant='Standard'
                size='Medium'
                className='fill basis-0'
                onClick={dismissRemoveRoleRestrictionDialog}>
                {translate('Action.Cancel')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <div className='group-forums-config-expanded'>
        <div className='group-forums-config-expanded-card'>
          {showRoleRestrictedToggle && (
            <div className='padding-bottom-medium border-bottom'>{roleRestrictedToggleContent}</div>
          )}
          <div
            className={classNames('text-body-medium content-emphasis', {
              'padding-top-medium': showRoleRestrictedToggle
            })}>
            {translate('Header.ForumCategoryPermissions')}
          </div>
          <div className='text-body-medium content-default'>
            {translate('Description.ForumCategoryPermissions')}
          </div>
          {isLoading ? (
            <div className='spinner spinner-default' />
          ) : (
            <div className='group-forums-roles-config'>
              <ConfigureRolesList
                roles={roles}
                selectedRoleId={selectedRoleId}
                onSelectRoleId={setSelectedRoleId}
                onAddRole={showAddRoleDialog}
                actionText={translate('Action.AddRole')}
              />
              {isRoleRestricted && roles.length === 0 && (
                <ForumRolesEmptyStateComponent translate={translate} />
              )}
              {selectedRolePermissions && selectedRolePermissionsConfiguration && (
                <div className='group-forum-roles-config-permissions'>
                  <ConfigureRolePermissionsSection
                    isChannelPermissions
                    permissionsConfiguration={selectedRolePermissionsConfiguration}
                    togglePermission={handleTogglePermission}
                  />
                  <Button
                    className='group-forum-roles-config-permissions-remove-role'
                    variant='Alert'
                    size='Medium'
                    onClick={handleRemoveRole}>
                    {translate('Action.RemoveRole')}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </React.Fragment>
  );
};

export default withTranslations(GroupForumsCategoryConfigSectionExpanded, groupsConfig);
