import { EnvironmentUrls } from 'Roblox';

export const urlConfigs = {
  getAvatar: {
    url: `${EnvironmentUrls.avatarApi}/v2/avatar/avatar`,
    retryable: true,
    withCredentials: true
  },
  avatarRules: {
    url: `${EnvironmentUrls.avatarApi}/v1/avatar-rules`,
    retryable: true,
    withCredentials: true
  },
  avatarRender: {
    url: `${EnvironmentUrls.avatarApi}/v1/avatar/render`,
    retryable: true,
    withCredentials: true
  },
  catalogSearchV2Url: {
    url: `${EnvironmentUrls.catalogApi}/v2/search/items/details`,
    retryable: true,
    withCredentials: true
  },
  assetItemDetails: {
    url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
    retryable: true,
    withCredentials: true
  },
  bundleItemDetails: {
    url: `${EnvironmentUrls.catalogApi}/v1/bundles/details`,
    retryable: true,
    withCredentials: true
  },
  asset3DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/assets-thumbnail-3d`,
    retryable: true,
    withCredentials: true
  },
  asset2DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/assets`,
    retryable: true,
    withCredentials: true
  },
  animation3DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/asset-thumbnail-animated`,
    retryable: true,
    withCredentials: true
  },
  bundles2DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/bundles/thumbnails`,
    retryable: true,
    withCredentials: true
  },
  outfits3DThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/users/outfit-3d`,
    retryable: true,
    withCredentials: true
  },
  batchThumbnail: {
    url: `${EnvironmentUrls.thumbnailsApi}/v1/batch`,
    retryable: true,
    withCredentials: true
  },
  assetRootUrlTemplate: 'catalog',
  bundleRootUrlTemplate: 'bundles'
};

export default urlConfigs;
