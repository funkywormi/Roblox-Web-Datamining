import { httpService } from 'core-utilities';
import apiConstants from '../constants/apiEndpoints';

const getPlayerBadges = userId => {
  const params = {
    sortOrder: apiConstants.sortOrderTypes.desc
  };
  return httpService.get(apiConstants.getPlayerBadges(userId), params).then(({ data }) => data);
};

const getRobloxBadges = userId => {
  const params = {};
  return httpService.get(apiConstants.getRobloxBadges(userId), params).then(({ data }) => data);
};

export default {
  getPlayerBadges,
  getRobloxBadges
};
