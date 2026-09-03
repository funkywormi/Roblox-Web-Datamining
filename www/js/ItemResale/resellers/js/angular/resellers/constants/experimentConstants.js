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

const localStorageNames = {
  showResellerTradeButton: 'Roblox.AvatarMarketplace.showResellerTradeButton'
};

const layerNames = {
  itemDetailsPage: 'AvatarMarketplace.UI'
};

const parameterNames = {
  showResellerTradeButton: ['showResellerTradeButton']
};

const defaultProjectId = 1;

export default {
  url,
  parameterNames,
  layerNames,
  defaultProjectId,
  localStorageNames
};
