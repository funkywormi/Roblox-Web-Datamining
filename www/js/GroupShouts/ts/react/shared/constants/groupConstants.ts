import { EnvironmentUrls } from 'Roblox';

export enum StyleSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg'
}

export default {
  urls: {
    accountSettings: `${EnvironmentUrls.websiteUrl}/my/account#!/info`,
    accountSecuritySettings: `${EnvironmentUrls.websiteUrl}/my/account#!/security`,
    getUsersInfoURL: `${EnvironmentUrls.usersApi}/v1/users`,
    getUsersFromUsernamesURL: `${EnvironmentUrls.usersApi}/v1/usernames/users`,
    getUserProfileURL(userId: number): string {
      return `${EnvironmentUrls.websiteUrl}/users/${userId}/profile`;
    },
    getGroupConfigurationMembersPageURL(groupId: number): string {
      return `${EnvironmentUrls.websiteUrl}/communities/configure?id=${groupId}#!/members`;
    },
    getAllGroupRolePermissionsURL(groupId: number): string {
      return `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/roles/permissions`;
    },
    getGroupMigrationStatusURL(groupId: number): string {
      return `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/migration`;
    },
    getGroupURL(groupId: number): string {
      return `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}`;
    },
    getGroupFeaturesURL(groupId: number): string {
      return `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/product-features`;
    },
    getGroupSettingsURL(groupId: number): string {
      return `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/settings`;
    },
    getGroupOwnerFeatureFreezesURL(groupId: number): string {
      return `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/features`;
    },
    getGroupCommunityFeaturesURL(groupId: number): string {
      return `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/community-feature-freezes`;
    },
    getGroupRolesURL(groupId: number, includePrivate?: boolean): string {
      const query = includePrivate ? '?includePrivate=true' : '';
      return `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/roles${query}`;
    },
    getUserGroupRolesURL(userId: number): string {
      return `${EnvironmentUrls.groupsApi}/v2/users/${userId}/groups/roles`;
    },
    getGroupUrl(groupId: number, seoName: string): string {
      return `${EnvironmentUrls.websiteUrl}/groups/${groupId}/${seoName}`;
    },
    getGroupAffiliatesUrl(groupId: number, relationshipType: string): string {
      return `${EnvironmentUrls.groupsApi}/v1/groups/${groupId}/relationships/${relationshipType}`;
    }
  },
  StyleSize,

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
      descriptionModerated: 32,
      twoStepVerificationRequired: 35,
      verifiedEmailRequired: 38,
      groupCoverPhotoMissing: 45,
      groupCoverPhotoInvalid: 46
    },
    groupErrors: {
      invalidGroup: 1
    },

    sendGroupWallPost: {
      7: 1
    },

    membership: {
      captcha: 5,
      operationUnavailable: 18,
      twoStepVerificationRequired: 25,
      proofOfWork: 28
    },

    getGroupMembership: {
      3: 1
    }
  }
};
