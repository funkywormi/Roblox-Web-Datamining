import { EnvironmentUrls } from 'Roblox';

const { groupsApi } = EnvironmentUrls;
const realtimeUrlBase = `${groupsApi}/v1/groups`;
const realtimeConstants = {
  urls: {
    getTopicSubscriptionTokenEndpoint: (groupId: number): string =>
      `${realtimeUrlBase}/${groupId}/realtime/token`
  }
};

export default realtimeConstants;
