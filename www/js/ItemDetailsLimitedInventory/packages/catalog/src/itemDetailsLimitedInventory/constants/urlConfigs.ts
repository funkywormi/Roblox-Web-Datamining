import environmentUrls from "@rbx/environment-urls";

export const urlConfigs = {
  assetRootUrlTemplate: "catalog",
  bundleRootUrlTemplate: "bundles",
  getRecommendations: {
    url: `${environmentUrls.catalogApi}/v2/recommendations/complement-assets`,
    retryable: true,
    withCredentials: true,
  },
  postItemDetails: {
    url: `${environmentUrls.catalogApi}/v1/catalog/items/details`,
    retryable: true,
    withCredentials: true,
  },
  getItemOwnershipUrl: (userId: number, itemType: string, itemTargetId: number): string =>
    `${environmentUrls.inventoryApi}/v1/users/${userId}/items/${itemType}/${itemTargetId}/is-owned`,
  getLimited2CopiesOwned: (
    userId: number,
    collectibleItemId: string,
    limit: number,
    cursor: string | undefined,
  ): string =>
    `${
      environmentUrls.apiGatewayUrl
    }/marketplace-sales/v1/item/${collectibleItemId}/resellable-instances?cursor=${
      cursor || ""
    }&ownerType=User&ownerId=${userId}&limit=${limit}`,
  placeLimited2ItemOnSale: (collectibleItemId: string, collectibleInstanceId: string): string =>
    `${environmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/instance/${collectibleInstanceId}/resale`,
  getLimited2ResaleParameters: (collectibleItemId: string): string =>
    `${environmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/get-resale-parameters`,
  getLimited1ResaleData: (assetId: number): string =>
    `${environmentUrls.economyApi}/v1/assets/${assetId}/resale-data`,
  getLimited2ResaleData: (collectibleItemId: string): string =>
    `${environmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/resale-data`,
};

export default urlConfigs;
