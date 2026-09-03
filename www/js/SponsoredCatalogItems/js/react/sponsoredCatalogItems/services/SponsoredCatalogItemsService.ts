import { AxiosPromise, httpService } from 'core-utilities';
import sponsoredCatalogItemsConstants from '../constants/sponsoredCatalogItemsConstants';

export type TSponsoredCatalogItemsResult = {
  data: Array<TSponsoredCatalogItem>;
};

export type TSponsoredCatalogItemsDetailsResult = {
  data: Array<TCatalogSearchDetailedResponseItem>;
};

export type TSponsoredCatalogItem = {
  id: number;
  itemType: string;
  encryptedAdTrackingData: string;
};

export type TCatalogSearchDetailedResponseItem = {
  id: number;
  itemType: string;
  assetType?: number;
  bundleType?: number;
  name: string;
  description: string;
  productId: number;
  genres?: Array<string>;
  bundledItems?: Array<string>;
  itemStatus: Array<string>;
  itemRestrictions: Array<string>;
  creatorType: string;
  creatorTargetId: number;
  creatorName: string;
  price?: number;
  premiumPricing: TPremiumPricing;
  lowestPrice?: number;
  priceStatus: string;
  unitsAvailableForConsumption?: number;
  purchaseCount?: number;
  favoriteCount?: number;
  offSaleDeadline?: string;
};

export type TPremiumPricing = {
  premiumDiscountPercentage: number;
  premiumPriceInRobux: number;
};

export const SponsoredCatalogItemsService = {
  getSponsoredCatalogItems(
    count: number,
    catalogCategoryType: string,
    placementLocation: string
  ): AxiosPromise<TSponsoredCatalogItemsResult> {
    const requestBody = {
      count,
      catalogCategoryType,
      placementLocation
    };
    return httpService.get<TSponsoredCatalogItemsResult>(
      sponsoredCatalogItemsConstants.getSponsoredCatalogItems,
      requestBody
    );
  },
  getCatalogItemsDetails(
    items: Array<{ itemType: string; id: number }>
  ): AxiosPromise<TSponsoredCatalogItemsDetailsResult> {
    const requestBody = {
      items
    };
    return httpService.post<TSponsoredCatalogItemsDetailsResult>(
      sponsoredCatalogItemsConstants.getCatalogItemsDetails,
      requestBody
    );
  },
  recordClick(encryptedAdTrackingData: string, placementLocation: string): AxiosPromise<{}> {
    const { campaignTargetType } = sponsoredCatalogItemsConstants;
    const requestBody = {
      encryptedAdTrackingData,
      campaignTargetType,
      placementLocation
    };
    return httpService.post<{}>(sponsoredCatalogItemsConstants.recordClick, requestBody);
  }
};

export default SponsoredCatalogItemsService;
