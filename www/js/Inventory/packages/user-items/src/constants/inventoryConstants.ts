import environmentUrls from "@rbx/environment-urls";

const inventoryConstants = {
  // Forked from the recommendations Angular module's own constants, which Inventory used to reach into
  // via DI. inventoryContentController.js carried a TODO asking for exactly this.
  recommendationTypes: {
    asset: 0,
    bundle: 2,
  },
  urls: {
    getUser: `${environmentUrls.usersApi}/v1/users/{userId}`,
    getCreatorStoreItemDetails: `${environmentUrls.apiGatewayUrl}/toolbox-service/v1/items/details?assetIds={assetIds}`,
    getPrivateServers: `${environmentUrls.gamesApi}/v1/private-servers/my-private-servers`,
    getMyPrivateServersV2: `${environmentUrls.apiGatewayUrl}/private-servers-api-v2/v2/users/{userId}/private-servers`,
    getUserInventoryV2: `${environmentUrls.inventoryApi}/v2/users/{userId}/inventory/{assetTypeId}`,
    getBundles: `${environmentUrls.catalogApi}/v1/users/{userId}/bundles`,
    getBundlesWithType: `${environmentUrls.catalogApi}/v1/users/{userId}/bundles/{bundleType}`,
    getCategories: `${environmentUrls.inventoryApi}/v1/users/{userId}/categories`,
    getBadges: `${environmentUrls.badgesApi}/v1/users/{userId}/badges`,
    getPlaces: `${environmentUrls.inventoryApi}/v1/users/{userId}/places/inventory`,
    getGamePasses: `${environmentUrls.apiGatewayUrl}/game-passes/v1/users/{userId}/game-passes`,
  },
};

export default inventoryConstants;
