import { EnvironmentUrls, CurrentUser } from 'Roblox';
import recommendationsModule from '../recommendationsModule';

// Hat,HairAccessory,FaceAccessory,NeckAccessory,
// ShoulderAccessory,BackAccessory,FrontAccessory,WaistAccessory
const itemListConstants = {
  robloxId: 1,
  assetTypes: {
    hat: 8,
    hairAccessory: 41,
    faceAccessory: 42,
    neckAccessory: 43,
    shoulderAccessory: 44,
    frontAccessory: 45,
    backAccessory: 46,
    waistAccessory: 47,
    gear: 19
  },
  moreByCreatorVariation: 1,
  endpoints: {
    getSearchItems: {
      url: `${EnvironmentUrls.catalogApi}/v1/search/items`,
      withCredentials: true,
      retryable: true
    },
    getItemDetails: {
      url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
      withCredentials: true,
      retryable: true
    },
    enrollment: {
      url: `${EnvironmentUrls.abtestingApiSite}/v1/enrollments`,
      withCredentials: true
    }
  },
  searchByCreatorParams: {
    creatorTargetId: null,
    createType: null,
    sortType: 'Sales',
    limit: 10
  },
  priceStatus: {
    free: 'Free',
    noResellers: 'NoResellers'
  },
  userTypes: {
    1: 'User',
    2: 'Group'
  },
  systemRobloxId: 1,
  templateUrls: {
    itemList: 'item-list'
  },
  itemTypes: {
    bundle: 'Bundle',
    asset: 'Asset'
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
  }
};

recommendationsModule.constant('itemListConstants', itemListConstants);
export default itemListConstants;
