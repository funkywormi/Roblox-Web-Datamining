import environmentUrls from "@rbx/environment-urls";

export const urlConfigs = {
  getRecommendations: (isBundle: boolean) => ({
    url: `${environmentUrls.catalogApi}/v2/recommendations/${isBundle ? "bundles" : "assets"}`,
    withCredentials: true,
  }),
  getCanConfigure: (targetId: number | string, isBundle: boolean) => ({
    url: `${
      environmentUrls.itemConfigurationApi
    }/v1/collectibles/check-item-configuration-access?TargetType=${
      isBundle ? 1 : 0
    }&TargetId=${targetId}`,
    withCredentials: true,
  }),
  getCanSponsor: (targetId: number | string) => ({
    url: `${environmentUrls.adConfigurationApi}/v2/sponsored-campaigns/multi-get-can-user-sponsor?campaignTargetType=2&campaignTargetIds=${targetId}`,
    withCredentials: true,
  }),
  getUserShowcase: (userId: number | string | null) => ({
    url: `${environmentUrls.showcasesApi}/v1/users/profile/robloxcollections-json?userId=${userId}`,
    withCredentials: true,
  }),
  getDetails: (targetId: number | string) => ({
    url: `${environmentUrls.catalogApi}/v1/catalog/items/${targetId}/details`,
    withCredentials: true,
  }),
  getCurrentUserBalance: (userId: number | string | null) => ({
    url: `${environmentUrls.economyApi}/v1/users/${userId}/currency`,
    withCredentials: true,
  }),
  getAssetThumbnail: {
    url: `${environmentUrls.thumbnailsApi}/v1/assets`,
    withCredentials: true,
  },
  getBundleThumbnail: {
    url: `${environmentUrls.thumbnailsApi}/v1/bundles/thumbnails`,
    withCredentials: true,
  },
};

export default urlConfigs;
