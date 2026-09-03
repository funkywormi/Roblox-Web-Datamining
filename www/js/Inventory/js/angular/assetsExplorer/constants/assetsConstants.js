import { EnvironmentUrls } from 'Roblox';
import assetsExplorerModule from '../assetsExplorerModule';
import { creatorStoreAssetTypes } from './types';

const assetsConstants = {
  endpoints: {
    getCatalogMetadata: {
      url: `${EnvironmentUrls.catalogApi}/v1/catalog/metadata`,
      retryable: true,
      withCredentials: true
    },
    getAssetToCatalogCategory: {
      url: `${EnvironmentUrls.catalogApi}/v1/asset-to-category`
    },
    getAssetToCatalogSubcategory: {
      url: `${EnvironmentUrls.catalogApi}/v1/asset-to-subcategory`
    },
    postItemDetails: {
      url: `${EnvironmentUrls.catalogApi}/v1/catalog/items/details`,
      retryable: true,
      withCredentials: true
    }
  },
  types: {
    myGames: 'MyGames',
    otherGames: 'OtherGames',
    privateServers: 'PrivateServers',
    myPrivateServers: 'MyPrivateServers',
    otherPrivateServers: 'OtherPrivateServers',
    place: 'Place',
    places: 'Places',
    badges: 'Badges',
    gamePasses: 'Game Passes',
    avatarAnimations: 'AvatarAnimations',
    badge: 'Badge',
    gamePass: 'GamePass',
    decal: 'Decal',
    model: 'Model',
    audio: 'Audio',
    video: 'Video',
    plugin: 'Plugin',
    animation: 'Animation',
    meshPart: 'MeshPart',
    accessories: 'Accessories'
  },
  assetTypeIds: {
    badge: 21,
    gamePass: 34,
    place: 9,
    avatar: 16,
    bundle: 32 // Use package assetTypeId for bundles
  },
  itemTypes: {
    asset: 'asset',
    badge: 'badge',
    game: 'game',
    gamePass: 'gamePass',
    bundle: 'bundle',
    avatar: 'avatar'
  },
  favorites: 'favorites',
  catalog: 'catalog',
  library: 'library',
  /*
   * This parameter needs to be specified in urls that lead to the catalog page.
   * Currently, the contexts 0 (old catalog view) and 2 can be accessed by changing the url, but 2 is the one we want users to see.
   */
  currentCatalogContext: '2',
  defaultLayoutData: {
    isPremiumIconOnItemTilesEnabled: false,
    isPremiumPriceOnItemTilesEnabled: false
  },
  userTypes: {
    user: 1,
    group: 2
  },
  robloxSystemUserId: 1,
  dynamicHeadRestrictionName: 'Live',
  collectibleRestrictionName: 'Collectible',
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
  itemType: {
    asset: 1,
    bundle: 2,
    look: 3
  },
  userTypesString: {
    user: 'User',
    group: 'Group'
  },
  bundleMarketplaceCategoryMapping: {
    1: { category: 17 },
    4: { category: 4, subcategory: 66 },
    2: { category: 12, subcategory: 38 }
  },
  creatorStoreAssetTypeIds: Object.keys(creatorStoreAssetTypes).map(Number),
  creatorStoreAssetAbsoluteUrl: `https://create.${EnvironmentUrls.domain}/store/asset/{assetId}?assetType={assetType}&externalSource=www`,
  favoriteCategories: [
    {
      name: 'Classic Heads',
      displayName: 'Classic Heads',
      categoryType: 'Head',
      items: [
        {
          name: 'Classic Heads',
          displayName: 'Classic Heads',
          id: 17,
          type: 'AssetType',
          categoryType: 'Head'
        }
      ]
    },
    {
      name: 'Faces',
      displayName: 'Faces',
      categoryType: 'Face',
      items: [
        {
          name: 'Faces',
          displayName: 'Faces',
          id: 18,
          type: 'AssetType',
          categoryType: 'Face'
        }
      ]
    },
    {
      name: 'Decals',
      displayName: 'Decals',
      categoryType: 'Decal',
      items: [
        {
          name: 'Decals',
          displayName: 'Decals',
          id: 13,
          type: 'AssetType',
          categoryType: 'Decal'
        }
      ]
    },
    {
      name: 'Models',
      displayName: 'Models & Packages',
      categoryType: 'Model',
      items: [
        {
          name: 'Models & Packages',
          displayName: 'Models & Packages',
          id: 10,
          type: 'AssetType',
          categoryType: 'Model'
        }
      ]
    },
    {
      name: 'Plugins',
      displayName: 'Plugins',
      categoryType: 'Plugin',
      items: [
        {
          name: 'Plugins',
          displayName: 'Plugins',
          id: 38,
          type: 'AssetType',
          categoryType: 'Plugin'
        }
      ]
    },
    {
      name: 'Animations',
      displayName: 'Animations',
      categoryType: 'Animation',
      items: [
        {
          name: 'Animations',
          displayName: 'Animations',
          id: 24,
          type: 'AssetType',
          categoryType: 'Animation'
        }
      ]
    },
    {
      name: 'Audio',
      displayName: 'Audio',
      categoryType: 'Audio',
      items: [
        {
          name: 'Audio',
          displayName: 'Audio',
          id: 3,
          type: 'AssetType',
          categoryType: 'Audio'
        }
      ]
    },
    {
      name: 'MeshParts',
      displayName: 'Meshes',
      categoryType: 'MeshPart',
      items: [
        {
          name: 'Meshes',
          displayName: 'Meshes',
          id: 40,
          type: 'AssetType',
          categoryType: 'MeshPart'
        }
      ]
    },
    {
      name: 'Heads',
      displayName: 'Heads',
      categoryType: 'DynamicHead',
      items: [
        {
          name: 'Heads',
          displayName: 'Heads',
          id: 4,
          type: 'Bundle',
          categoryType: 'DynamicHead'
        }
      ]
    },
    {
      name: 'Video',
      displayName: 'Video',
      categoryType: 'Video',
      items: [
        {
          name: 'Video',
          displayName: 'Video',
          id: 62,
          type: 'AssetType',
          categoryType: 'Video'
        }
      ]
    },
    {
      name: 'Bundles',
      displayName: 'Bundles',
      categoryType: 'Bundle',
      items: [
        {
          name: 'Body Parts',
          displayName: 'Body Parts',
          id: 1,
          type: 'Bundle',
          categoryType: 'BodyParts'
        },
        {
          name: 'Avatar Animations',
          displayName: 'Avatar Animations',
          id: 2,
          type: 'Bundle',
          categoryType: 'AvatarAnimations'
        }
      ]
    },
    {
      name: 'Accessories',
      displayName: 'Accessories',
      categoryType: 'Accessories',
      items: [
        {
          name: 'Head',
          displayName: 'Head',
          id: 8,
          type: 'AssetType',
          categoryType: 'Hat'
        },
        {
          name: 'Face',
          displayName: 'Face',
          id: 42,
          type: 'AssetType',
          categoryType: 'FaceAccessory'
        },
        {
          name: 'Neck',
          displayName: 'Neck',
          id: 43,
          type: 'AssetType',
          categoryType: 'NeckAccessory'
        },
        {
          name: 'Shoulder',
          displayName: 'Shoulder',
          id: 44,
          type: 'AssetType',
          categoryType: 'ShoulderAccessory'
        },
        {
          name: 'Front',
          displayName: 'Front',
          id: 45,
          type: 'AssetType',
          categoryType: 'FrontAccessory'
        },
        {
          name: 'Back',
          displayName: 'Back',
          id: 46,
          type: 'AssetType',
          categoryType: 'BackAccessory'
        },
        {
          name: 'Waist',
          displayName: 'Waist',
          id: 47,
          type: 'AssetType',
          categoryType: 'WaistAccessory'
        },
        {
          name: 'Gear',
          displayName: 'Gear',
          id: 19,
          type: 'AssetType',
          categoryType: 'Gear'
        }
      ]
    },
    {
      name: 'Classic Clothing',
      displayName: 'Classic Clothing',
      categoryType: 'ClassicClothing',
      items: [
        {
          name: 'Classic T-shirts',
          displayName: 'Classic T-shirts',
          id: 2,
          type: 'AssetType',
          categoryType: 'TShirt'
        },
        {
          name: 'Classic Shirts',
          displayName: 'Classic Shirts',
          id: 11,
          type: 'AssetType',
          categoryType: 'Shirt'
        },
        {
          name: 'Classic Pants',
          displayName: 'Classic Pants',
          id: 12,
          type: 'AssetType',
          categoryType: 'Pants'
        }
      ]
    },
    {
      name: 'Hair Accessories',
      displayName: 'Hair',
      categoryType: 'HairAccessory',
      items: [
        {
          name: 'Hair',
          displayName: 'Hair',
          id: 41,
          type: 'AssetType',
          categoryType: 'HairAccessory'
        }
      ]
    },
    {
      name: 'Tops',
      displayName: 'Tops',
      categoryType: 'Tops',
      items: [
        {
          name: 'T-shirts',
          displayName: 'T-shirts',
          id: 64,
          type: 'AssetType',
          categoryType: 'TShirtAccessory'
        },
        {
          name: 'Shirts',
          displayName: 'Shirts',
          id: 65,
          type: 'AssetType',
          categoryType: 'ShirtAccessory'
        },
        {
          name: 'Sweaters',
          displayName: 'Sweaters',
          id: 68,
          type: 'AssetType',
          categoryType: 'SweaterAccessory'
        },
        {
          name: 'Jackets',
          displayName: 'Jackets',
          id: 67,
          type: 'AssetType',
          categoryType: 'JacketAccessory'
        }
      ]
    },
    {
      name: 'Bottoms',
      displayName: 'Bottoms',
      categoryType: 'Bottoms',
      items: [
        {
          name: 'Pants',
          displayName: 'Pants',
          id: 66,
          type: 'AssetType',
          categoryType: 'PantsAccessory'
        },
        {
          name: 'Shorts',
          displayName: 'Shorts',
          id: 69,
          type: 'AssetType',
          categoryType: 'ShortsAccessory'
        },
        {
          name: 'Skirts',
          displayName: 'Skirts',
          id: 72,
          type: 'AssetType',
          categoryType: 'SkirtsAccessory'
        }
      ]
    },
    {
      name: 'Shoes',
      displayName: 'Shoes',
      categoryType: 'Shoes',
      items: [
        {
          name: 'Left Shoe',
          displayName: 'Left Shoe',
          id: 70,
          type: 'AssetType',
          categoryType: 'LeftShoeAccessory'
        },
        {
          name: 'Right Shoe',
          displayName: 'Right Shoe',
          id: 71,
          type: 'AssetType',
          categoryType: 'RightShoeAccessory'
        }
      ]
    },
    {
      name: 'Emote Animations',
      displayName: 'Emotes',
      categoryType: 'EmoteAnimation',
      items: [
        {
          name: 'Emotes',
          displayName: 'Emotes',
          id: 61,
          type: 'AssetType',
          categoryType: 'EmoteAnimation'
        }
      ]
    },
    {
      name: 'Places',
      displayName: 'Places',
      categoryType: 'Place',
      items: [
        {
          name: 'Places',
          displayName: 'Places',
          id: 9,
          type: 'AssetType',
          categoryType: 'Place'
        }
      ]
    },
    {
      name: 'Avatar Animations',
      displayName: 'Avatar Animations',
      categoryType: 'AvatarAnimations',
      items: [
        {
          name: 'Run',
          displayName: 'Run',
          id: 53,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Walk',
          displayName: 'Walk',
          id: 55,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Fall',
          displayName: 'Fall',
          id: 50,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Jump',
          displayName: 'Jump',
          id: 52,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Idle',
          displayName: 'Idle',
          id: 51,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Swim',
          displayName: 'Swim',
          id: 54,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Climb',
          displayName: 'Climb',
          id: 48,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        }
      ]
    }
  ],
  inventoryCategories: [
    {
      name: 'Classic Heads',
      displayName: 'Classic Heads',
      categoryType: 'Head',
      items: [
        {
          name: 'Classic Heads',
          displayName: 'Classic Heads',
          id: 17,
          type: 'AssetType',
          categoryType: 'Head'
        }
      ]
    },
    {
      name: 'Faces',
      displayName: 'Faces',
      categoryType: 'Face',
      items: [
        {
          name: 'Faces',
          displayName: 'Faces',
          id: 18,
          type: 'AssetType',
          categoryType: 'Face'
        }
      ]
    },
    {
      name: 'Decals',
      displayName: 'Decals',
      categoryType: 'Decal',
      items: [
        {
          name: 'Decals',
          displayName: 'Decals',
          id: 13,
          type: 'AssetType',
          categoryType: 'Decal'
        }
      ]
    },
    {
      name: 'Models',
      displayName: 'Models & Packages',
      categoryType: 'Model',
      items: [
        {
          name: 'Models & Packages',
          displayName: 'Models & Packages',
          id: 10,
          type: 'AssetType',
          categoryType: 'Model'
        }
      ]
    },
    {
      name: 'Plugins',
      displayName: 'Plugins',
      categoryType: 'Plugin',
      items: [
        {
          name: 'Plugins',
          displayName: 'Plugins',
          id: 38,
          type: 'AssetType',
          categoryType: 'Plugin'
        }
      ]
    },
    {
      name: 'Animations',
      displayName: 'Animations',
      categoryType: 'Animation',
      items: [
        {
          name: 'Animations',
          displayName: 'Animations',
          id: 24,
          type: 'AssetType',
          categoryType: 'Animation'
        }
      ]
    },
    {
      name: 'Audio',
      displayName: 'Audio',
      categoryType: 'Audio',
      items: [
        {
          name: 'Audio',
          displayName: 'Audio',
          id: 3,
          type: 'AssetType',
          categoryType: 'Audio'
        }
      ]
    },
    {
      name: 'MeshParts',
      displayName: 'Meshes',
      categoryType: 'MeshPart',
      items: [
        {
          name: 'Meshes',
          displayName: 'Meshes',
          id: 40,
          type: 'AssetType',
          categoryType: 'MeshPart'
        }
      ]
    },
    {
      name: 'Heads',
      displayName: 'Heads',
      categoryType: 'DynamicHead',
      items: [
        {
          name: 'Heads',
          displayName: 'Heads',
          id: 4,
          type: 'Bundle',
          categoryType: 'DynamicHead'
        }
      ]
    },
    {
      name: 'Video',
      displayName: 'Video',
      categoryType: 'Video',
      items: [
        {
          name: 'Video',
          displayName: 'Video',
          id: 62,
          type: 'AssetType',
          categoryType: 'Video'
        }
      ]
    },
    {
      name: 'Bundles',
      displayName: 'Bundles',
      categoryType: 'Bundle',
      items: [
        {
          name: 'Body Parts',
          displayName: 'Body Parts',
          id: 1,
          type: 'Bundle',
          categoryType: 'BodyParts'
        }
      ]
    },
    {
      name: 'Accessories',
      displayName: 'Accessories',
      categoryType: 'Accessories',
      items: [
        {
          name: 'Head',
          displayName: 'Head',
          id: 8,
          type: 'AssetType',
          categoryType: 'Hat'
        },
        {
          name: 'Face',
          displayName: 'Face',
          id: 42,
          type: 'AssetType',
          categoryType: 'FaceAccessory'
        },
        {
          name: 'Neck',
          displayName: 'Neck',
          id: 43,
          type: 'AssetType',
          categoryType: 'NeckAccessory'
        },
        {
          name: 'Shoulder',
          displayName: 'Shoulder',
          id: 44,
          type: 'AssetType',
          categoryType: 'ShoulderAccessory'
        },
        {
          name: 'Front',
          displayName: 'Front',
          id: 45,
          type: 'AssetType',
          categoryType: 'FrontAccessory'
        },
        {
          name: 'Back',
          displayName: 'Back',
          id: 46,
          type: 'AssetType',
          categoryType: 'BackAccessory'
        },
        {
          name: 'Waist',
          displayName: 'Waist',
          id: 47,
          type: 'AssetType',
          categoryType: 'WaistAccessory'
        },
        {
          name: 'Gear',
          displayName: 'Gear',
          id: 19,
          type: 'AssetType',
          categoryType: 'Gear'
        }
      ]
    },
    {
      name: 'Classic Clothing',
      displayName: 'Classic Clothing',
      categoryType: 'ClassicClothing',
      items: [
        {
          name: 'Classic T-shirts',
          displayName: 'Classic T-shirts',
          id: 2,
          type: 'AssetType',
          categoryType: 'TShirt'
        },
        {
          name: 'Classic Shirts',
          displayName: 'Classic Shirts',
          id: 11,
          type: 'AssetType',
          categoryType: 'Shirt'
        },
        {
          name: 'Classic Pants',
          displayName: 'Classic Pants',
          id: 12,
          type: 'AssetType',
          categoryType: 'Pants'
        }
      ]
    },
    {
      name: 'Hair Accessories',
      displayName: 'Hair',
      categoryType: 'HairAccessory',
      items: [
        {
          name: 'Hair',
          displayName: 'Hair',
          id: 41,
          type: 'AssetType',
          categoryType: 'HairAccessory'
        }
      ]
    },
    {
      name: 'Tops',
      displayName: 'Tops',
      categoryType: 'Tops',
      items: [
        {
          name: 'T-shirts',
          displayName: 'T-shirts',
          id: 64,
          type: 'AssetType',
          categoryType: 'TShirtAccessory'
        },
        {
          name: 'Shirts',
          displayName: 'Shirts',
          id: 65,
          type: 'AssetType',
          categoryType: 'ShirtAccessory'
        },
        {
          name: 'Sweaters',
          displayName: 'Sweaters',
          id: 68,
          type: 'AssetType',
          categoryType: 'SweaterAccessory'
        },
        {
          name: 'Jackets',
          displayName: 'Jackets',
          id: 67,
          type: 'AssetType',
          categoryType: 'JacketAccessory'
        }
      ]
    },
    {
      name: 'Bottoms',
      displayName: 'Bottoms',
      categoryType: 'Bottoms',
      items: [
        {
          name: 'Pants',
          displayName: 'Pants',
          id: 66,
          type: 'AssetType',
          categoryType: 'PantsAccessory'
        },
        {
          name: 'Shorts',
          displayName: 'Shorts',
          id: 69,
          type: 'AssetType',
          categoryType: 'ShortsAccessory'
        },
        {
          name: 'Skirts',
          displayName: 'Skirts',
          id: 72,
          type: 'AssetType',
          categoryType: 'SkirtsAccessory'
        }
      ]
    },
    {
      name: 'Shoes',
      displayName: 'Shoes',
      categoryType: 'Shoes',
      items: [
        {
          name: 'Left Shoe',
          displayName: 'Left Shoe',
          id: 70,
          type: 'AssetType',
          categoryType: 'LeftShoeAccessory'
        },
        {
          name: 'Right Shoe',
          displayName: 'Right Shoe',
          id: 71,
          type: 'AssetType',
          categoryType: 'RightShoeAccessory'
        }
      ]
    },
    {
      name: 'Emote Animations',
      displayName: 'Emotes',
      categoryType: 'EmoteAnimation',
      items: [
        {
          name: 'Emotes',
          displayName: 'Emotes',
          id: 61,
          type: 'AssetType',
          categoryType: 'EmoteAnimation'
        }
      ]
    },
    {
      name: 'Places',
      displayName: 'Places',
      categoryType: 'Place',
      items: [
        {
          name: 'Places',
          displayName: 'Places',
          id: 9,
          type: 'AssetType',
          categoryType: 'Place'
        }
      ]
    },
    {
      name: 'Badges',
      displayName: 'Badges',
      categoryType: 'Badge',
      items: [
        {
          name: 'Badges',
          displayName: 'Badges',
          id: 21,
          type: 'AssetType',
          categoryType: 'Badge'
        }
      ]
    },
    {
      name: 'Game Passes',
      displayName: 'Passes',
      categoryType: 'GamePass',
      items: [
        {
          name: 'Passes',
          displayName: 'Passes',
          id: 34,
          type: 'AssetType',
          categoryType: 'GamePass'
        }
      ]
    },
    {
      name: 'Avatar Animations',
      displayName: 'Avatar Animations',
      categoryType: 'AvatarAnimations',
      items: [
        {
          name: 'Run',
          displayName: 'Run',
          id: 53,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Walk',
          displayName: 'Walk',
          id: 55,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Fall',
          displayName: 'Fall',
          id: 50,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Jump',
          displayName: 'Jump',
          id: 52,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Idle',
          displayName: 'Idle',
          id: 51,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Swim',
          displayName: 'Swim',
          id: 54,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        },
        {
          name: 'Climb',
          displayName: 'Climb',
          id: 48,
          type: 'AssetType',
          categoryType: 'AvatarAnimations'
        }
      ]
    }
  ]
};

assetsExplorerModule.constant('assetsConstants', assetsConstants);
export default assetsConstants;
