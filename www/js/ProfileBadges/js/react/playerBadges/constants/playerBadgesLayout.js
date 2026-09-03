import { EnvironmentUrls } from 'Roblox';

const { websiteUrl } = EnvironmentUrls;

export default {
  title: 'Heading.PlayerAssetsBadges',
  seeAllLabel: 'Action.SeeAll',
  limitOfBadgesToDisplay: 6,
  limitOfBadgesToDisplaySM: 4,
  limitOfBadgesToDisplayXS: 3,
  getInventoryUrlForBadge(userId) {
    return `${websiteUrl}/users/${userId}/inventory/#!/badges`;
  }
};
