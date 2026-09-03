import { EnvironmentUrls } from 'Roblox';
import groupsModule from '../groupsModule';

const communityLinksGroupsUrlPrefix = `${EnvironmentUrls.apiGatewayUrl}/community-links/v1/groups`;

const communityLinkConstants = {
  urls: {
    getGroupCommunityInfoUrl: `${communityLinksGroupsUrlPrefix}/{groupId}/community`,
    getGroupAnnouncement: `${communityLinksGroupsUrlPrefix}/{groupId}/shout`
  }
};

groupsModule.constant('communityLinkConstants', communityLinkConstants);

export default communityLinkConstants;
