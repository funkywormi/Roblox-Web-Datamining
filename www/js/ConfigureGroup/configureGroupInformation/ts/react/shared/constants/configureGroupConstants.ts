import { EnvironmentUrls } from 'Roblox';
import { roleSettings } from '../../../../js/shared/constants/roleSettingsConstants';
import { CommunityProductFeatures } from '../types';

export default {
  roleSettingsTranslationKey: {
    ...roleSettings,
    createBugReports: 'Label.CreateBugReports'
  } as Record<string, string>,
  // These are not included in the shared JS file because these translation strings are only used in React
  channelRoleSettingsTranslationKey: {
    manageCategories: 'Label.ManageForumCategory'
  } as Record<string, string>,

  // Forum permissions that should only render when the mapped community feature flag is enabled.
  featureGatedPermissions: {
    createBugReports: 'ForumsAttachmentsCreate'
  } as Record<string, keyof CommunityProductFeatures>,

  permissions: {
    guestPermissions: {
      viewStatus: true,
      viewForums: true
    } as Record<string, boolean>,
    deprecatedPermissions: {
      manageClan: true,
      addGroupPlaces: true,
      viewGroupPayouts: true,
      advertiseGroup: true,
      viewWall: true,
      postToWall: true,
      deleteFromWall: true
    } as Record<string, boolean>
  },

  urls: {
    getGroupConfigurationUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/configuration`
  }
};
