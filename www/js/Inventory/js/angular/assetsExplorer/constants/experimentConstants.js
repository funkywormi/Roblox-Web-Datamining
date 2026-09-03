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

const layerNames = {};

const parameterNames = {};

const defaultProjectId = 1;

export default {
  url,
  parameterNames,
  layerNames,
  defaultProjectId
};
