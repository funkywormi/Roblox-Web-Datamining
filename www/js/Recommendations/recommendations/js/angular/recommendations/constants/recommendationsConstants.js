import recommendationsModule from '../recommendationsModule.js';

const recommendationsConstants = {
  recommendationTypes: {
    asset: 0,
    bundle: 2 // TODO: FOR ROLLOUT FALLBACK, WILL REMOVE IT AFTER ALL CHANGES ARE OUT
  },
  seeAllRecommendationLinks: {
    0: {
      64: '/catalog?Category=3&Subcategory=58',
      65: '/catalog?Category=3&Subcategory=59',
      68: '/catalog?Category=3&Subcategory=62',
      67: '/catalog?Category=3&Subcategory=61',
      66: '/catalog?Category=3&Subcategory=60',
      69: '/catalog?Category=3&Subcategory=63',
      72: '/catalog?Category=3&Subcategory=65',
      70: '/catalog?Category=3&Subcategory=64',
      71: '/catalog?Category=3&Subcategory=64',
      11: '/catalog?Category=3&Subcategory=56',
      12: '/catalog?Category=3&Subcategory=57',
      2: '/catalog?Category=3&Subcategory=55',
      8: '/catalog?Category=11&Subcategory=54',
      42: '/catalog?Category=11&Subcategory=21',
      43: '/catalog?Category=11&Subcategory=22',
      44: '/catalog?Category=11&Subcategory=23',
      45: '/catalog?Category=11&Subcategory=24',
      46: '/catalog?Category=11&Subcategory=25',
      47: '/catalog?Category=11&Subcategory=26',
      19: '/catalog?Category=11&Subcategory=5',
      41: '/catalog?Category=4&Subcategory=20',
      17: '/catalog?Category=4&Subcategory=15',
      18: '/catalog?Category=4&Subcategory=10',
      61: '/catalog?Category=12&Subcategory=39',
      55: '/catalog?Category=12&Subcategory=38',
      53: '/catalog?Category=12&Subcategory=38',
      50: '/catalog?Category=12&Subcategory=38',
      52: '/catalog?Category=12&Subcategory=38',
      54: '/catalog?Category=12&Subcategory=38',
      48: '/catalog?Category=12&Subcategory=38',
      51: '/catalog?Category=12&Subcategory=38'
    },
    2: {
      1: '/catalog?Category=17',
      4: '/catalog?Category=4&Subcategory=66'
    }
  },
  recommendationSubtypeOverrides: [
    {
      // Shoe override
      assetTypes: [70, 71],
      subject: 'user-inventory',
      newType: 2, // bundle
      newSubtype: 3 // shoe bundle
    }
  ],
  shoeAssetTypes: [70, 71],
  shoeBundleType: 3,
  recommendationSubtypes: {
    gamePasses: 21,
    badges: 34
  },
  assetTypes: {
    places: 9
  },
  urls: {
    catalog: '/catalog',
    catalogBundle: '/catalog?Category=17'
  },
  pageNames: {
    avatar: 'Avatar',
    catalogItem: 'CatalogItem',
    bundleDetails: 'BundleDetail',
    inventory: 'Inventory',
    favorites: 'Favorites'
  },
  carouselSelector: '#recommendation-carousel-container',
  assetRootUrlTemplate: 'catalog',
  bundleRootUrlTemplate: 'bundles',
  complimentaryItemRecommendationsSupportedPages: ['CatalogItem'],
  itemTypes: {
    asset: 'assets',
    bundle: 'bundles'
  }
};

recommendationsModule.constant('recommendationsConstants', recommendationsConstants);
export default recommendationsConstants;
