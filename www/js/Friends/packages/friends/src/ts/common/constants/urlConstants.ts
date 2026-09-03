import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

export default {
  getFriendsExperimentationValuesUrl: (): string =>
    `${apiGatewayUrl}/product-experimentation-platform/v1/projects/1/layers/Social.Friends/values`
};
