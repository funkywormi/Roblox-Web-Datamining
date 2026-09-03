import { EnvironmentUrls } from 'Roblox';

export const urlConfigs = {
  assetRootUrlTemplate: 'catalog',
  bundleRootUrlTemplate: 'bundles',
  getRecommendations: {
    url: `${EnvironmentUrls.catalogApi}/v2/recommendations/complement-assets`,
    retryable: true,
    withCredentials: true
  },
  postItemDetails: {
    url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
    retryable: true,
    withCredentials: true
  },
  getItemOwnershipUrl: (userId: number, itemType: string, itemTargetId: number): string =>
    `${EnvironmentUrls.inventoryApi}/v1/users/${userId}/items/${itemType}/${itemTargetId}/is-owned`,
  getLimited1CopiesOwned: (userId: number, assetId: number): string =>
    `${EnvironmentUrls.economyApi}/v1/assets/${assetId}/users/${userId}/resellable-copies`,
  placeLimited1ItemOnSale: (assetId: number, userAssetId: number): string =>
    `${EnvironmentUrls.economyApi}/v1/assets/${assetId}/resellable-copies/${userAssetId}`,
  getLimited2CopiesOwned: (
    userId: number,
    collectibleItemId: string,
    limit: number,
    cursor: string | undefined
  ): string =>
    `${
      EnvironmentUrls.apiGatewayUrl
    }/marketplace-sales/v1/item/${collectibleItemId}/resellable-instances?cursor=${
      cursor || ''
    }&ownerType=User&ownerId=${userId}&limit=${limit}`,
  placeLimited2ItemOnSale: (collectibleItemId: string, collectibleInstanceId: string): string =>
    `${EnvironmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/instance/${collectibleInstanceId}/resale`,
  getLimited2ResaleParameters: (collectibleItemId: string): string =>
    `${EnvironmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/get-resale-parameters`
};

export default urlConfigs;
