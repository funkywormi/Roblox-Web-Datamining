import { Endpoints, EnvironmentUrls } from 'Roblox';
import { UrlConfig } from 'core-utilities';
import { TItemType } from './types';

export const urlConfigs = {
  getAvatar: {
    url: `${EnvironmentUrls.avatarApi}/v1/avatar`,
    retryable: true,
    withCredentials: true
  },
  avatarRules: {
    url: `${EnvironmentUrls.avatarApi}/v1/avatar-rules`,
    retryable: true,
    withCredentials: true
  },
  avatarRender: {
    url: `${EnvironmentUrls.avatarApi}/v1/avatar/render`,
    retryable: true,
    withCredentials: true
  },
  catalogSearchV2Url: {
    url: `${EnvironmentUrls.catalogApi}/v2/search/items/details`,
    retryable: true,
    withCredentials: true
  },
  deleteFromInventory: (assetId: number): UrlConfig => ({
    url: `${EnvironmentUrls.inventoryApi}/v2/inventory/asset/${assetId}`,
    retryable: true,
    withCredentials: true
  }),
  itemDetails: (itemId: number): UrlConfig => ({
    url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/${itemId}/details`,
    retryable: true,
    withCredentials: true
  }),
  ownedItem: (userId: string, itemType: TItemType, itemId: number): UrlConfig => ({
    url: `${EnvironmentUrls.inventoryApi}/v1/users/${userId}/items/${itemType}/${itemId}`,
    retryable: true,
    withCredentials: true
  }),
  isItemOwned: (userId: string, itemType: TItemType, itemId: number): UrlConfig => ({
    url: `${EnvironmentUrls.inventoryApi}/v1/users/${userId}/items/${itemType}/${itemId}/is-owned`,
    retryable: true,
    withCredentials: true
  }),
  assetResaleData: (assetId: number): UrlConfig => ({
    url: `${EnvironmentUrls.economyApi}/v1/assets/${assetId}/resale-data`,
    retryable: true,
    withCredentials: true
  }),
  getResellers: (itemId: number): UrlConfig => ({
    url: `${EnvironmentUrls.economyApi}/v1/assets/${itemId}/resellers`,
    retryable: true,
    withCredentials: true
  }),
  modifyProfile: (itemId: number, itemType: TItemType): UrlConfig => ({
    url: `${EnvironmentUrls.inventoryApi}/v1/collections/items/${itemType}/${itemId}`,
    retryable: true,
    withCredentials: true
  }),
  getLimited2CopiesOwned: (
    userId: string,
    collectibleItemId: string,
    limit: number,
    cursor: string | undefined
  ): string =>
    `${
      EnvironmentUrls.apiGatewayUrl
    }/marketplace-sales/v1/item/${collectibleItemId}/resellable-instances?cursor=${
      cursor || ''
    }&ownerType=User&ownerId=${userId}&limit=${limit}`,
  assetItemDetails: {
    url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
    retryable: true,
    withCredentials: true
  },
  bundleItemDetails: {
    url: `${EnvironmentUrls.catalogApi}/v1/bundles/details`,
    retryable: true,
    withCredentials: true
  },
  assetTypeToCategory: {
    url: `${EnvironmentUrls.catalogApi}/v1/asset-to-category`,
    retryable: true,
    withCredentials: true
  },
  assetTypeToSubcategory: {
    url: `${EnvironmentUrls.catalogApi}/v1/asset-to-subcategory`,
    retryable: true,
    withCredentials: true
  },
  categories: {
    url: `${EnvironmentUrls.catalogApi}/v1/categories`,
    retryable: true,
    withCredentials: true
  },
  subcategories: {
    url: `${EnvironmentUrls.catalogApi}/v1/subcategories`,
    retryable: true,
    withCredentials: true
  },
  asset3DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/assets-thumbnail-3d`,
    retryable: true,
    withCredentials: true
  },
  asset2DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/assets`,
    retryable: true,
    withCredentials: true
  },
  animation3DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/asset-thumbnail-animated`,
    retryable: true,
    withCredentials: true
  },
  bundles2DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/bundles/thumbnails`,
    retryable: true,
    withCredentials: true
  },
  outfits3DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/users/outfit-3d`,
    retryable: true,
    withCredentials: true
  },
  collectibleItemDetails: {
    url: `${EnvironmentUrls.apiGatewayUrl}/marketplace-items/v1/items/details`,
    retryable: true,
    withCredentials: true
  },
  submitSafetyEvent: {
    url: `${EnvironmentUrls.apiGatewayUrl}/abuse-reporting/v1/safety-event`,
    retryable: true,
    withCredentials: true
  },
  faeFeatureAccess: {
    url: `${EnvironmentUrls.apiGatewayUrl}/access-management/v1/feature-access?featureNames=AllowFaeItemToBeClaimed&nameSpace=avatar_marketplace_user_journey/MarketplaceUserJourney`,
    retryable: true,
    withCredentials: true
  },
  faeUpsellAccess: {
    url: `${EnvironmentUrls.apiGatewayUrl}/access-management/v1/feature-access?featureNames=ShowFaeUpsellInMarketplace&nameSpace=avatar_marketplace_user_journey/MarketplaceUserJourney`,
    retryable: true,
    withCredentials: true
  },
  assetRootUrlTemplate: 'catalog',
  bundleRootUrlTemplate: 'bundles'
};

export const hrefs = {
  loginWithRedirect: (returnUrl = ''): string => {
    const redirectTo = returnUrl || window.location.pathname + (window.location.search || '');
    return Endpoints.getAbsoluteUrl(`/login?returnUrl=${encodeURIComponent(redirectTo)}`);
  },
  upgradeToPremium: (itemId: number, itemType: TItemType): string => {
    return Endpoints.getAbsoluteUrl(
      `/premium/membership?ctx=WebItemDetail&upsellTargetType=${itemType}&upsellTargetId=${itemId}`
    );
  },
  getInventoryUrl: (authenticatedUserId: string): string =>
    Endpoints.getAbsoluteUrl(`/users/${authenticatedUserId}/inventory`),
  avatarPage: Endpoints.getAbsoluteUrl('/my/avatar')
};

export default urlConfigs;
