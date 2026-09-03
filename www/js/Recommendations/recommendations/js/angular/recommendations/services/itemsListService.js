import { Endpoints, CurrentUser } from 'Roblox';
import angular from 'angular';
import recommendationsModule from '../recommendationsModule';

function itemsListService(itemListConstants, httpService, thumbnailConstants, $filter) {
  'ngInject';

  function buildAssetDetails(details) {
    const {
      id,
      name,
      price,
      creatorTargetId,
      creatorName,
      creatorType,
      productId,
      priceStatus
    } = details;
    return {
      id,
      name,
      price,
      absoluteUrl: Endpoints.getAbsoluteUrl(`/catalog/${id}/catalogname`),
      creator: {
        id: creatorTargetId,
        name: creatorName,
        nameForDisplay: $filter('escapeHtml')(creatorName),
        type: creatorType,
        profileLink: Endpoints.getAbsoluteUrl(`/users/${creatorTargetId}/profile`)
      },
      thumbnail: {
        type: thumbnailConstants.thumbnailTypes.assetThumbnail
      },
      product: {
        id: productId,
        noPriceText: priceStatus,
        isFree: priceStatus === itemListConstants.priceStatus.free
      }
    };
  }
  function translateAssetDetails(result) {
    if (result && result.data) {
      result.data.forEach(details => {
        Object.assign(details, buildAssetDetails(details));
      });
    }
    return result;
  }
  return {
    isMoreByCreatorAvailable: (assetType, creatorId) => {
      const threeDAssets = Object.values(itemListConstants.assetTypes);
      return (
        CurrentUser.isAuthenticated &&
        threeDAssets.indexOf(assetType) > -1 &&
        creatorId !== itemListConstants.robloxId
      );
    },

    enrollAbTesting: abTestingName => {
      const data = [
        {
          SubjectType: 'User',
          SubjectTargetId: CurrentUser.userId,
          ExperimentName: abTestingName
        }
      ];
      return httpService.httpPost(itemListConstants.endpoints.enrollment, data);
    },

    getItemList: creator => {
      const params = { ...itemListConstants.searchByCreatorParams };
      params.creatorTargetId = creator.Id;
      params.createType = creator.Type;

      return httpService.httpGet(itemListConstants.endpoints.getSearchItems, params);
    },

    getItemDetails: items => {
      const data = {
        items
      };
      return httpService.httpPost(itemListConstants.endpoints.getItemDetails, data).then(result => {
        return translateAssetDetails(result);
      });
    }
  };
}

recommendationsModule.factory('itemsListService', itemsListService);
export default itemsListService;
