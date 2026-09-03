import { EnvironmentUrls } from 'Roblox';

const { badgesApi, accountInformationApi } = EnvironmentUrls;

export default {
  getPlayerBadges(userId) {
    return {
      url: `${badgesApi}/v1/users/${userId}/badges`,
      withCredentials: true
    };
  },
  accessFilter: {
    public: 'Public'
  },

  getRobloxBadges(userId) {
    return {
      url: `${accountInformationApi}/v1/users/${userId}/roblox-badges`,
      withCredentials: true
    };
  },

  sortOrderTypes: {
    desc: 'Desc'
  },

  limitOfPlayerBadges: 6
};
