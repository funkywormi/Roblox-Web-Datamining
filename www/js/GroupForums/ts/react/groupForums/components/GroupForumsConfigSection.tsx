import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { withTranslations, WithTranslationsProps, useTheme } from 'react-utilities';
import { Button } from '@rbx/foundation-ui';
import { useSystemFeedback, Loading } from 'react-style-guide';
import { UIThemeProvider } from '@rbx/ui';
import { MIGRATION_STATUS, useGetMigrationStatus } from '@rbx/group-management';
import { groupsConfig } from '../translation.config';
import {
  Group,
  GroupPermissions,
  GroupChannelPermissions,
  GroupConfigurationMetadata
} from '../../shared/types';
import Banner from '../../shared/components/Banner';
import { ForumCategory } from '../types';
import forumsService from '../services/forumsService';
import CreateOrUpdateForumCategoryDialog from './dialogs/CreateOrUpdateForumCategoryDialog';
import GroupForumsCategoryConfigSection from './GroupForumsCategoryConfigSection';
import GroupForumsUpsell from './GroupForumsUpsell';
import groupForumsConstants from '../constants/groupForumsConstants';
import { ConfigurationMetadataProvider } from '../../shared/contexts/ConfigurationMetadataContext';
import {
  CommunityProductFeaturesContextProvider,
  useCommunityProductFeatures
} from '../../shared/contexts/CommunityProductFeaturesContext';
import { CommunityFeatureFreezesContextProvider } from '../../shared/contexts/CommunityFeatureFreezesContext';
import { DraggableList } from '../../shared/components/DraggableList';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import AgeAssuranceUpsell from './AgeAssuranceUpsell';
import { mapResolvedForumCategoryPermissions } from '../services/unifiedForumPermissions';
import useResolvedGroupRolePermissions from '../hooks/useResolvedGroupRolePermissions';

// Persisted dismissal key for the forum-categories bug-reporting education banner.
const BUG_REPORTING_CATEGORIES_UPSELL_DISMISSED_KEY =
  'Roblox.Groups.BugReportingForumCategoriesUpsellDismissed';

export type GroupForumsConfigSectionProps = {
  group: Group;
  permissions: GroupPermissions;
  channelsPermissions: GroupChannelPermissions[];
  displayPermissionsConfig: boolean;
  metadata: GroupConfigurationMetadata;
} & WithTranslationsProps;

