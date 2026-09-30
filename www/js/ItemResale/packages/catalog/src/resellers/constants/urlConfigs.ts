import environmentUrls from "@rbx/environment-urls";

export const urlConfigs = {
  getResaleData: (assetId: number | string) => ({
    url: `${environmentUrls.economyApi}/v1/assets/${assetId}/resale-data`,
    withCredentials: true,
  }),
  getCanTradeWith: (userId: number | string) => ({
    url: `${environmentUrls.tradesApi}/v1/users/${userId}/can-trade-with`,
    withCredentials: true,
  }),
  postItemDetails: {
    url: `${environmentUrls.catalogApi}/v1/catalog/items/details`,
    withCredentials: true,
  },
  postMarketplaceItemDetails: {
    url: `${environmentUrls.apiGatewayUrl}/marketplace-items/v1/items/details`,
    withCredentials: true,
  },
  getResellersForLimited2Item: (collectibleItemId: string) => ({
    url: `${environmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/resellers`,
    withCredentials: true,
  }),
  placeLimited2ItemOnSale: (collectibleItemId: string, collectibleInstanceId: string) => ({
    url: `${environmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/instance/${collectibleInstanceId}/resale`,
    withCredentials: true,
  }),
  getResaleDataForLimited2Item: (collectibleItemId: string) => ({
    url: `${environmentUrls.apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/resale-data`,
    withCredentials: true,
  }),
};

export default urlConfigs;
