import { AxiosPromise, httpService } from 'core-utilities';
import complimentaryItemRecommendationsConstants from '../constants/itemDetailsLimitedInventoryConstants';
import urlConfigs from '../constants/urlConfigs';

export type TLCSortExperiementValues = {
  lcSortEnabled: boolean;
};
export type TRecommendationResult = {
  data: Array<number>;
};
export type TDetailResult = {
  data: Array<TDetailEntry>;
};
export type TDetailEntry = {
  name: string;
  creatorName: string;
  creatorType: string;
  creatorTargetId: number;
  lowestPrice?: number;
  price?: number;
  premiumPricing?: {
    premiumDiscountPercentage: number;
    premiumPriceInRobux: number;
  };
  numberRemaining?: number;
  itemStatus: string[];
  itemRestrictions: string[];
  id: number;
  itemType: string;
  collectibleItemId: string;
};
export type TItemDetailRequestEntry = {
  itemType: string;
  id: number;
};
export type TL1ResellableCopies = {
  data: Array<TL1ResellableCopy>;
};
export type TL2ResellableCopies = {
  itemInstances: Array<TL2ResellableCopy>;
};
export type TL1ResellableCopy = {
  userAssetId: number;
  serialNumber: number;
  price: number;
  isOnHold?: boolean;
};
export type TL2ResellableCopy = {
  collectibleItemId: string;
  collectibleInstanceId: string;
  collectibleProductId: string;
  serialNumber: number;
  price: number;
  isHeld: boolean;
  saleState: string;
};
export type TLimited2ResaleParameters = {
  resalePercentageFee: number;
  resellableLimitedItemPriceFloors: {
    BackAccessory: {
      priceFloor: number;
    };
    DressSkirtAccessory: {
      priceFloor: number;
    };
    FaceAccessory: {
      priceFloor: number;
    };
    FrontAccessory: {
      priceFloor: number;
    };
    HairAccessory: {
      priceFloor: number;
    };
    Hat: {
      priceFloor: number;
    };
    JacketAccessory: {
      priceFloor: number;
    };
    NeckAccessory: {
      priceFloor: number;
    };
    PantsAccessory: {
      priceFloor: number;
    };
    ShirtAccessory: {
      priceFloor: number;
    };
    ShortsAccessory: {
      priceFloor: number;
    };
    ShoulderAccessory: {
      priceFloor: number;
    };
    SweaterAccessory: {
      priceFloor: number;
    };
    TShirtAccessory: {
      priceFloor: number;
    };
    WaistAccessory: {
      priceFloor: number;
    };
    Body: {
      priceFloor: number;
    };
    DynamicHead: {
      priceFloor: number;
    };
  };
  priceFloor: number;
};

export const itemDetailsLimitedInventoryService = {
  getRecommendations(id: number): AxiosPromise<TRecommendationResult> {
    const params = {
      assetId: id,
      numItems: complimentaryItemRecommendationsConstants.numberOfItemsToRecommend
    };

    return httpService.get(urlConfigs.getRecommendations, params);
  },
  postItemDetails(itemId: number): AxiosPromise<TDetailResult> {
    const params = {
      items: [{ id: itemId, itemType: 'Asset' }]
    };
    return httpService.post(urlConfigs.postItemDetails, params);
  },
  getItemOwnership(userId: number, itemType: string, itemTargetId: number): AxiosPromise<boolean> {
    const urlConfig = {
      url: urlConfigs.getItemOwnershipUrl(userId, itemType, itemTargetId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },
  getLimited1CopiesOwned(userId: number, assetId: number): AxiosPromise<TL1ResellableCopies> {
    const urlConfig = {
      url: urlConfigs.getLimited1CopiesOwned(userId, assetId),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },
  getLimited2CopiesOwned(
    userId: number,
    collectibleItemId: string,
    limit: number,
    cursor: string | undefined
  ): AxiosPromise<TL2ResellableCopies> {
    const urlConfig = {
      url: urlConfigs.getLimited2CopiesOwned(userId, collectibleItemId, limit, cursor),
      retryable: true,
      withCredentials: true
    };
    return httpService.get(urlConfig);
  },
  placeLimited1ItemOnSale(
    assetId: number,
    userAssetId: number,
    price: number | undefined
  ): AxiosPromise<TL1ResellableCopies> {
    const urlConfig = {
      url: urlConfigs.placeLimited1ItemOnSale(assetId, userAssetId),
      retryable: true,
      withCredentials: true
    };
    let params;
    if (price !== undefined) {
      params = {
        price
      };
    } else {
      params = {};
    }
    return httpService.patch(urlConfig, params);
  },
  placeLimited2ItemOnSale(
    userId: number,
    collectibleItemId: string | undefined,
    collectibleInstanceId: string | undefined,
    collectibleProductId: string | undefined,
    isOnSale: boolean,
    price: number | undefined
  ): AxiosPromise<TL1ResellableCopies> {
    let urlConfig;
    let params;
    if (collectibleItemId && collectibleInstanceId && collectibleProductId) {
      urlConfig = {
        url: urlConfigs.placeLimited2ItemOnSale(collectibleItemId, collectibleInstanceId),
        retryable: true,
        withCredentials: true
      };
      params = {
        price,
        isOnSale,
        sellerId: userId,
        sellerType: 'User',
        collectibleProductId
      };
    }

    return httpService.patch(urlConfig, params);
  },
  getLimited2ResaleParameters(collectibleItemId: string): AxiosPromise<TLimited2ResaleParameters> {
    const params = {};
    const urlConfig = {
      url: urlConfigs.getLimited2ResaleParameters(collectibleItemId),
      retryable: true,
      withCredentials: true
    };

    return httpService.get(urlConfig, params);
  }
};
