import { EnvironmentUrls } from 'Roblox';
import favoritesModule from '../favoritesModule.js';

const favoritesConstants = {
  urls: {
    getUser: `${EnvironmentUrls.usersApi}/v1/users/{userId}`,
    getCreatorStoreFavoriteAssets: `${EnvironmentUrls.apiGatewayUrl}/toolbox-service/v1/favorites/user/{userId}/{subtypeId}`,
    getUserFavoriteAssets: `${EnvironmentUrls.catalogApi}/v1/favorites/users/{userId}/favorites/{subtypeId}/assets`,
    getUserFavoriteGames: `${EnvironmentUrls.gamesApi}/v2/users/{userId}/favorite/games`,
    getUserFavoriteBundles: `${EnvironmentUrls.catalogApi}/v1/favorites/users/{userId}/favorites/{subtypeId}/bundles`,
    getCategories: `${EnvironmentUrls.inventoryApi}/v1/users/{userId}/categories/favorites`,
    getUserFavoriteLooks: `${EnvironmentUrls.apiGatewayUrl}/look-api/v1/looks/favorites`,
    getHydratedWidgets: `${EnvironmentUrls.apiGatewayUrl}/marketplace-widgets/v1/widgets/hydrate`,
    getBatchThumbnails: `${EnvironmentUrls.thumbnailsApi}/v1/batch`
  }
};

favoritesModule.constant('favoritesConstants', favoritesConstants);
export default favoritesConstants;
