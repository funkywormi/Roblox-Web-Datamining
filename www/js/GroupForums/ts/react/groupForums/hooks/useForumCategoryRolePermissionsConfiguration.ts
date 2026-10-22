import { useMemo } from 'react';
import type { CommunityProductFeatures, PermissionConfigurationState } from '../../shared/types';
import configureGroupConstants from '../../shared/constants/configureGroupConstants';
import type { ForumCategoryRolePermissionResponse } from '../types';
import { mapForumCategoryRolePermissions } from '../services/unifiedForumPermissions';

type UseForumCategoryRolePermissionsConfigurationOptions = {
  features: CommunityProductFeatures;
  permissions?: ForumCategoryRolePermissionResponse;
};

const filterFeatureGatedPermissions = (
  configuration: Record<string, PermissionConfigurationState>,
  features: CommunityProductFeatures
): Record<string, PermissionConfigurationState> =>
  Object.entries(configuration).reduce<Record<string, PermissionConfigurationState>>(
    (visiblePermissions, [permissionName, permission]) => {
      const requiredFeature = configureGroupConstants.featureGatedPermissions[permissionName];
      if (requiredFeature && !features[requiredFeature]) {
        return visiblePermissions;
      }
      return {
        ...visiblePermissions,
        [permissionName]: permission
      };
    },
    {}
  );

export default function useForumCategoryRolePermissionsConfiguration({
  features,
  permissions
}: UseForumCategoryRolePermissionsConfigurationOptions):
  | Record<string, PermissionConfigurationState>
  | undefined {
  return useMemo(() => {
    const configuration = permissions && mapForumCategoryRolePermissions(permissions);

    return configuration ? filterFeatureGatedPermissions(configuration, features) : configuration;
  }, [features, permissions]);
}
