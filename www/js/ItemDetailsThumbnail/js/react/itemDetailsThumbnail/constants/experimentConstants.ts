import { EnvironmentUrls } from 'Roblox';

const { apiGatewayUrl } = EnvironmentUrls;

const url = {
  getExperimentationValues: (projectId: number, layerName: string, values: string[]) => ({
    url: `${apiGatewayUrl}/product-experimentation-platform/v1/projects/${projectId}/layers/${layerName}/values?parameters=${values.join(
      ','
    )}`,
    withCredentials: true
  })
};

const layerNames = {
  avatarShopPage: 'AvatarMarketplace.UI',
  avatarExperience: 'AvatarExperience',
  avatarExperienceCatalog: 'AvatarExperience.Web.Catalog'
};

const parameterNames = {
  layeredClothingSort: ['lcSortEnabled'],
  marketplaceRevamp: ['robuxInThumbnail', 'refreshEnabled']
};

const defaultProjectId = 1;

export default {
  url,
  parameterNames,
  layerNames,
  defaultProjectId
};
