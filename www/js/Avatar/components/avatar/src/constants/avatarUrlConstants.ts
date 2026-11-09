const avatarUrlConstants = {
  www: {
    avatarThumbnail: "/avatar-thumbnail/json?width=352&height=352&format=png&userId=",
    assetThumbnail: "/asset-thumbnail/json?width=150&height=150&format=png&assetId=",
    outfitThumbnail: "/outfit-thumbnail/json?width=150&height=150&format=png&userOutfitId=",
    inventoryJson: "/users/inventory/list-json",
    outfitThumbnailJson: "/outfit-thumbnail/json",
    catalog: "/catalog",
    avatar: "/my/avatar",
  },
  avatarApi: {
    getOutfitDetailsUrlV4: "/v4/outfits/{id}/details?checkAssetAvailability=true",
    createOutfitUrlV4: "/v4/outfits/create",
    deleteOutfitUrl: "/v1/outfits/{id}/delete",
    patchOutfitUrlV4: "/v4/outfits/{id}",

    setBodyColorsUrl: "/v1/avatar/set-body-colors",

    updateAvatarUrlV4: "/v4/avatar",

    getAvatarUrlV4: "/v4/avatar",
    getAvatarRulesUrl: "/v1/avatar-rules",
    getAvatarInventoryUrl: "/v1/avatar-inventory",

    wearAssetUrl: "/v1/avatar/assets/{id}/wear",
    removeAssetUrl: "/v1/avatar/assets/{id}/remove",
    redrawThumbnailUrl: "/v1/avatar/redraw-thumbnail",

    getEmotesUrl: "/v1/emotes",

    getMetaData: "/v1/avatar/metadata",
  },
  catalogApi: {
    getCategories: "/v1/categories",
    getSubcategories: "/v1/subcategories",
    postItemDetails: "/v1/catalog/items/details",
    getMetaData: "/v1/catalog/metadata",
  },
  inventoryApi: {
    getInventory: "/v2/users/{userId}/inventory",
    getIsOwned: "/v1/users/{userId}/items/{itemType}/{itemId}/is-owned",
  },
  economyApi: {
    getUserCurrency: "/v1/users/{userId}/currency",
  },
  api: {
    featureAccess:
      "/access-management/v1/feature-access?featureNames=AvatarChange&nameSpace=avatar_marketplace/AvatarMarketPlace",
  },
  modals: {
    openedClass: "modal-open-noscroll",
    outfitName: {
      templateUrl: "outfit-name-modal",
      controllerName: "outfitNameModalController",
    },
    outfitUpdate: {
      templateUrl: "outfit-update-modal",
    },
    advancedAccessories: {
      templateUrl: "advanced-accessories-modal",
      controllerName: "advancedAccessoriesModalController",
    },
    advancedBodyColor: {
      templateUrl: "advanced-body-colors-modal",
      controllerName: "advancedBodyColorsModalController",
    },
    emotes: {
      templateUrl: "emotes-modal",
      controllerName: "emotesModalController",
    },
    bodyTypeWarning: {
      templateUrl: "body-type-warning-modal",
      controllerName: "bodyTypeWarningModalController",
    },
    itemLimitExceeded: {
      templateUrl: "item-limit-exceeded-modal",
      controllerName: "itemLimitExceededModalController",
    },
  },
  templates: {
    avatarBack: "avatar-back",
    avatarBase: "avatar-base",
    avatarEditorTabs: "avatar-editor-tabs",
    avatarScaling: "avatar-scaling",
    avatarTabContentHeader: "avatar-tab-content-header",
    avatarTabContent: "avatar-tab-content",
    avatarItems: "avatar-items-list",
    avatarItemCard: "avatar-item-card",
    emotesItemCard: "emotes-item-card",
    recommendedItems: "recommended-items",
  },
  policyEndpoints: {
    appPolicyName: "app-policy",
  },
};

export default avatarUrlConstants;
