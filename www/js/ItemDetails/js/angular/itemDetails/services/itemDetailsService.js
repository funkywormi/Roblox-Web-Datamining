import { EnvironmentUrls } from 'Roblox';
import { DefaultThumbnailSize, ThumbnailFormat } from 'roblox-thumbnails';
import itemDetailsModule from '../itemDetailsModule';

function itemDetailsService(httpService) {
  'ngInject';

  function getRecommendations(
    recommendationTargetId,
    recommendationTypeTargetId,
    numItems,
    isBundle
  ) {
    const params = {
      numItems,
      details: false
    };
    if (isBundle) {
      params.bundleId = recommendationTargetId;
      params.bundleTypeId = recommendationTypeTargetId;
    } else {
      params.assetId = recommendationTargetId;
      params.assetTypeId = recommendationTypeTargetId;
    }
    const urlConfig = {
      url: `${EnvironmentUrls.catalogApi}/v2/recommendations/${isBundle ? 'bundles' : 'assets'}`
    };

    return httpService.httpGet(urlConfig, params).then(result => {
      return result;
    });
  }

  function getCanConfigure(targetId, isBundle) {
    const urlConfig = {
      url: `${
        EnvironmentUrls.itemConfigurationApi
      }/v1/collectibles/check-item-configuration-access?TargetType=${
        isBundle ? 1 : 0
      }&TargetId=${targetId}`
    };
    const params = {};

    return httpService.httpGet(urlConfig, params).then(result => {
      return result;
    });
  }

  function getCanSponsor(targetId) {
    const urlConfig = {
      url: `${EnvironmentUrls.adConfigurationApi}/v2/sponsored-campaigns/multi-get-can-user-sponsor?campaignTargetType=2&campaignTargetIds=${targetId}`
    };
    const params = {};

    return httpService.httpGet(urlConfig, params).then(result => {
      return result;
    });
  }

  function getUserShowcase(userId) {
    const urlConfig = {
      url: `${EnvironmentUrls.showcasesApi}/v1/users/profile/robloxcollections-json?userId=${userId}`
    };
    const params = {};

    return httpService.httpGet(urlConfig, params).then(result => {
      return result;
    });
  }

  function getDetails(targetId, isBundle) {
    const urlConfig = {
      url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/${targetId}/details`
    };
    const params = {
      itemType: isBundle ? 'bundle' : 'asset'
    };

    return httpService.httpGet(urlConfig, params).then(result => {
      return result;
    });
  }

  function getCurrentUserBalance(userId) {
    const urlConfig = {
      url: `${EnvironmentUrls.economyApi}/v1/users/${userId}/currency`
    };
    const params = {};

    return httpService.httpGet(urlConfig, params);
  }

  function getAssetThumbnail(targetId) {
    const urlConfig = {
      url: `${EnvironmentUrls.thumbnailsApi}/v1/assets`
    };
    const params = {
      assetIds: targetId,
      size: DefaultThumbnailSize,
      format: ThumbnailFormat.png,
      isCircular: false
    };

    return httpService.httpGet(urlConfig, params);
  }

  function getBundleThumbnail(targetId) {
    const urlConfig = {
      url: `${EnvironmentUrls.thumbnailsApi}/v1/bundles/thumbnails`
    };
    const params = {
      bundleIds: targetId,
      size: DefaultThumbnailSize,
      format: ThumbnailFormat.png,
      isCircular: false
    };

    return httpService.httpGet(urlConfig, params);
  }

  return {
    getRecommendations,
    getCanSponsor,
    getCanConfigure,
    getUserShowcase,
    getDetails,
    getCurrentUserBalance,
    getAssetThumbnail,
    getBundleThumbnail
  };
}

itemDetailsModule.factory('itemDetailsService', itemDetailsService);
export default itemDetailsService;
