/* eslint-disable no-param-reassign */
import { Endpoints } from 'Roblox';
import { concatTexts } from 'core-utilities';
import { creatorStoreAssetTypes } from '../constants/types';
import assetsExplorerModule from '../assetsExplorerModule';
import { getUserIdFromUrl } from '../../utils/userInfo';

function assetsService(
  assetsConstants,
  $filter,
  httpService,
  $log,
  thumbnailConstants,
  itemCardUtility
) {
  'ngInject';

  function getNameForDisplay(item) {
    const currentItem = item;
    const { userTypes, robloxSystemUserId } = assetsConstants;
    const { Name: creatorName, Type: creatorType, Id: creatorTargetId } = item;

    if (userTypes.user === creatorType && robloxSystemUserId !== creatorTargetId) {
      // some of the inventory api is already include @ as creatorName
      // the better solution is to isoalte inventory api from www site
      // so not use same CreatorModal as item details page
      currentItem.nameForDisplay = creatorName.startsWith('@')
        ? creatorName
        : concatTexts.concat(['', creatorName]);
    } else {
      currentItem.nameForDisplay = creatorName;
    }
  }

  function convertCreatorTypeStringToNumber(creatorType) {
    const { userTypes, userTypesString } = assetsConstants;
    switch (creatorType.toLowerCase()) {
      case userTypesString.user.toLowerCase():
        return userTypes.user;
      case userTypesString.group.toLowerCase():
        return userTypes.group;
      default:
        return userTypes.user;
    }
  }

  return {
    currentPage: 0,
    itemsPerPage: 30,
    userId: getUserIdFromUrl(),
    assetTypeId: 0,

    getItemSection(category) {
      // library
      switch (category.categoryType) {
        case assetsConstants.types.decal:
        case assetsConstants.types.model:
        case assetsConstants.types.audio:
        case assetsConstants.types.video:
        case assetsConstants.types.plugin:
        case assetsConstants.types.meshPart:
          return assetsConstants.library;
        default:
          break;
      }

      // no section
      switch (category.categoryType) {
        case assetsConstants.types.place:
        case assetsConstants.types.badge:
        case assetsConstants.types.gamePass:
        case assetsConstants.types.animation:
        case assetsConstants.types.privateServers:
          return null;
        default:
          break;
      }

      // catalog
      return assetsConstants.catalog;
    },

    makeUrlFriendly(str) {
      return str.split(' ').join('-').toLowerCase();
    },

    setCategory(category) {
      this.currentCategory = category;
      const subcategory = category.items[0];
      this.setSubcategory(subcategory);
      return true;
    },

    setSubcategory(subcategory) {
      if (subcategory !== null && typeof subcategory !== 'undefined') {
        this.currentSubcategory = subcategory;
        this.assetTypeId = this.currentSubcategory.id;
      }
      return true;
    },

    setPage(value) {
      if (value < 0) {
        $log.debug(`Invalid attempt to set page to page ${value}`);
        return false;
      }

      this.currentPage = value;
      return true;
    },

    convertCreatorTypeStringToNumber,

    translateWwwItem(item) {
      let itemId = item.Item.AssetId;
      let itemType = assetsConstants.itemTypes.asset;
      let thumbnailType = thumbnailConstants.thumbnailTypes.assetThumbnail;

      if (item.Item.AssetType === assetsConstants.assetTypeIds.badge) {
        itemType = assetsConstants.itemTypes.badge;
        thumbnailType = thumbnailConstants.thumbnailTypes.badgeIcon;
      } else if (item.Item.AssetType === assetsConstants.assetTypeIds.gamePass) {
        itemType = assetsConstants.itemTypes.gamePass;
        thumbnailType = thumbnailConstants.thumbnailTypes.gamePassIcon;
      } else if (
        item.Item.AssetType === assetsConstants.assetTypeIds.place &&
        item.Item.UniverseId
      ) {
        itemId = item.Item.UniverseId;
        itemType = assetsConstants.itemTypes.game;
        thumbnailType = thumbnailConstants.thumbnailTypes.gameIcon;
      }

      item.itemV2 = {
        id: itemId,
        type: itemType,
        thumbnail: {
          type: thumbnailType
        }
      };

      if (item.Creator) {
        getNameForDisplay(item.Creator);
      }

      item.itemType = 'Asset';
    },

    translatePrivateServer(item) {
      item.Item = {
        Name: item.name,
        AbsoluteUrl: Endpoints.getAbsoluteUrl(`/games/${item.placeId}#!/game-instances`)
      };

      item.itemV2 = {
        id: item.universeId,
        type: assetsConstants.itemTypes.game,
        thumbnail: {
          type: thumbnailConstants.thumbnailTypes.gameIcon
        }
      };

      item.Creator = {
        Id: item.ownerId,
        Type: assetsConstants.userTypes.user,
        Name: item.ownerName,
        CreatorProfileLink: Endpoints.getAbsoluteUrl(`/users/${item.ownerId}/profile`)
      };
      getNameForDisplay(item.Creator);

      item.Product = {
        IsFree: item.priceInRobux === null,
        TranslateFree: item.priceInRobux === null,
        PriceInRobux: item.priceInRobux
      };

      item.itemType = 'Asset';
    },

    translatePlace(item) {
      item.Item = {
        Name: item.name,
        AbsoluteUrl: Endpoints.getAbsoluteUrl(`/games/${item.placeId}`)
      };

      item.itemV2 = {
        id: item.universeId,
        type: assetsConstants.itemTypes.game,
        thumbnail: {
          type: thumbnailConstants.thumbnailTypes.gameIcon
        }
      };

      item.Creator = {
        Id: item.creator.id,
        Type: item.creator.type,
        Name: item.creator.name,
        CreatorProfileLink:
          item.creator.type === assetsConstants.userTypesString.user
            ? Endpoints.getAbsoluteUrl(`/users/${item.creator.id}/profile`)
            : Endpoints.getAbsoluteUrl(`/groups/${item.creator.id}`)
      };
      getNameForDisplay(item.Creator);

      item.Product = {
        IsFree: item.priceInRobux === null,
        PriceInRobux: item.priceInRobux
      };

      item.itemType = 'Asset';
    },

    translateFavoritePlace(item) {
      item.Item = {
        Name: item.name,
        AbsoluteUrl: Endpoints.getAbsoluteUrl(`/games/${item.rootPlace.id}`)
      };

      item.itemV2 = {
        id: item.id,
        type: assetsConstants.itemTypes.game,
        thumbnail: {
          type: thumbnailConstants.thumbnailTypes.gameIcon
        }
      };

      const { id, type, name } = item.creator;
      const creatorTypeNum = convertCreatorTypeStringToNumber(type);
      item.Creator = {
        Id: id,
        Type: creatorTypeNum,
        Name: name,
        CreatorProfileLink:
          creatorTypeNum === assetsConstants.userTypes.user
            ? Endpoints.getAbsoluteUrl(`/users/${id}/profile`)
            : Endpoints.getAbsoluteUrl(`/groups/${id}`)
      };
      getNameForDisplay(item.Creator);

      item.Product = {
        IsFree: item.price === null,
        PriceInRobux: item.price
      };

      item.itemType = 'Asset';
    },

    translateCatalogItem(item) {
      const itemId = item.id;
      const itemType = assetsConstants.itemTypes.bundle;
      const thumbnailType = thumbnailConstants.thumbnailTypes.bundleThumbnail;

      item.Item = {
        Name: item.name,
        AbsoluteUrl: Endpoints.getAbsoluteUrl(`/bundles/${item.id}`)
      };

      item.itemV2 = {
        id: itemId,
        type: itemType,
        thumbnail: {
          type: thumbnailType
        }
      };

      if (item.creator) {
        const { id, type, name } = item.creator;
        item.Creator = {
          Id: id,
          Type: type,
          Name: name
        };
        getNameForDisplay(item.Creator);
      }
      item.itemType = 'Bundle';
      item.hydrationRequired = true;
    },

    translateFavoriteLook(item) {
      item.Item = {
        Name: item.name,
        AbsoluteUrl: Endpoints.getAbsoluteUrl(`/looks/${item.id}`)
      };

      item.itemV2 = {
        id: item.id,
        type: assetsConstants.itemTypes.look,
        thumbnail: {
          type: thumbnailConstants.thumbnailTypes.lookThumbnail
        }
      };

      const creatorTypeNum = convertCreatorTypeStringToNumber(item.creatorType);
      item.Creator = {
        Id: item.creatorTargetId,
        Type: creatorTypeNum,
        Name: item.creatorName,
        CreatorProfileLink:
          creatorTypeNum === assetsConstants.userTypes.user
            ? Endpoints.getAbsoluteUrl(`/users/${item.creatorTargetId}/profile`)
            : Endpoints.getAbsoluteUrl(`/groups/${item.creatorTargetId}`)
      };
      getNameForDisplay(item.Creator);

      item.Product = {
        IsFree: item.price === null || item.price === 0,
        PriceInRobux: item.price
      };

      item.itemType = 'Look';
      itemCardUtility.mapItemRestrictionIcons(item);
    },

    translateFavoriteAsset(item) {
      item.Item = {
        Name: item.name,
        AbsoluteUrl: Endpoints.getAbsoluteUrl(`/catalog/${item.id}`)
      };

      item.itemV2 = {
        id: item.id,
        type: assetsConstants.itemTypes.asset,
        thumbnail: {
          type: thumbnailConstants.thumbnailTypes.assetThumbnail
        }
      };

      const creatorTypeNum = convertCreatorTypeStringToNumber(item.creatorType);
      item.Creator = {
        Id: item.creatorTargetId,
        Type: creatorTypeNum,
        Name: item.creatorName,
        CreatorProfileLink:
          creatorTypeNum === assetsConstants.userTypes.user
            ? Endpoints.getAbsoluteUrl(`/users/${item.creatorTargetId}/profile`)
            : Endpoints.getAbsoluteUrl(`/groups/${item.creatorTargetId}`)
      };
      getNameForDisplay(item.Creator);

      item.Product = {
        IsFree: item.price === null || item.price === 0,
        PriceInRobux: item.lowestPrice ? item.lowestPrice : item.price
      };

      item.itemType = 'Asset';
      itemCardUtility.mapItemRestrictionIcons(item);
    },

    translateBadgeItem(item) {
      item.Item = {
        Name: item.displayName,
        AbsoluteUrl: Endpoints.getAbsoluteUrl(`/badges/${item.id}`)
      };

      item.itemV2 = {
        id: item.id,
        type: assetsConstants.itemTypes.badge,
        thumbnail: {
          type: thumbnailConstants.thumbnailTypes.badgeIcon
        }
      };

      const { id, type, name } = item.creator;
      const creatorTypeNum = convertCreatorTypeStringToNumber(type);
      item.Creator = {
        Id: id,
        Type: creatorTypeNum,
        Name: name,
        CreatorProfileLink:
          creatorTypeNum === assetsConstants.userTypes.user
            ? Endpoints.getAbsoluteUrl(`/users/${id}`)
            : Endpoints.getAbsoluteUrl(`/groups/${id}`)
      };
      getNameForDisplay(item.Creator);

      item.ItemType = 'Badge';
      item.hydrationRequired = false;
    },

    translateGamePassItem(item) {
      item.Item = {
        Name: item.name,
        AbsoluteUrl: Endpoints.getAbsoluteUrl(`/game-pass/${item.gamePassId}`)
      };

      item.itemV2 = {
        id: item.gamePassId,
        type: assetsConstants.itemTypes.gamePass,
        thumbnail: {
          type: thumbnailConstants.thumbnailTypes.gamePassIcon
        }
      };

      item.Product = {
        PriceInRobux: item.price,
        IsForSale: item.isForSale
      };

      const creatorTypeNum = convertCreatorTypeStringToNumber(item.creator.creatorType);
      item.Creator = {
        Id: item.creator.name,
        Type: creatorTypeNum,
        Name: item.creator.name,
        CreatorProfileLink:
          creatorTypeNum === assetsConstants.userTypes.user
            ? Endpoints.getAbsoluteUrl(`/users/${item.creator.creatorId}`)
            : Endpoints.getAbsoluteUrl(`/groups/${item.creator.creatorId}`)
      };
      getNameForDisplay(item.Creator);
    },

    formatInventoryV2Asset(item) {
      item.hydrationRequired = true;
      item.itemDetailsLoading = true;
      item.itemType = 'Asset';
    },

    formatCreatorStoreAsset(item, itemDetails, assetTypeId) {
      const { assetId } = item;
      const assetType = creatorStoreAssetTypes[assetTypeId];

      item.id = assetId;
      item.itemType = 'Asset';
      item.hydrationRequired = false;
      item.itemDetailsLoading = false;
      item.hidePrice = true;

      item.Item = {
        Name: item.assetName,
        AbsoluteUrl: $filter('formatString')(assetsConstants.creatorStoreAssetAbsoluteUrl, {
          assetId,
          assetType
        })
      };

      item.itemV2 = {
        id: assetId,
        type: assetsConstants.itemTypes.asset,
        thumbnail: {
          type: thumbnailConstants.thumbnailTypes.assetThumbnail
        }
      };

      if (itemDetails && itemDetails.creator) {
        const { id } = itemDetails.creator;
        const creatorType = itemDetails.creator.type;
        item.Creator = {
          Id: id,
          Name: itemDetails.creator.name,
          Type: creatorType,
          CreatorProfileLink:
            creatorType === assetsConstants.userTypes.user
              ? Endpoints.getAbsoluteUrl(`/users/${id}`)
              : Endpoints.getAbsoluteUrl(`/groups/${id}`)
        };
        getNameForDisplay(item.Creator);
      }
    },

    getCatalogMetadata() {
      const params = {};
      return httpService.httpGet(assetsConstants.endpoints.getCatalogMetadata, params);
    },

    /* Used for asset to catalog mappings */

    getAssetToCategoryMappings() {
      const params = {};
      return httpService.httpGet(assetsConstants.endpoints.getAssetToCatalogCategory, params);
    },

    getAssetToSubcategoryMappings() {
      const params = {};
      return httpService.httpGet(assetsConstants.endpoints.getAssetToCatalogSubcategory, params);
    },
    /* Used for asset to catalog mappings */

    postItemDetails(items) {
      const params = { items };
      return httpService.httpPost(assetsConstants.endpoints.postItemDetails, params);
    },

    getBundleDetails(assetId) {
      const params = {
        assetId
      };
      return httpService.httpGet(assetsConstants.endpoints.getBundleDetails, params);
    }
  };
}

assetsExplorerModule.factory('assetsService', assetsService);
export default assetsService;
