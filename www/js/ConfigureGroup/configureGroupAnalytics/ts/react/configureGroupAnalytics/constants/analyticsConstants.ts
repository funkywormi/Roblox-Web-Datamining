import { EnvironmentUrls } from 'Roblox';

export default {
  urls: {
    getCreatorHubGroupAnalyticsUrl(groupId: number): string {
      return `https://create.${EnvironmentUrls.domain}/dashboard/analytics?tab=Communities&groupId=${groupId}`;
    }
  }
};
