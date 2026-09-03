import { EnvironmentUrls } from 'Roblox';
import angular from 'angular';
import { seoName } from 'core-utilities';
import recommendationsModule from '../recommendationsModule.js';

function recommendationsService(
  httpService,
  recommendationsConstants,
  thumbnailConstants,
  creatorNameUtilities,
  $filter
) {
  'ngInject';

  const { recommendationTypes } = recommendationsConstants;

  function getBundleUrl(bundleId) {
    return `${EnvironmentUrls.websiteUrl}/bundles/${bundleId}`;
  }

  function getAssetUrl(assetId, assetName) {
    return `${EnvironmentUrls.websiteUrl}/catalog/${assetId}/${assetName}`;
  }

  function getAudioUrl(assetId, assetType) {
    if (assetType === 3) {
      return `${EnvironmentUrls.websiteUrl}/library/${assetId}`;
    }
    return null;
  }

  function getCreatorProfileLink(creatorId, creatorType, creatorName) {
    if (creatorType === 'Group') {
      return `${EnvironmentUrls.websiteUrl}/groups/${creatorId}/${seoName.formatSeoName(
        creatorName
      )}`;
    }
    return `${EnvironmentUrls.websiteUrl}/users/${creatorId}/profile`;
  }

  // TODO: FOR ROLLOUT FALLBACK
  function overrideRecommendationTypes(overrideRecommendationTypes) {
    if (!overrideRecommendationTypes) {
      return false;
    }
    angular.forEach(overrideRecommendationTypes, (value, key) => {
      recommendationTypes[key.toLowerCase()] = value;
    });
  }

  function isRecommendationAllowed(recommendationType, recommendationSubtype) {
    if (recommendationType === recommendationTypes.bundle) {
      return true;
    }
    // do not show recommendations for Game Passes and Badges
    return (
      recommendationSubtype > 0 &&
      recommendationSubtype !== recommendationsConstants.recommendationSubtypes.gamePasses &&
      recommendationSubtype !== recommendationsConstants.recommendationSubtypes.badges
    );
  }

  function translateBundleResultFromItemDetails(result) {
    const { creatorName } = result;
    const bundleCreator = {
      name: result.creatorName,
      type: result.creatorType,
      id: result.creatorTargetId
    };
    const item = {
      id: result.id,
      name: result.name,
      price: result.price,
      lowestPrice: result.lowestPrice,
      absoluteUrl: getBundleUrl(result.id),
      audioUrl: null,
      urlType: recommendationsConstants.bundleRootUrlTemplate,
      creator: {
        id: result.creatorTargetId,
        name: creatorName,
        nameForDisplay: creatorNameUtilities.getNameForDisplay(bundleCreator),
        type: result.creatorType,
        profileLink: getCreatorProfileLink(
          result.creatorTargetId,
          result.creatorType,
          result.creatorName
        )
      },
      thumbnail: {
        type: thumbnailConstants.thumbnailTypes.bundleThumbnail
      },
      product: {
        // Product id is not returned by the item details endpoint
        id: null,
        isForSale: !result.itemStatus?.includes('Offsale'),
        isFree: result.price === 0,
        noPriceText: result.priceStatus !== null ? result.priceStatus : ''
      },
      creatorHasVerifiedBadge: result.creatorHasVerifiedBadge,
      itemType: 'Bundle',
      itemRestrictions: result.itemRestrictions
    };
    creatorNameUtilities.mapItemRestrictionIcons(item);
    return item;
  }

  function buildUrlV2(subject) {
    return {
      url: `${EnvironmentUrls.catalogApi}/v2/recommendations/${subject}`
    };
  }

  function buildUrlParamsV2(assetTypeId, assetId, bundleId, numItems, bundleTypeId) {
    return {
      assetTypeId,
      assetId,
      bundleId,
      numItems,
      bundleTypeId,
      details: true
    };
  }

  function getCatalogMetadata() {
    return httpService.httpGet({
      url: `${EnvironmentUrls.catalogApi}/v1/catalog/metadata`,
      retryable: true,
      withCredentials: true
    });
  }

  function getRecommendationMetadata(pageName) {
    const params = {
      page: pageName
    };

    const urlConfig = {
      url: `${EnvironmentUrls.catalogApi}/v1/recommendations/metadata`
    };

    return httpService.httpGet(urlConfig, params).then(function success(result) {
      const returnResult = angular.copy(result);
      if (result) {
        const { numOfRecommendationsDisplayed } = result;
        returnResult.numberOfItems = numOfRecommendationsDisplayed;
      }
      return returnResult;
    });
  }

  function translateAssetResultFromItemDetails(result) {
    const { creatorName, assetType } = result;
    const assetCreator = {
      name: result.creatorName,
      type: result.creatorType,
      id: result.creatorTargetId
    };
    const thumbnailType =
      assetType === recommendationsConstants.assetTypes.places
        ? thumbnailConstants.thumbnailTypes.placeGameIcon
        : thumbnailConstants.thumbnailTypes.assetThumbnail;
    const item = {
      id: result.id,
      name: result.name,
      price: result.price,
      lowestPrice: result.lowestPrice,
      absoluteUrl: getAssetUrl(result.id, result.name),
      audioUrl: getAudioUrl(result.id, result.assetType),
      hasResellers: result.hasResellers,
      saleLocationType: result.saleLocationType,
      urlType: recommendationsConstants.assetRootUrlTemplate,
      creator: {
        id: result.creatorTargetId,
        name: creatorName,
        nameForDisplay: creatorNameUtilities.getNameForDisplay(assetCreator),
        type: result.creatorType,
        profileLink: getCreatorProfileLink(
          result.creatorTargetId,
          result.creatorType,
          result.creatorName
        )
      },
      thumbnail: {
        type: thumbnailType
      },
      product: {
        // Product id is not returned by the item details endpoint
        id: null,
        isForSale: !result.itemStatus?.includes('Offsale'),
        isFree: result.price === 0,
        noPriceText: result.priceStatus !== null ? result.priceStatus : ''
      },
      creatorHasVerifiedBadge: result.creatorHasVerifiedBadge,
      itemType: 'Asset',
      itemRestrictions: result.itemRestrictions
    };
    creatorNameUtilities.mapItemRestrictionIcons(item);
    return item;
  }

  function beginUpdateRecommendedItems(
    recommendationTargetId,
    recommendationType,
    recommendationSubtype,
    numItems,
    recommendationSubject
  ) {
    let params;
    if (recommendationType === recommendationTypes.bundle) {
      params = buildUrlParamsV2(
        null,
        null,
        recommendationTargetId,
        numItems,
        recommendationSubtype !== -1 ? recommendationSubtype : null
      );
    } else {
      params = buildUrlParamsV2(recommendationSubtype, recommendationTargetId, null, numItems);
    }

    const urlConfig = buildUrlV2(recommendationSubject);

    return httpService.httpGet(urlConfig, params).then(result => {
      if (result && result.data) {
        const dynamicRecommendationType = result.data[0]?.itemType === 'Bundle' ? 2 : 1;

        if (dynamicRecommendationType === recommendationTypes.bundle) {
          return result.data.map(translateBundleResultFromItemDetails);
        }
        return result.data.map(translateAssetResultFromItemDetails);
      }
      return result;
    });
  }

  return {
    isRecommendationAllowed,
    beginUpdateRecommendedItems,
    getCatalogMetadata,
    getRecommendationMetadata,
    overrideRecommendationTypes
  };
}

recommendationsModule.factory('recommendationsService', recommendationsService);
export default recommendationsService;
