// We are using the mobile layer in order to allow this test to take place during the mobile test (better data)
const layerNames = {
  avatarShopPage: 'AvatarMarketplace.UI',
  avatarShopRecommendationsAndSearchWeb: 'AvatarMarketplace.RecommendationsAndSearch.Web',
  avatarShopRecommendationsAndSearch: 'AvatarMarketplace.RecommendationsAndSearch',
  avatarMarketplaceGuidedFeatures: 'AvatarMarketplace.GuidedFeatures',
  avatarMarketplaceShoppingCart: 'AvatarMarketplace.ShoppingCart',
  avatarMarketplaceSorts: 'AvatarMarketplace.Sorts'
};

const parameterNames = {
  avatarShopPage: ['avatarShopPlacement', 'isItemDetailsEnabled'],
  avatarShopRecommendationsAndSearchWeb: [],
  avatarShopRecommendationsAndSearch: ['infiniteScroll'],
  avatarMarketplaceGuidedFeatures: ['topicsEnabledWeb'],
  avatarMarketplaceShoppingCart: [],
  avatarMarketplaceSorts: []
};

const defaultProjectId = 1;

export default {
  parameterNames,
  layerNames,
  defaultProjectId
};
