import { httpService } from 'core-utilities';
import { groupSettingsConstants } from '../constants/groupSettingsConstants';

export interface GroupSettings {
  verificationLevel: string;
  accountTenureRequirement: string;
  isApprovalRequired: boolean;
  areGroupFundsVisible: boolean;
  areGroupGamesVisible: boolean;
  areEnemiesAllowed: boolean;
  isMemberListVisibleToPublic: boolean;
  isAutoAssignRoleDisabled?: boolean;
}

export interface ConfigureGroupPolicies {
  displayGroupFundsAndRobuxIcon: boolean;
  displayPlayerUsername: boolean;
  displayGroupForumsConfiguration: boolean;
  displayJoinRequirementsSetting: boolean;
  displayUploadGroupIcon: boolean;
  displayGroupPrivacySettings: boolean;
  displayGroupBans: boolean;
  displayGroupRolesSynced: boolean;
  systemGroupMessage: string;
  displayContentModerationConfiguration: boolean;
  isGroupVerificationRequiredToJoin: boolean;
  displayAccountTenureVerification: boolean;
  displaySlowmodeConfiguration: boolean;
  displayMemberListVisibilityConfiguration?: boolean;
}

export interface GroupConfigurationLayout {
  settingsError?: string;
  isOwner: boolean;
}

export interface GroupConfigurationMetadata {
  isDefaultEmblemPolicyEnabled: boolean;
  roleConfiguration: {
    maxRank: number;
  };
}

const groupSettingsService = {
  /**
   * Get group settings
   */
  async getGroupSettings(groupId: number): Promise<GroupSettings> {
    const urlConfig = {
      url: groupSettingsConstants.urls.getGroupSettings(groupId),
      withCredentials: true
    };

    const response = await httpService.get<GroupSettings>(urlConfig);
    const settings = response.data;

    // Apply defaults if values are missing
    if (!settings.verificationLevel) {
      settings.verificationLevel = groupSettingsConstants.verificationLevels.none;
    }
    if (
      settings.accountTenureRequirement === undefined ||
      settings.accountTenureRequirement === null
    ) {
      settings.accountTenureRequirement = groupSettingsConstants.accountTenureRequirements.none;
    }

    return settings;
  },

  /**
   * Update a specific group setting
   */
  async updateGroupSetting(
    groupId: number,
    settingName: string,
    value: string | boolean
  ): Promise<void> {
    const urlConfig = {
      url: groupSettingsConstants.urls.updateGroupSettings(groupId),
      withCredentials: true
    };

    const updateRequest = {
      [settingName]: value
    };

    await httpService.patch(urlConfig, updateRequest);
  }
};

export default groupSettingsService;
