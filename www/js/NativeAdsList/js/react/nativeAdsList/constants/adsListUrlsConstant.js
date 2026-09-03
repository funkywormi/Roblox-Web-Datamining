import { EnvironmentUrls } from 'Roblox';
import { urlService } from 'core-utilities';

const { adConfigurationApi, developApi, groupsApi } = EnvironmentUrls;

const urls = {
  createCatalogAdUrl: '/sponsored/catalog-assets/{assetId}/create',
  createGameAdUrl: '/sponsored-games/universes/{universeId}/create',
  getCampaignTargetsUrl: '/v2/sponsored-campaigns/eligible-campaign-targets',
  groupGameList: '/v2/sponsored-games/universes?groupId=',
  multiGetCanUserSponsorTarget: '/v2/sponsored-campaigns/multi-get-can-user-sponsor',
  ownedSponsoredCampaignsUrl: '/v2/sponsored-campaigns',
  sponsoredAdsUrl: '/v2/sponsored-games',
  stopAdsUrl: '/v2/sponsored-games/stop',
  userGameListUrl: '/v2/sponsored-games/universes'
};

export const multiGetCanUserSponsorTarget = universeId => {
  const url = urls.multiGetCanUserSponsorTarget;
  return urlService.getAbsoluteUrl(url);
};

export const getCreateGameAdUrl = universeId => {
  const url = urls.createGameAdUrl.replace('{universeId}', universeId);
  return urlService.getAbsoluteUrl(url);
};

export const getCreateCatalogAdUrl = assetId => {
  const url = urls.createCatalogAdUrl.replace('{assetId}', assetId);
  return urlService.getAbsoluteUrl(url);
};

export const getAdsByGameIdConfig = (universeId, pageCursor) => {
  const cursorParam = pageCursor ? `&pageCursor=${pageCursor}` : '';
  return {
    withCredentials: true,
    url: `${adConfigurationApi}${urls.sponsoredAdsUrl}?universeId=${universeId}&includeReportingStats=true${cursorParam}`
  };
};

export const getGamesByGroupIdConfig = (groupId, pageCursor) => {
  const groupGamesUrl = urls.groupGameList.replace('{groupId}', groupId);
  const cursorParam = pageCursor ? `&cursor=${pageCursor}` : '';
  return {
    withCredentials: true,
    url: `${developApi}${groupGamesUrl}?limit=100${cursorParam}`
  };
};

export const getGamesByUserIdConfig = pageCursor => {
  const cursorParam = pageCursor ? `&cursor=${pageCursor}` : '';
  return {
    withCredentials: true,
    url: `${developApi}${urls.userGameListUrl}?limit=100${cursorParam}`
  };
};

export const getUniversesRequestConfig = groupId => {
  const config = {
    withCredentials: true,
    url: `${adConfigurationApi}${urls.userGameListUrl}`
  };
  if (groupId) {
    config.url = `${adConfigurationApi}${urls.groupGameList}${groupId}`;
  }
  return config;
};

export const getAdsListMetadataConfig = () => ({
  withCredentials: true,
  url: `${adConfigurationApi}${urls.metadataUrl}`
});

export const getStopAdsConfig = () => ({
  retryable: false,
  withCredentials: true,
  url: `${adConfigurationApi}${urls.stopAdsUrl}`
});

export const getCampaignTargetsUrl = () => `${adConfigurationApi}${urls.getCampaignTargetsUrl}`;

export const getOwnedSponsoredCampaignsUrl = () =>
  `${adConfigurationApi}${urls.ownedSponsoredCampaignsUrl}`;

export const getGroupInfoById = targetId => {
  return {
    withCredentials: true,
    url: `${groupsApi}/v1/groups/${targetId}`
  };
};
