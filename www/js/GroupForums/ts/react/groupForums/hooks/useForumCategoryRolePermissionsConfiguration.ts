import { useMemo } from 'react';
import type {
  CommunityProductFeatures,
  GroupPermissions,
  PermissionConfigurationState
} from '../../shared/types';
import configureGroupConstants from '../../shared/constants/configureGroupConstants';
import type { ForumCategoryRolePermissionResponse } from '../types';
import { mapForumCategoryRolePermissions } from '../services/unifiedForumPermissions';

type UseForumCategoryRolePermissionsConfigurationOptions = {
  features: CommunityProductFeatures;
  isUnified: boolean;
  legacyPermissions?: GroupPermissions['groupForumsPermissions'];
  unifiedPermissions?: ForumCategoryRolePermissionResponse;
};

const mapLegacyPermissions = (
  permissions: GroupPermissions['groupForumsPermissions']
): Record<string, PermissionConfigurationState> =>
  Object.entries(permissions).reduce<Record<string, PermissionConfigurationState>>(
    (configuration, [permissionName, isEnabled]) => ({
      ...configuration,
      [permissionName]: { isEnabled, canEdit: true }
    }),
    {}
  );

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
  isUnified,
  legacyPermissions,
  unifiedPermissions
}: UseForumCategoryRolePermissionsConfigurationOptions):
  | Record<string, PermissionConfigurationState>
  | undefined {
  return useMemo(() => {
    const configuration = isUnified
      ? unifiedPermissions && mapForumCategoryRolePermissions(unifiedPermissions)
      : legacyPermissions && mapLegacyPermissions(legacyPermissions);

    return configuration ? filterFeatureGatedPermissions(configuration, features) : configuration;
  }, [features, isUnified, legacyPermissions, unifiedPermissions]);
}
