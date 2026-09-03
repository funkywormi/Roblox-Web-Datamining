import { EnvironmentUrls } from 'Roblox';

const sponsoredCatalogItemsConstants = {
  itemDetailsAdCount: 7,
  catalogCategoryType: 'All',
  campaignTargetType: 'Asset',
  getSponsoredCatalogItems: {
    url: `${EnvironmentUrls.catalogApi}/v1/catalog/sponsored-items`,
    retryable: false,
    withCredentials: true
  },
  getCatalogItemsDetails: {
    url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
    retryable: false,
    withCredentials: true
  },
  recordClick: {
    url: `${EnvironmentUrls.adConfigurationApi}/v2/tracking/click`,
    retryable: false,
    withCredentials: true
  },
  sizing: {
    // Size of item card in pixels
    tileWidth: 150,
    // Screen breakpoints
    screenSize1Item: 768,
    screenSize3Items: 784,
    screenSize4Items: 1127,
    screenSize5Items: 1283,
    screenSize6Items: 1907,
    // Extra space
    catalogLeftNav: 160,
    websiteLeftNav: 175,
    extraSpace: 43
  }
};

export default sponsoredCatalogItemsConstants;
