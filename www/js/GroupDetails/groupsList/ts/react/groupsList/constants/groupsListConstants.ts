import { EnvironmentUrls } from 'Roblox';
import { seoName } from 'core-utilities';

const { formatSeoName } = seoName;
const { groupsApi } = EnvironmentUrls;

const groupsUrlPrefix = `${groupsApi}/v1/groups`;

export default {
  urls: {
    getGroupsListEndpoint(userId: number): string {
      return `${groupsUrlPrefix}/v1/users/${userId}/groups/roles?includeLocked=true`;
    },
    getPrimaryGroupEndpoint(userId: number): string {
      return `${groupsUrlPrefix}/v1/users/${userId}/groups/primary/role`;
    },
    groupPolicyInfoEndpoint: `${groupsUrlPrefix}/v1/groups/policies`,
    getSeoGroupUrl: (groupId: number, groupName: string): string =>
      `${EnvironmentUrls.websiteUrl}/groups/${groupId}/${formatSeoName(groupName)}`,
    createGroupUrl: `${EnvironmentUrls.websiteUrl}/communities/create`,
    groupSearchUrl: `${EnvironmentUrls.websiteUrl}/search/communities`
  }
};
