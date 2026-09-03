import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

const url = {
  getExperimentationValues: (projectId: number, layerName: string, values: string[]) => ({
    url: `${apiGatewayUrl}/product-experimentation-platform/v1/projects/${projectId}/layers/${layerName}/values?parameters=${values.join(
      ','
    )}`,
    withCredentials: true,
    timeout: 2000
  })
};

const layerNames = {
  avatarShopPage: 'AvatarMarketplace.UI',
  avatarExperience: 'AvatarExperience',
  avatarMarketplaceShoppingCart: 'AvatarMarketplace.ShoppingCart',
  avatarShopRecommendationsAndSearchWeb: 'AvatarMarketplace.RecommendationsAndSearch.Web'
};

const parameterNames = {
  layeredClothingSort: ['lcSortEnabled'],
  avatarMarketplaceShoppingCart: []
};

const defaultProjectId = 1;

export default {
  url,
  parameterNames,
  layerNames,
  defaultProjectId
};