// Inner component carries the actual section logic. The exported wrapper below installs the
// CommunityProductFeaturesContext (read by RoleSelectDialog -> isLockedOwnerRole) so callers
// of `renderGroupForumsConfigSection` don't have to know about the context themselves -- mirrors
// the pattern Providers.tsx already uses for the main forum view.
const GroupForumsConfigSectionInner = ({
  group,
  permissions,
  channelsPermissions,
  displayPermissionsConfig,
  metadata,
  translate
}: GroupForumsConfigSectionProps): JSX.Element | null => {
  const { SystemFeedbackComponent, systemFeedbackService } = useSystemFeedback();
  const theme = useTheme();
  const { features, isLoading: areProductFeaturesLoading } = useCommunityProductFeatures();
  const isUnifiedUIEnabled = features.IsUnifiedUIEnabled === true;
  const { data: migrationStatus, isLoading: isMigrationStatusLoading } = useGetMigrationStatus(
    group.id,
    {
      enabled: isUnifiedUIEnabled
    }
  );
  const isUnified = isUnifiedUIEnabled && migrationStatus?.status === MIGRATION_STATUS.MIGRATED;

  const {
    data: resolvedRolePermissions,
    isLoading: areResolvedRolePermissionsLoading
  } = useResolvedGroupRolePermissions({
    groupId: group.id,
    enabled: isUnified,
    onError: () => systemFeedbackService.warning(translate('NetworkError'))
  });
  const editableRoleIds = useMemo(
    () =>
      Object.entries(resolvedRolePermissions ?? {})
        .filter(([, rolePermissions]) => rolePermissions.canEditPermissions === true)
        .map(([roleId]) => roleId),
    [resolvedRolePermissions]
  );
  const canManageRolePermissions = useMemo(() => isUnified && editableRoleIds.length > 0, [
    editableRoleIds,
    isUnified
  ]);

  const [isCreateForumCategoryDialogVisible, setIsCreateForumCategoryDialogVisible] = useState(
    false
  );
  const [forumCategories, setForumCategories] = useState<ForumCategory[]>([]);
  const [unfilteredForumCategoriesCount, setUnfilteredForumCategoriesCount] = useState<number>(0);
  const [
    unfilteredArchivedForumCategoriesCount,
    setUnfilteredArchivedForumCategoriesCount
  ] = useState<number>(0);
  const [archivedForumCategories, setArchivedForumCategories] = useState<ForumCategory[]>([]);
  const [resolvedCategoryPermissions, setResolvedCategoryPermissions] = useState<
    Record<string, GroupPermissions['groupForumsPermissions']>
  >({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [networkError, setNetworkError] = useState<boolean>(false);
  const showRoles = isUnified
    ? canManageRolePermissions
    : permissions.groupMembershipPermissions.changeRank;

  const hasGroupLevelCategoryManagement =
    permissions.groupForumsPermissions?.manageCategories ?? false;

  // Users need this permission at the group level to order categories
  const hasPermissionsToOrderForumCategories = hasGroupLevelCategoryManagement;

  const canManageLegacyCategory = useCallback(
    (category: ForumCategory) => {
      if (channelsPermissions) {
        const groupForumsPermissions = channelsPermissions.find(
          channelPermissions => channelPermissions.channelId === category.id
        )?.groupForumsPermissions;
        // If this category was just added then we haven't refreshed the users membership yet so won't be able to find the channelPermissions for it
        // So in that case assume they can manage it, since it was just added by them
        return groupForumsPermissions ? groupForumsPermissions.manageCategories : true;
      }
      return hasGroupLevelCategoryManagement;
    },
    [channelsPermissions, hasGroupLevelCategoryManagement]
  );

  const canManageCategory = useCallback(
    (category: ForumCategory) =>
      isUnified
        ? resolvedCategoryPermissions[category.id]?.manageCategories ?? false
        : canManageLegacyCategory(category),
    [canManageLegacyCategory, isUnified, resolvedCategoryPermissions]
  );

  const fetchForumCategories = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!group?.id) {
        return;
      }
      const silent = options?.silent ?? false;
      try {
        if (!silent) {
          setIsLoading(true);
        }
        const [getCategoriesResponse, getArchivedCategoriesResponse] = await Promise.all([
          forumsService.getGroupForumCategories(group.id, false),
          forumsService.getGroupForumCategories(group.id, true)
        ]);
        if (isUnified) {
          const allCategories = [
            ...getCategoriesResponse.data,
            ...getArchivedCategoriesResponse.data
          ];
          const categoryPermissions: Record<
            string,
            GroupPermissions['groupForumsPermissions']
          > = {};
          const resolvedPermissions = await Promise.all(
            allCategories.map(async category => {
              try {
                const response = await forumsService.getResolvedGroupForumCategoryPermissions(
                  group.id,
                  category.id
                );
                return [category.id, mapResolvedForumCategoryPermissions(response)] as const;
              } catch {
                return undefined;
              }
            })
          );
          resolvedPermissions.forEach(resolvedPermission => {
            if (resolvedPermission) {
              const [categoryId, categoryPermission] = resolvedPermission;
              categoryPermissions[categoryId] = categoryPermission;
            }
          });
          if (resolvedPermissions.some(resolvedPermission => resolvedPermission === undefined)) {
            systemFeedbackService.warning(translate('NetworkError'));
          }
          setResolvedCategoryPermissions(categoryPermissions);
          const canViewFetchedCategory = (category: ForumCategory) =>
            canManageRolePermissions ||
            (categoryPermissions[category.id]?.manageCategories ?? false);
          setForumCategories(getCategoriesResponse.data.filter(canViewFetchedCategory));
          setArchivedForumCategories(
            getArchivedCategoriesResponse.data.filter(canViewFetchedCategory)
          );
        } else {
          // Group-level category managers can order every active category, so they see them all.
          setForumCategories(
            hasPermissionsToOrderForumCategories
              ? getCategoriesResponse.data
              : getCategoriesResponse.data.filter(canManageLegacyCategory)
          );
          setArchivedForumCategories(
            getArchivedCategoriesResponse.data.filter(canManageLegacyCategory)
          );
        }
        setUnfilteredForumCategoriesCount(getCategoriesResponse.data.length);
        setUnfilteredArchivedForumCategoriesCount(getArchivedCategoriesResponse.data.length);
      } catch {
        systemFeedbackService.warning(translate('NetworkError'));
        if (!silent) {
          setNetworkError(true);
        }
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [
      group.id,
      translate,
      setIsLoading,
      setForumCategories,
      systemFeedbackService,
      canManageLegacyCategory,
      canManageRolePermissions,
      hasPermissionsToOrderForumCategories,
      isUnified
    ]
  );

  const refetchForumCategories = useCallback(async () => {
    await fetchForumCategories({ silent: true });
  }, [fetchForumCategories]);

  const orderForumCategories = useCallback(
    async (categories: ForumCategory[]) => {
      const categoryIds = categories.map(category => category.id);
      const previousCategories = forumCategories;
      setForumCategories(categories);
      try {
        await forumsService.orderGroupForumCategories(group.id, categoryIds);
        systemFeedbackService.success(translate('Message.CategoriesOrderSuccess'));
      } catch {
        systemFeedbackService.warning(translate('NetworkError'));
        setForumCategories(previousCategories);
      }
    },
    [forumCategories, setForumCategories, group.id, systemFeedbackService, translate]
  );

  const upsellFinished = useCallback(async () => {
    await fetchForumCategories();
  }, [fetchForumCategories]);

  const canAddForumCategory = useMemo(() => {
    return (
      unfilteredForumCategoriesCount + unfilteredArchivedForumCategoriesCount <
      groupForumsConstants.limits.maxNumberOfCategories
    );
  }, [unfilteredForumCategoriesCount, unfilteredArchivedForumCategoriesCount]);
  const hasAllActiveForumCategories = forumCategories.length === unfilteredForumCategoriesCount;

  // Users need this permission at the group level to add new categories
  const hasPermissionsToAddForumCategory = hasGroupLevelCategoryManagement;

  useEffect(() => {
    if (
      areProductFeaturesLoading ||
      (isUnifiedUIEnabled && isMigrationStatusLoading) ||
      (isUnified && areResolvedRolePermissionsLoading)
    ) {
      return;
    }
    // eslint-disable-next-line no-void
    void fetchForumCategories();
  }, [
    areProductFeaturesLoading,
    areResolvedRolePermissionsLoading,
    fetchForumCategories,
    isUnifiedUIEnabled,
    isMigrationStatusLoading,
    isUnified
  ]);

  const showCreateForumCategoryDialog = useCallback(() => {
    setIsCreateForumCategoryDialogVisible(true);
  }, [setIsCreateForumCategoryDialogVisible]);

  const hideCreateForumCategoryDialog = useCallback(() => {
    setIsCreateForumCategoryDialogVisible(false);
  }, [setIsCreateForumCategoryDialogVisible]);

  const goToRolesConfiguration = () => {
    window.location.hash = '#!/roles';
  };

  const configureGuacConfig = useGuacConfig('configure-group-ui');
  const displayForumCategoryOrderConfiguration = configureGuacConfig.isLoading
    ? false
    : configureGuacConfig.data.displayForumCategoryOrderConfiguration;

  if (networkError) {
    // Don't show the upsell if there was a network error, instead just show nothing
    // If a network error occured then the user will get a toast saying to try again
    return null;
  }
  if (
    // Only show the upsell if no forum categories at all have been created
    unfilteredForumCategoriesCount === 0 &&
    unfilteredArchivedForumCategoriesCount === 0 &&
    hasPermissionsToAddForumCategory
  ) {
    if (isLoading) {
      return <Loading />;
    }
    return (
      <UIThemeProvider
        theme={theme === 'dark' ? 'foundation-dark' : 'foundation-light'}
        cssBaselineMode='disabled'>
        <div className='section-content remove-panel'>
          <GroupForumsUpsell group={group} onFinished={upsellFinished} />
          <SystemFeedbackComponent />
        </div>
      </UIThemeProvider>
    );
  }
  return (
    <ConfigurationMetadataProvider metadata={metadata}>
      <div className='section-content remove-panel group-forums-config-section'>
        <AgeAssuranceUpsell kind='configureForumCategories' />
        {showRoles && features.ForumsAttachmentsCreate && (
          <Banner
            title={translate('Heading.BugReportingForumCategoriesUpsell')}
            content={translate('Description.BugReportingForumCategoriesUpsell')}
            iconName='icon-regular-diamond-simplified'
            buttonText={translate('Action.BugReportingEnable')}
            buttonVariant='Emphasis'
            onClickButton={goToRolesConfiguration}
            isDismissedLocalStorageKey={BUG_REPORTING_CATEGORIES_UPSELL_DISMISSED_KEY}
          />
        )}
        <div className='group-forums-config-section-header'>
          <h2>{translate('Heading.Categories')}</h2>
          {hasPermissionsToAddForumCategory && (
            <React.Fragment>
              <Button
                isDisabled={!canAddForumCategory}
                className='group-forums-config-add-category-button'
                variant='Emphasis'
                onClick={showCreateForumCategoryDialog}
                size='Medium'>
                {translate('Action.AddForumCategory')}
              </Button>
              {!canAddForumCategory && (
                <span className='text-secondary'>
                  {translate('Description.MaxNumberOfCategoriesReached', {
                    maxNumberOfCategories: groupForumsConstants.limits.maxNumberOfCategories
                  })}
                </span>
              )}
            </React.Fragment>
          )}
        </div>
        {isCreateForumCategoryDialogVisible && (
          <CreateOrUpdateForumCategoryDialog
            groupId={group.id}
            forumCategory={null}
            onSuccess={refetchForumCategories}
            onClose={hideCreateForumCategoryDialog}
          />
        )}
        {isLoading ? (
          <Loading />
        ) : (
          <div className='group-forums-config-categories'>
            <div className='group-forums-config-categories-list'>
              <DraggableList
                enabled={
                  hasPermissionsToOrderForumCategories &&
                  hasAllActiveForumCategories &&
                  (displayForumCategoryOrderConfiguration ?? false)
                }
                items={forumCategories}
                getItemId={forumCategory => forumCategory.id}
                handleItemsOrderChange={orderForumCategories}
                renderItem={(forumCategory: ForumCategory) => {
                  return (
                    <GroupForumsCategoryConfigSection
                      key={forumCategory.id}
                      group={group}
                      forumCategory={forumCategory}
                      refetchForumCategories={refetchForumCategories}
                      displayPermissionsConfig={displayPermissionsConfig}
                      canManageCategory={canManageCategory(forumCategory)}
                      canManageRolePermissions={canManageRolePermissions}
                      isUnified={isUnified}
                      resolvedRolePermissions={resolvedRolePermissions ?? {}}
                    />
                  );
                }}
              />
            </div>
            {archivedForumCategories.length > 0 && (
              <h2>{translate('Heading.ArchivedCategories')}</h2>
            )}
            <div className='group-forums-config-categories-list'>
              {archivedForumCategories.map(forumCategory => (
                <GroupForumsCategoryConfigSection
                  key={forumCategory.id}
                  group={group}
                  forumCategory={forumCategory}
                  isDeleteDisabled={false}
                  isArchiveDisabled={false}
                  refetchForumCategories={refetchForumCategories}
                  displayPermissionsConfig={displayPermissionsConfig}
                  canManageCategory={canManageCategory(forumCategory)}
                  canManageRolePermissions={canManageRolePermissions}
                  isUnified={isUnified}
                  resolvedRolePermissions={resolvedRolePermissions ?? {}}
                />
              ))}
            </div>
          </div>
        )}
        <SystemFeedbackComponent />
      </div>
    </ConfigurationMetadataProvider>
  );
};

const GroupForumsConfigSection = (props: GroupForumsConfigSectionProps): JSX.Element | null => {
  const { group, permissions } = props;
  return (
    <CommunityProductFeaturesContextProvider groupId={group.id}>
      <CommunityFeatureFreezesContextProvider
        groupId={group.id}
        isOwner={permissions.groupForumsPermissions?.manageCategories ?? false}>
        <GroupForumsConfigSectionInner {...props} />
      </CommunityFeatureFreezesContextProvider>
    </CommunityProductFeaturesContextProvider>
  );
};

export default withTranslations(GroupForumsConfigSection, groupsConfig);
