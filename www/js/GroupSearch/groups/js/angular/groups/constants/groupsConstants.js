import { Endpoints, EnvironmentUrls } from 'Roblox';
import groupsModule from '../groupsModule';

const urlBase = 'communities';

const groupsConstants = {
  urlBase,
  bannerExpiryInMilliseconds: 5000,
  wallReloadDelay: 1000,

  relationshipTypes: {
    allies: 'Allies',
    enemies: 'Enemies'
  },

  robuxIconHtml: '<span class="icon-robux-16x16"></span>',

  absoluteUrls: {
    createGroup: Endpoints.getAbsoluteUrl(`/${urlBase}/create`),
    moreGroups: Endpoints.getAbsoluteUrl(`/search/${urlBase}`),
    myGroups: Endpoints.getAbsoluteUrl(`/my/${urlBase}`),
    mySettings: Endpoints.getAbsoluteUrl('/my/account#!/security'),
    forbidden: Endpoints.getAbsoluteUrl('/request-error?code=403')
  },

  urls: {
    getGroup: `${EnvironmentUrls.groupsApi}/v1/groups/{id}`,
    getGroupProductFeatures: `${EnvironmentUrls.groupsApi}/v1/groups/{id}/product-features`,
    getGroupMetadata: `${EnvironmentUrls.groupsApi}/v1/groups/metadata`,
    getGroupConfigurationMetadata: `${EnvironmentUrls.groupsApi}/v1/groups/configuration/metadata`,
    updateGroupSettings: `${EnvironmentUrls.groupsApi}/v1/groups/{id}/settings`,
    searchGroups: `${EnvironmentUrls.groupsApi}/v1/groups/search`,
    deleteForumPostsByUser: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/forums/{userId}/posts`,
    getGroupRelationships: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/relationships/{groupRelationshipType}`,
    groupLookup: `${EnvironmentUrls.groupsApi}/v1/groups/search/lookup`,
    getCurrency: `${EnvironmentUrls.economyApi}/v1/groups/{groupId}/currency`,
    groupNameHistory: `${EnvironmentUrls.groupsApi}/v1/groups/{id}/name-history`,
    getGroupForums: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/forums`,
    getGroupEvents: `${EnvironmentUrls.apiGatewayUrl}/virtual-events/v1/virtual-events/groups/{groupId}`,
    getGroupStoreItems: `${EnvironmentUrls.catalogApi}/v1/search/items?category=All&creatorTargetId={groupId}&creatorType=Group&cursor=&limit=50&sortOrder=Desc&sortType=Updated`,
    getGroupAffiliates: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/relationships/allies?maxRows=50&sortOrder=Asc&startRowIndex=0`,

    // Membership
    getGroupMembership: `${EnvironmentUrls.groupsApi}/v1/groups/{id}/membership`,
    updatePrimaryGroup: `${EnvironmentUrls.groupsApi}/v1/user/groups/primary`,
    claimOwnership: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/claim-ownership`,
    deleteGroupJoinRequest: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/join-requests/users/{userId}`,
    joinGroup: `${EnvironmentUrls.groupsApi}/v1/groups/{id}/users`,
    getGroupBans: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/bans`,
    userGroupBan: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/bans/{userId}`,
    changeOwner: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/change-owner`,

    // Roles
    updateUserRole: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/users/{userId}`,
    getGroupRoles: `${EnvironmentUrls.groupsApi}/v1/groups/{id}/roles`,
    getGroupRolePermissions: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/roles/{roleSetId}/permissions`,
    getGroupRoleMembers: `${EnvironmentUrls.groupsApi}/v1/groups/{groupId}/roles/{roleId}/users`,
    getGroupRolesForUser: `${EnvironmentUrls.groupsApi}/v2/users/{userId}/groups/roles`,

    // Users API
    usernames: `${EnvironmentUrls.usersApi}/v1/usernames/users`,
    usersSearch: `${EnvironmentUrls.usersApi}/v1/users/search`,

    // Policy
    getGroupPolicyInfo: `${EnvironmentUrls.groupsApi}/v1/groups/policies`,

    // Economy
    getAddFundsAllowedUrl: `${EnvironmentUrls.economyApi}/v1/groups/{groupId}/addfunds/allowed`,
    getUserCurrency: `${EnvironmentUrls.economyApi}/v1/users/{userId}/currency`,
    generateChallenge: `${EnvironmentUrls.economyApi}/v2/spend-friction/two-step-verification/generate`,
    redeemChallenge: `${EnvironmentUrls.economyApi}/v2/spend-friction/two-step-verification/redeem`,

    // 2SV
    get2SVConfiguration: `${EnvironmentUrls.twoStepVerificationApi}/v1/users/{userId}/configuration`,
    verifyChallenge: `${EnvironmentUrls.twoStepVerificationApi}/v1/users/{userId}/challenges/email/verify`,
    resendCode: `${EnvironmentUrls.twoStepVerificationApi}/v1/users/{userId}/challenges/email/send-code`
  },

  errorCodes: {
    internal: {
      unknown: 0,
      captcha: 1,
      invalidMembership: 10,
      tooManyGroups: 11,
      insufficientRobux: 12,
      nameInvalid: 13,
      nameModerated: 14,
      groupIconInvalid: 15,
      groupIconMissing: 16,
      tooManyRequests: 17,
      descriptionTooLong: 18,
      nameTooLong: 19,
      duplicateName: 20,
      featureDisabled: 21,
      groupIconTooLarge: 22,
      twoStepVerificationRequired: 35,
      verifiedEmailRequired: 38,
      groupCoverPhotoMissing: 45,
      groupCoverPhotoInvalid: 46
    },
    groupErrors: {
      invalidGroup: 1
    },

    sendGroupWallPost: {
      7: 1 // Captcha
    },

    membership: {
      captcha: 5,
      operationUnavailable: 18,
      twoStepVerificationRequired: 25,
      proofOfWork: 28
    },

    getGroupMembership: {
      3: 1 // Invalid user
    }
  },

  statusCodes: {
    payloadTooLarge: 413,
    operationUnavailable: 405
  },

  twoStepMediaType: {
    email: 'Email'
  },

  translations: {
    buildGroupRolesListError: 'Message.BuildGroupRolesListError',
    loadGroupError: 'Message.LoadGroupError',
    loadGroupMetadataError: 'Message.LoadGroupMetadataError',
    loadGroupsListError: 'Message.LoadGroupMembershipsError',
    loadGroupConfigMetadataError: 'Message.ConfigMetadataLoadFail',
    loadGroupMembershipError: 'Message.LoadUserGroupMembershipError',
    defaultError: 'Message.DefaultError',
    deleteWallPostsByUserError: 'Message.DeleteWallPostsByUserError',
    groupMembershipsUnavailableError: 'Message.GroupMembershipsUnavailableError',
    banUserSuccess: 'Message.BanUserSuccess',
    banUserError: 'Message.BanUserError',
    kickUserError: 'Message.KickUserError',
    kickUserSuccess: 'Message.KickUserSuccess'
  },
  experimentLayer: 'UserCommunities.Groups.Discovery',
  socialCommunityExperimentLayer: 'Social.CommunityPage',
  storeExperimentLayer: 'Social.Store',
  aboutTabWithExperienceExperimentLayer: 'UserCommunities.Groups.AboutTabWithExperience'
};

groupsModule.constant('groupsConstants', groupsConstants);

export default groupsConstants;
