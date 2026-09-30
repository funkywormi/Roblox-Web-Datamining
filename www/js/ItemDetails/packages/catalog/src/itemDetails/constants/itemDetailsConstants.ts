export const itemDetailsConstants = {
  containerId: "item-details-container",

  itemListEventName: "item-list:render",

  eventIdentifiers: {
    recommendations: "recommendations",
    includedItems: "included-items",
  },

  recommendationsCount: 7,

  animationBundleType: 2,

  // The creator id that cannot be reported.
  robloxCreatorTargetId: 1,

  classicAssetTypes: [2, 11, 12, 18],

  showcaseAllowedAssetTypes: [
    19, 8, 41, 42, 43, 44, 45, 46, 47, 72, 67, 70, 71, 61, 66, 65, 69, 68, 64,
  ],

  errorCodes: {
    itemNotFound: 21,
  },
} as const;

export default itemDetailsConstants;
