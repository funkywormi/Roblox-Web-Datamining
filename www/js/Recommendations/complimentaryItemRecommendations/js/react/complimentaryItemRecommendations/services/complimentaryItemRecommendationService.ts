import { AxiosPromise, httpService } from 'core-utilities';
import complimentaryItemRecommendationsConstants from '../constants/complimentaryItemRecommendationsConstants';
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
  noPriceStatus: string;
  priceStatus?: string[];
  itemStatus: string[];
  itemRestrictions: string[];
  id: number;
  itemType: string;
};
export type TItemDetailRequestEntry = {
  itemType: string;
  id: number;
};

export const complimentaryItemRecommendationsService = {
  getRecommendations(id: number): AxiosPromise<TRecommendationResult> {
    const params = {
      assetId: id,
      numItems: complimentaryItemRecommendationsConstants.totalNumberOfRecommendations
    };

    return httpService.get(urlConfigs.getRecommendations, params);
  },
  postItemDetails(items: Array<TItemDetailRequestEntry>): AxiosPromise<TDetailResult> {
    const params = {
      items
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
  }
};
