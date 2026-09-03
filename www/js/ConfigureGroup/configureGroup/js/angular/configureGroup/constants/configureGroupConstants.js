import { EnvironmentUrls } from 'Roblox';
import configureGroupModule from '../configureGroupModule';
import { roleSettings } from '../../../shared/constants/roleSettingsConstants';

const configureGroupConstants = {
  pageSize: 18,
  loadPageSize: 50,

  urls: {
    groupMembersUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/users`,
    groupRelationshipsRequestsUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/relationships/{groupRelationshipType}/requests`,
    updateGroupDescriptionUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/description`,
    getAuditLogUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/audit-log`,
    changeNameUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/name`,
    updateGroupIconUrl: `${EnvironmentUrls.groupsApi}/v1/groups/icon?groupId={groupId}`,
    updateGroupCoverPhotoUrl: `${EnvironmentUrls.groupsApi}/v1/groups/cover-photo?groupId={groupId}`,
    createGroupRoleUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/rolesets/create`,
    updateGroupRoleUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/rolesets/{roleId}`,
    deleteGroupRoleUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/rolesets/{roleId}`,
    updateGroupRolePermissions: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/roles/{roleSetId}/permissions`,
    groupRelationshipUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/relationships/{groupRelationshipType}/{relatedGroupId}`,
    groupMemberRequestsUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/join-requests`,
    groupMemberRequestUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/join-requests/users/{userId}`,
    groupAffiliateRequestUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/relationships/{groupRelationshipType}/requests/{relatedGroupId}`,
    groupAffiliateRequestsUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/relationships/{groupRelationshipType}/requests`,
    getAllGroupRolePermissions: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/roles/permissions`,
    getEconomyMetadataUrl: `${EnvironmentUrls.economyApi}/v2/metadata`,
    getOrganizationUrl: `${EnvironmentUrls.apiGatewayUrl}/orgs/v1/organizations`,
    getUserOrgRolesUrl: `${EnvironmentUrls.apiGatewayUrl}/orgs/v1/organizations/{organizationId}/users/{userId}/roles`,
    getRolePermissionsUrl: `${EnvironmentUrls.apiGatewayUrl}/orgs/v2/organizations/{organizationId}/roles/{roleId}/permissions`,
    getGroupConfigurationUrl: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/configuration`
  },

  translations: {
    noAction: 'Action.No',
    cancelAction: 'Action.Cancel',
    buildGroupRolesListError: 'Message.BuildGroupRolesListError',
    loadGroupError: 'Message.LoadGroupError',
    loadGroupMetadataError: 'Message.LoadGroupMetadataError',
    loadGroupsListError: 'Message.LoadGroupMembershipsError',
    loadGroupMembershipError: 'Message.LoadUserGroupMembershipError',
    defaultError: 'Message.DefaultError',
    exileUserWarning: 'Heading.ExileUserWarning',
    exileUserWarningText: 'Description.KickUserWarning',
    exileUserAction: 'Action.Kick',
    configureCommunityHeading: 'Heading.ConfigureGroup'
  },

  strings: {
    rankReservedError:
      'Ranks must be between {minRankPlusOne} and {maxRankMinusOne}. {minRank} and {maxRank} are reserved for guests and the owner.'
  },

  permissions: {
    guestPermissions: {
      viewWall: true,
      viewStatus: true,
      viewForums: true
    },
    deprecatedPermissions: {
      manageClan: true,
      addGroupPlaces: true,
      viewGroupPayouts: true,
      advertiseGroup: true
    }
  },

  filterTerms: {
    all: -1
  },

  permissionTypeCollapseToggle: {
    nameOfOpen: 'Action.Show',
    nameOfClose: 'Action.Collapse'
  },

  groupSettings: {
    approvalRequired: 'isApprovalRequired',
    enemiesAllowed: 'areEnemiesAllowed',
    groupFundsVisible: 'areGroupFundsVisible',
    groupGamesVisible: 'areGroupGamesVisible'
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
  },

  menuOptionNames: {
    information: 'information',
    communityTier: 'communityTier',
    settings: 'settings',
    socialLinks: 'socialLinks',
    revenue: 'revenue',
    members: 'members',
    roles: 'roles',
    contentModeration: 'contentModeration',
    affiliates: 'affiliates',
    auditLog: 'auditLog',
    forums: 'forums',
    analytics: 'analytics'
  },

  submenuOptionNames: {
    summary: 'summary',
    sales: 'sales',
    publishingAdvanceRebates: 'publishingAdvanceRebates',
    commissions: 'commissions',
    payouts: 'payouts',
    allies: 'allies',
    enemies: 'enemies',
    addFunds: 'addFunds'
  },

  policies: {
    displayUploadGroupIcon: false,
    displayCoverPhotoUpload: false,
    displayGroupPrivacySettings: false,
    displayGroupFundsAndRobuxIcon: false,
    displayGroupForumsConfiguration: false,
    displayGroupBans: false,
    displayGroupRolesSynced: false,
    displayContentModerationConfiguration: false,
    isGroupVerificationRequiredToJoin: false,
    displayAccountTenureVerification: false,
    displayMemberListVisibilityConfiguration: false,
    useGroupAuditLogDisplayNamesForUser: false,
    displayGroupAnalyticsConfiguration: false,
    displayCommunityTiersConfiguration: false,
    isReactAuditLogEnabled: false
  },

  menuOptions: [
    {
      name: 'information',
      translationKey: 'Heading.Information',
      submenuOptions: []
    },
    {
      name: 'communityTier',
      translationKey: 'Heading.CommunityTier',
      submenuOptions: []
    },
    {
      name: 'settings',
      translationKey: 'Heading.Settings',
      submenuOptions: []
    },
    {
      name: 'socialLinks',
      translationKey: 'Heading.SocialLinks',
      submenuOptions: []
    },
    {
      name: 'revenue',
      translationKey: 'Heading.Revenue',
      submenuOptions: [
        {
          name: 'summary',
          translationKey: 'Heading.Summary'
        },
        {
          name: 'sales',
          translationKey: 'Heading.Sales'
        },
        {
          name: 'publishingAdvanceRebates',
          translationKey: 'Heading.PublishingAdvanceRebates'
        },
        {
          name: 'commissions',
          translationKey: 'Heading.Commissions'
        },
        {
          name: 'payouts',
          translationKey: 'Heading.Payouts'
        },
        {
          name: 'addFunds',
          translationKey: 'Heading.AddFunds'
        }
      ]
    },
    {
      name: 'members',
      translationKey: 'Heading.Members',
      submenuOptions: []
    },
    {
      name: 'roles',
      translationKey: 'Heading.Roles',
      showNewPill: true,
      submenuOptions: []
    },
    {
      name: 'contentModeration',
      translationKey: 'Heading.ContentModeration',
      submenuOptions: []
    },
    {
      name: 'affiliates',
      translationKey: 'Heading.Affiliates',
      submenuOptions: [
        {
          name: 'allies',
          translationKey: 'Heading.Allies'
        },
        {
          name: 'enemies',
          translationKey: 'Heading.Enemies'
        }
      ]
    },
    {
      name: 'auditLog',
      translationKey: 'Heading.AuditLog',
      submenuOptions: []
    },
    {
      name: 'forums',
      translationKey: 'Heading.Forums',
      submenuOptions: []
    },
    {
      name: 'analytics',
      translationKey: 'Heading.Analytics',
      submenuOptions: []
    }
  ],

  memberTabs: {
    members: {
      translationKey: 'Heading.Members',
      state: 'members'
    },
    banned: {
      translationKey: 'Heading.Banned',
      state: 'banned'
    },
    requests: {
      translationKey: 'Heading.Requests',
      state: 'requests'
    }
  },

  roleSettings
};

configureGroupModule.constant('configureGroupConstants', configureGroupConstants);

export default configureGroupConstants;
