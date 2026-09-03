import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

const url = {
  getExperimentationValues: (projectId, layerName, values) => ({
    url: `${apiGatewayUrl}/product-experimentation-platform/v1/projects/${projectId}/layers/${layerName}/values?parameters=${values.join(
      ','
    )}`,
    withCredentials: true
  })
};

const layerNames = {
  avatarShopPage: 'AvatarMarketplace.UI',
  avatarShopRecommendationsAndSearchWeb: 'AvatarMarketplace.RecommendationsAndSearch.Web',
  avatarMarketplaceRelevanceRecommendations: 'AvatarMarketplace.RelevanceRecommendations',
  avatarMarketplaceEditor: 'AvatarMarketplace.Editor'
};

const parameterNames = {
  recommendationNumRows: ['recommendationNumRows', 'recommendationPageName'],
  complimentaryItemRecommendationsEnabled: [
    'complimentaryItemRecommendationsEnabled',
    'displayPurchaseButtonLeft'
  ],
  avatarMarketplaceRelevanceRecommendations: ['recommendationNumRows'],
  avatarMarketplaceEditor: ['recommendationNumRows']
};

const defaultProjectId = 1;

export default {
  url,
  parameterNames,
  layerNames,
  defaultProjectId
};
