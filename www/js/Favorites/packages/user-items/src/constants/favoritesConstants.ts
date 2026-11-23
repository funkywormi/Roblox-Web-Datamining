import environmentUrls from "@rbx/environment-urls";

const favoritesConstants = {
  urls: {
    getUser: `${environmentUrls.usersApi}/v1/users/{userId}`,
    getCreatorStoreFavoriteAssets: `${environmentUrls.apiGatewayUrl}/toolbox-service/v1/favorites/user/{userId}/{subtypeId}`,
    getUserFavoriteAssets: `${environmentUrls.catalogApi}/v1/favorites/users/{userId}/favorites/{subtypeId}/assets`,
    getUserFavoriteGames: `${environmentUrls.gamesApi}/v2/users/{userId}/favorite/games`,
    getUserFavoriteBundles: `${environmentUrls.catalogApi}/v1/favorites/users/{userId}/favorites/{subtypeId}/bundles`,
    getCategories: `${environmentUrls.inventoryApi}/v1/users/{userId}/categories/favorites`,
    getUserFavoriteLooks: `${environmentUrls.apiGatewayUrl}/look-api/v1/looks/favorites`,
    getHydratedWidgets: `${environmentUrls.apiGatewayUrl}/marketplace-widgets/v1/widgets/hydrate`,
  },
};

export default favoritesConstants;
