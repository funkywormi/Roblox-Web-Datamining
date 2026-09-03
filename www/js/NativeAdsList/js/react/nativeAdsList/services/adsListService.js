import { httpService } from 'core-utilities';
import CampaignTargetType from '../../../../ts/react/enums/campaignTargetType';
import SponsoredCampaignType from '../../../../ts/react/enums/sponsoredCampaignType';
import {
  getGamesByUserIdConfig,
  getGamesByGroupIdConfig,
  getAdsByGameIdConfig,
  getStopAdsConfig,
  getUniversesRequestConfig,
  getOwnedSponsoredCampaignsUrl,
  getCampaignTargetsUrl,
  getGroupInfoById
} from '../constants/adsListUrlsConstant';

const getAdsByUniverseId = (universeId, pageCursor) => {
  const urlConfig = getAdsByGameIdConfig(universeId, pageCursor);
  return httpService.get(urlConfig);
};

const getAdsByCampaignTargetId = (sponsoredCampaignType, campaignTargetId, pageCursor) => {
  // universes should still use the old endpoint for the time being
  if (sponsoredCampaignType === SponsoredCampaignType.Experiences) {
    return getAdsByUniverseId(campaignTargetId, pageCursor);
  }

  const urlConfig = {
    url: getOwnedSponsoredCampaignsUrl(),
    retryable: true,
    withCredentials: true
  };

  const params = {
    campaignTargetType: CampaignTargetType.Asset,
    campaignTargetId,
    includeReportingStats: true
  };
  if (pageCursor) {
    params.pageCursor = pageCursor;
  }

  return httpService.get(urlConfig, params);
};

const getUniversesList = groupId => {
  const urlConfig = getUniversesRequestConfig(groupId);
  return httpService.get(urlConfig);
};

const getGamesList = groupId => {
  return new Promise(resolve => {
    const pullGames = pageCursor => {
      let urlConfig = null;
      if (groupId) {
        urlConfig = getGamesByGroupIdConfig(groupId, pageCursor);
        return httpService.get(urlConfig);
      }
      urlConfig = getGamesByUserIdConfig(pageCursor);
      return httpService.get(urlConfig);
    };

    let gameList = [];
    let nextPageCursor = null;
    const handleError = ({ data }) => {
      if (data.errors && data.errors[0]) {
        const { userFacingMessage } = data.errors[0];
        console.log(userFacingMessage);
      }
    };
    const handleGamesResponse = ({ data }) => {
      if (data) {
        gameList = gameList.concat(data.data);
        nextPageCursor = data.nextPageCursor;
      }
      if (nextPageCursor) {
        pullGames(nextPageCursor).then(handleGamesResponse, handleError);
      } else {
        resolve(gameList);
      }
    };

    pullGames(nextPageCursor).then(handleGamesResponse, handleError);
  });
};

const stopAds = adSetId => {
  const urlConfig = getStopAdsConfig();
  const param = {
    adSetId
  };
  return httpService.post(urlConfig, param);
};

const getCampaignTargets = (groupId, campaignTargetTypes) => {
  const formData = {
    groupId,
    campaignTargetTypes
  };

  const urlConfig = {
    url: getCampaignTargetsUrl(),
    retryable: true,
    withCredentials: true
  };

  return httpService.post(urlConfig, formData);
};

export const getSponsoredItemsPageInfo = targetId => {
  const urlConfig = getGroupInfoById(targetId);
  return httpService.get(urlConfig);
};

export default {
  getAdsByUniverseId,
  getAdsByCampaignTargetId,
  getGamesList,
  stopAds,
  getUniversesList,
  getCampaignTargets,
  getSponsoredItemsPageInfo
};
