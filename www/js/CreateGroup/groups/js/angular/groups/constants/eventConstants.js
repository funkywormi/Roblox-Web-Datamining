import groupsModule from '../groupsModule';

const eventConstants = {
  EventType: {
    CommunityDialogStateChanged: 'communityDialogStateChanged',
    GroupPageClickEvent: 'groupPageClickEvent',
    GroupPageExposureEvent: 'groupPageExposureEvent'
  },

  EventContext: {
    GroupHomepage: 'groupHomepage',
    GroupDiscovery: 'groupDiscovery',
    MyGroups: 'myGroups',
    ConfigureGroup: 'configureGroup',
    CommunitiesSearch: 'communitiesSearch'
  },

  // Community entry-point / search instrumentation (GRPS-3060).
  EntryPoint: {
    CommunitiesSearch: 'communitiesSearch'
  },

  EntryPointDetail: {
    // keyword search results
    SearchResults: 'searchResults',
    // landing / suggested-keyword category rows
    CategoryBrowse: 'categoryBrowse',
    // Friends' Communities carousel on the landing page
    FriendsCommunities: 'friendsCommunities'
  },

  SearchSurface: {
    CommunitiesSearch: 'communitiesSearch'
  },

  ExposureType: {
    GroupHomepage: 'groupHomepage',
    MyGroups: 'myGroups',
    GroupDiscovery: 'GroupDiscovery',
    GroupDiscoveryV2: 'GroupDiscoveryV2'
  },

  EventEntityType: {
    Group: 'group'
  },

  ConfigureSettingsClickTargetType: {
    VerificationLevel: 'configureSettings.verificationLevel',
    AccountTenureRequirement: 'configureSettings.accountTenureRequirement',
    ManualApproval: 'configureSettings.manualApproval',
    GroupFundsVisible: 'configureSettings.groupFundsVisible',
    GroupGamesVisible: 'configureSettings.groupGamesVisible',
    EnemiesAllowed: 'configureSettings.enemiesAllowed'
  }
};

groupsModule.constant('eventConstants', eventConstants);
