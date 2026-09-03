import { EnvironmentUrls, Endpoints } from 'Roblox';

const catalogConstants = {
  defaults: {
    subcategory: '0'
  },
  /* for detail, examine item in $scope.data.categories, or endpoint /catalog/search-options
   * for each **category** in categories, Id => category.Category.Data, Name => category.Category.Description
   * subcategories, if any, are stored in array Item.Subcategories, whose Id and Name mapping is similar
   * to that for **category**
   *
   * note: **key** is not guaranteed to present as a property for a **subcategory**, do not rely on it!
   */
  allGearSubcategoryId: '0',

  buyRobuxUrl: `${EnvironmentUrls.websiteUrl}/upgrades/robux?ctx=catalogNew`,
  fallbackVngShopUrl: EnvironmentUrls.vngGamesShopUrl,
  catalogUrl: `${EnvironmentUrls.websiteUrl}/catalog`,
  numberOfSearchItems: 30,
  numberOfSearchItemsForFullScreen: 60,
  numberOfSearchItemsExpanded: 120,
  expandedCategoryList: ['Recommended'],
  endpoints: {
    getMetadata: {
      url: `${EnvironmentUrls.catalogApi}/v1/catalog/metadata`,
      retryable: true,
      withCredentials: true
    },

    getSearchOptionsUrl: {
      url: Endpoints
        ? Endpoints.getAbsoluteUrl('/catalog/search-options')
        : '/catalog/search-options'
    },
    getNavigationMenuItems: {
      url: `${EnvironmentUrls.catalogApi}/v1/search/navigation-menu-items`,
      retryable: true,
      withCredentials: true
    },
    getSearchItemsV2: {
      url: `${EnvironmentUrls.catalogApi}/v2/search/items/details`,
      retryable: true,
      withCredentials: true
    },
    getCatalogItemDetails: {
      url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
      retryable: false,
      withCredentials: true
    },

    performanceMeasurements: {
      url: `${EnvironmentUrls.metricsApi}/v1/performance/measurements`,
      retryable: false,
      withCredentials: true
    },
    avatarRequestSuggestion: {
      url: `${EnvironmentUrls.apiGatewayUrl}/autocomplete-avatar/v2/suggest`,
      withCredentials: true,
      timeout: 5000
    },
    avatarRequestCdnSuggestion: {
      url: `${EnvironmentUrls.apiGatewayCdnUrl}/autocomplete-avatar/v2/suggest`,
      withCredentials: true,
      timeout: 5000
    },
    postGetTopics: {
      url: `${EnvironmentUrls.catalogApi}/v1/topic/get-topics`,
      withCredentials: true,
      timeout: 5000
    },
    getUserCurrency: {
      url: '/v1/users/{userId}/currency',
      withCredentials: true,
      timeout: 5000
    },
    postMarketplaceItemDetails: {
      url: `${EnvironmentUrls.apiGatewayUrl}/marketplace-items/v1/items/details`,
      retryable: false,
      withCredentials: true
    },
    getSignedVngShopUrl: {
      url: `${EnvironmentUrls.apiGatewayUrl}/vng-payments/v1/getVngShopUrl`,
      withCredentials: true
    }
  },
  getResellerDataUrl: (assetId: number): string =>
    `${EnvironmentUrls.economyApi}/v1/assets/${assetId}/resellers?limit=10`,

  itemTypes: {
    bundle: 'Bundle',
    asset: 'Asset'
  },
  priceStatus: {
    free: 'Free',
    noResellers: 'NoResellers'
  },
  itemRestrictionTypes: {
    thirteenPlus: 'ThirteenPlus',
    limitedUnique: 'LimitedUnique',
    limited: 'Limited',
    rthro: 'Rthro',
    dynamicHead: 'Live',
    collectible: 'Collectible'
  },
  itemRestrictionIcons: {
    thirteenPlus: 'icon-thirteen-plus-label',
    limited: 'icon-limited-label',
    limitedUnique: 'icon-limited-unique-label',
    thirteenPlusLimited: 'icon-thirteen-plus-limited-label',
    thirteenPlusLimitedUnique: 'icon-thirteen-plus-limited-unique-label',
    rthroLabel: 'icon-rthro-label',
    rthroLimitedLabel: 'icon-rthro-limited-label',
    dynamicHead: '',
    collectible: 'icon-limited-unique-label'
  },
  robloxSystemUserId: 1,

  userTypes: {
    user: 'User',
    group: 'Group'
  },
  errorMessages: {
    categoryName: 'CatalogPageAjaxErrors',
    endpointNames: {
      getSearchItems: 'SearchItems',
      getCatalogItemDetails: 'CatalogItemDetails'
    }
  },
  englishLanguageCode: 'en',
  autocompleteQueryAmount: 10,
  autocompleteSuggestionEventData: {
    autocompleteSuggestionEventContext: 'webAvatarShop',
    autocompleteSuggestionEventTimeoutDelay: 200,
    searchAutocompleteEvent: 'searchAutocomplete',
    searchTextTrimEvent: 'searchTextTrim',
    catalogSearchEvent: 'catalogSearch',
    searchClearEvent: 'searchClear',
    searchSuggestionClickedEvent: 'searchSuggestionClicked',
    pageName: 'Avatar Shop',
    searchBox: 'avatarShopDesktop',
    searchType: 'avatarshopsearch',
    suggestionSource: 'server'
  },
  topics: {
    categoriesToShowTopics: [1, 15],
    maxTopicsToRequest: 40,
    numberOfItemsToSend: 10,
    topicCarouselId: 'topic-carousel',
    topicCarouselScrollValue: 500
  },
  topicEventData: {
    topicEventContext: 'webAvatarShop',
    topicSelectEventName: 'selectCatalogTopic',
    topicDeselectEventName: 'deselectCatalogTopic',
    topicClearEventName: 'clearAllTopics'
  },
  itemTypeIds: {
    asset: 1,
    bundle: 2
  },
  topUp: {
    resetTime: 604800000,
    robuxThreshold: 50,
    displayCategories: [1]
  },
  keywordSearch: {
    censoredKey: '###'
  }
};

export default catalogConstants;
