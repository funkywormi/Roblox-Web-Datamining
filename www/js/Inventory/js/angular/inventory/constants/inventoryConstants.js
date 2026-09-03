import { Endpoints, EnvironmentUrls } from 'Roblox';
import inventoryModule from '../inventoryModule';

const inventoryConstants = {
  urls: {
    getUser: `${EnvironmentUrls.usersApi}/v1/users/{userId}`,
    getCreatorStoreItemDetails: `${EnvironmentUrls.apiGatewayUrl}/toolbox-service/v1/items/details?assetIds={assetIds}`,
    getPrivateServers: `${EnvironmentUrls.gamesApi}/v1/private-servers/my-private-servers`,
    getUserInventoryV2: `${EnvironmentUrls.inventoryApi}/v2/users/{userId}/inventory/{assetTypeId}`,
    getBundles: `${EnvironmentUrls.catalogApi}/v1/users/{userId}/bundles`,
    getBundlesWithType: `${EnvironmentUrls.catalogApi}/v1/users/{userId}/bundles/{bundleType}`,
    getCategories: `${EnvironmentUrls.inventoryApi}/v1/users/{userId}/categories`,
    getBadges: `${EnvironmentUrls.badgesApi}/v1/users/{userId}/badges`,
    getPlaces: `${EnvironmentUrls.inventoryApi}/v1/users/{userId}/places/inventory`,
    getGamePasses: `${EnvironmentUrls.apiGatewayUrl}/game-passes/v1/users/{userId}/game-passes`
  }
};

inventoryModule.constant('inventoryConstants', inventoryConstants);
export default inventoryConstants;
