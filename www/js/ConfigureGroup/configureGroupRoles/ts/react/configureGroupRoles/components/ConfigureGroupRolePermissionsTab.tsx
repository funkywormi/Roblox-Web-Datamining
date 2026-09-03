import React, { useMemo } from 'react';
import { useTranslation } from 'react-utilities';
import { useSystemFeedback } from 'react-style-guide';
import { Divider } from '@rbx/foundation-ui';
import { GroupPermissions, PermissionConfigurationState, Role } from '../../shared/types';
import ConfigureRolePermissionsSection from '../../shared/components/ConfigureRolePermissionsSection';
import useGuacConfig from '../../shared/hooks/useGuacConfig';
import Banner from '../../shared/components/Banner';
import groupRolesService from '../services/groupRolesService';
import { useConfigurationMetadata } from '../../shared/contexts/ConfigurationMetadataContext';
import { useCommunityProductFeatures } from '../../shared/contexts/CommunityProductFeaturesContext';
import { isLockedOwnerRole } from '../../shared/utils/communityOwnership';
import groupRolesConstants from '../constants/groupRolesConstants';
import configureGroupConstants from '../../shared/constants/configureGroupConstants';

interface PermissionsTabProps {
  groupId: number;
  role: Role;
  isLoggedInUserOwner: boolean;
  permissions: GroupPermissions;
  onPermissionsUpdated?: (permissionName: string, value: boolean) => void;
}

const ROLE_SECTIONS_ORDER = [
  'groupPostsPermissions',
  'groupForumsPermissions',
  'groupMembershipPermissions',
  'groupEconomyPermissions',
  'groupManagementPermissions',
  'groupOpenCloudPermissions',
  'groupContentModerationPermissions'
];

const HEADING_TRANSLATIONS = {
  groupPostsPermissions: 'Heading.PostsPermissions',
  groupForumsPermissions: 'Heading.ForumsPermissions',
  groupMembershipPermissions: 'Heading.MembershipPermissions',
  groupEconomyPermissions: 'Heading.EconomyPermissions',
  groupManagementPermissions: 'Heading.ManagementPermissions',
  groupOpenCloudPermissions: 'Heading.OpenCloudPermissions',
  groupContentModerationPermissions: 'Heading.ContentModerationPermissions'
};

const EDITABLE_GUEST_PERMISSIONS = Object.keys(
  configureGroupConstants.permissions.guestPermissions
);

const IS_DISMISSED_FORUM_CATEGORY_BANNER_STORAGE_KEY = 'visit-categories-local-storage-key';

const PermissionsTab: React.FC<PermissionsTabProps> = ({
  groupId,
  role,
  isLoggedInUserOwner,
  permissions,
  onPermissionsUpdated
}) => {
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();
  const { roleConfiguration } = useConfigurationMetadata();
  const { isLoading, data: configureGroupUi } = useGuacConfig('configure-group-ui');
  const { minRank, maxRank } = roleConfiguration;
  const { features } = useCommunityProductFeatures();
  const isOwnerRolesetDeprecated = features.IsOwnerRolesetDeprecated;

  const isGuestRole = role.rank === minRank;
  const isOwnerRoleLocked = isLockedOwnerRole(role, maxRank, isOwnerRolesetDeprecated);

  const onPermissionToggled = async (permissionName: string, value: boolean) => {
    try {
      await groupRolesService.updateGroupRolePermissions(groupId, role.id, {
        [permissionName]: value
      });
      onPermissionsUpdated?.(permissionName, value);
      systemFeedbackService.success(translate('Message.PermissionUpdateSuccess'));
    } catch (error) {
      systemFeedbackService.warning(translate('Message.PermissionUpdateFail'));
    }
  };

  const permissionsConfigurationByCategory = useMemo(() => {
    const canEditPermission = (permissionName: string) => {
      if (!isLoggedInUserOwner) {
        return false;
      }
      // If here, logged in user is owner
      if (isOwnerRoleLocked) {
        return false;
      }
      if (isGuestRole) {
        return EDITABLE_GUEST_PERMISSIONS.includes(permissionName);
      }

      return true;
    };

    return Object.entries(permissions).reduce(
      (acc, [categoryKey, perms]) => ({
        ...acc,
        [categoryKey]: Object.entries(perms).reduce((categoryAcc, [permissionName, isEnabled]) => {
          if (configureGroupConstants.permissions.deprecatedPermissions[permissionName]) {
            return categoryAcc;
          }

          // Feature-gated permissions (e.g. Support Tickets) are hidden unless their community flag is on.
          const requiredFeature = configureGroupConstants.featureGatedPermissions[permissionName];
          if (requiredFeature && !features[requiredFeature]) {
            return categoryAcc;
          }

          return {
            ...categoryAcc,
            [permissionName]: {
              isEnabled: isEnabled as boolean,
              canEdit: canEditPermission(permissionName)
            }
          };
        }, {} as Record<string, PermissionConfigurationState>)
      }),
      {} as Record<string, Record<string, PermissionConfigurationState>>
    );
  }, [permissions, isLoggedInUserOwner, isOwnerRoleLocked, isGuestRole, features]);

  const showForumCategoryBanner = Boolean(
    !isLoading && configureGroupUi?.displayForumCategoryPermissionsConfiguration
  );

  const goToForumConfiguration = () => {
    window.location.hash = '#!/forums';
  };

  return (
    <React.Fragment>
      {ROLE_SECTIONS_ORDER.map((key, index) => {
        const categoryKey = key as keyof GroupPermissions;
        const title = translate(HEADING_TRANSLATIONS[categoryKey]);
        const isForumsSection = categoryKey === 'groupForumsPermissions';
        const isEconomySection = categoryKey === 'groupEconomyPermissions';
        const isLastCategory = index === ROLE_SECTIONS_ORDER.length - 1;
        return (
          <React.Fragment key={key}>
            <section>
              <h5 className='padding-bottom-medium text-title-large'>{title}</h5>
              {isForumsSection && showForumCategoryBanner && (
                <div className='permissions-category-banner-wrapper margin-bottom-small'>
                  <Banner
                    title={translate('Header.ForumCategoryPermissions')}
                    content={translate('Description.CategoryPermissionsUpsell')}
                    buttonText={translate('Action.VisitCategories')}
                    onClickButton={goToForumConfiguration}
                    isDismissedLocalStorageKey={IS_DISMISSED_FORUM_CATEGORY_BANNER_STORAGE_KEY}
                    flavor='flat'
                  />
                </div>
              )}
              {isEconomySection && (
                <div className='permissions-category-banner-wrapper margin-bottom-small'>
                  <Banner
                    title={translate('Heading.PermissionsMovedToCH')}
                    content={translate('Message.PermissionsMovedToCH')}
                    buttonText={translate('Action.ConfigureInHub')}
                    buttonHref={groupRolesConstants.urls.getCreatorHubGroupRolesUrl(groupId)}
                    iconName='icon-regular-key'
                    dismissable={false}
                    flavor='creatorHub'
                  />
                </div>
              )}
              <ConfigureRolePermissionsSection
                isChannelPermissions={false}
                permissionsConfiguration={permissionsConfigurationByCategory[categoryKey]}
                togglePermission={onPermissionToggled}
              />
            </section>
            {!isLastCategory && <Divider className='margin-y-small' />}
          </React.Fragment>
        );
      })}
    </React.Fragment>
  );
};

export default PermissionsTab;
