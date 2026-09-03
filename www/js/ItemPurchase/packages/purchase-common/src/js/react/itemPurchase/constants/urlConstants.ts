import { EnvironmentUrls } from '@rbx/environment-urls';
import { urlService } from '@rbx/core-scripts/legacy/core-utilities';

const {
  economyApi,
  catalogApi,
  apiGatewayUrl,
  twoStepVerificationApi,
  vngGamesShopUrl
} = EnvironmentUrls;

export default {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  getRobuxUpgradesUrl: (source: any) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    urlService.getUrlWithQueries('/Upgrades/Robux.aspx', { ctx: source }),
  getAvatarPageUrl: () => urlService.getAbsoluteUrl('/my/avatar'),
  getPurchaseItemUrl: (productId: string | number) =>
    `${economyApi}/v1/purchases/products/${productId}`,
  getItemDetailsUrl: (itemId: string | number, itemType: string) =>
    `${catalogApi}/v1/catalog/items/${itemId}/details?itemType=${itemType}`,
  postItemDetailsUrl: () => `${catalogApi}/v1/catalog/items/details`,
  getPurchaseableDetailUrl: (productId: string | number) =>
    `${economyApi}/v1/products/${productId}?showPurchasable=true`,
  getPremiumConversionUrl: (itemId: string | number, itemType: string) =>
    `/premium/membership?ctx=WebItemDetail&upsellTargetType=${itemType}&upsellTargetId=${itemId}`,
  getResellerDataUrl: (assetId: string | number) =>
    `${economyApi}/v1/assets/${assetId}/resellers?limit=10`,
  getInventoryUrl: (userId: string | number) => `/users/${userId}/inventory`,
  getMetaDataUrl: () => `${economyApi}/v2/metadata`,
  getCurrentUserBalance: (userId: string | number) => `${economyApi}/v1/users/${userId}/currency`,
  getPurchaseCollectibleItemUrl: (collectibleItemId: string) =>
    `${apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/purchase-item`,
  getPurchaseCollectibleItemInstanceUrl: (collectibleItemId: string) =>
    `${apiGatewayUrl}/marketplace-sales/v1/item/${collectibleItemId}/purchase-resale`,
  getCollectibleItemDetailsUrl: () => `${apiGatewayUrl}/marketplace-items/v1/items/details`,
  getTwoStepVerificationConfig: (userId: string | number) =>
    `${twoStepVerificationApi}/v1/users/${userId}/configuration`,
  postGenerateTwoStepVerificationToken: (tokenType: string) =>
    `${economyApi}/v2/${tokenType}/two-step-verification/generate`,
  postRedeemTwoStepVerificationChallenge: (tokenType: string) =>
    `${economyApi}/v2/${tokenType}/two-step-verification/redeem`,
  postBulkPurchaseUrl: () => `${apiGatewayUrl}/cloud/v2/avatar-marketplace-orders`,
  getVngShopUrl: () => `${apiGatewayUrl}/vng-payments/v1/getVngShopUrl`,
  getVngShopFallbackUrl: () => vngGamesShopUrl,
  getSubscriptionsMetadataUrl: () => `${apiGatewayUrl}/roblox-subscriptions/v1/metadata`,
  /** @param productId NOT developer product id */
  postPurchaseDeveloperProductUrl: (productId: string | number) =>
    `${apiGatewayUrl}/developer-products/v1/developer-products/${productId}/purchase?requestLocationType=ExperienceDetailPage` as const,
  /** @param productId NOT game pass id */
  postPurchaseGamePassUrl: (productId: string | number) =>
    `${apiGatewayUrl}/game-passes/v1/game-passes/${productId}/purchase` as const,
  postPurchaseSubscriptionWithRobuxUrl: (subscriptionTargetKey: string) =>
    `${apiGatewayUrl}/v1/subscriptions/purchase-with-robux/${subscriptionTargetKey}`,
  postPrepareFiatSubscriptionPurchaseUrl: (subscriptionTargetKey: string) =>
    `${apiGatewayUrl}/v1/subscriptions/prepare-purchase/${subscriptionTargetKey}/web`
};
