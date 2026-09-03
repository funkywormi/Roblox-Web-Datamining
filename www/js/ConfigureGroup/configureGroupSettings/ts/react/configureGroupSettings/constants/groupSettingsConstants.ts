import groupConstants from '../../shared/constants/groupConstants';

export const groupSettingsConstants = {
  urls: {
    getGroupSettings: (groupId: number): string => groupConstants.urls.getGroupSettingsURL(groupId),
    updateGroupSettings: (groupId: number): string =>
      groupConstants.urls.getGroupSettingsURL(groupId)
  },

  verificationLevels: {
    none: 'None',
    low: 'Low',
    medium: 'Medium',
    high: 'High'
  },

  accountTenureRequirements: {
    none: 'None',
    oneDay: 'OneDay',
    threeDays: 'ThreeDays',
    oneWeek: 'OneWeek',
    oneMonth: 'OneMonth',
    threeMonths: 'ThreeMonths'
  }
};

export const eventConstants = {
  ConfigureSettingsClickTargetType: {
    VerificationLevel: 'verificationLevel',
    AccountTenureRequirement: 'accountTenureRequirement',
    ManualApproval: 'manualApproval',
    GroupFundsVisible: 'groupFundsVisible',
    GroupGamesVisible: 'groupGamesVisible',
    EnemiesAllowed: 'enemiesAllowed'
  },
  EventContext: {
    ConfigureGroup: 'configureGroup'
  }
};
