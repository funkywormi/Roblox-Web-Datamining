const itemDetailsLimitedInventoryConstants = {
  itemTypeConstants: {
    asset: "asset",
    bundle: "bundle",
  },
  batchBuyPurchaseResults: {
    success: "Success",
    alreadyOwned: "AlreadyOwned",
    insufficientFunds: "InsufficientFunds",
    exceptionOccured: "ExceptionOccurred",
    tooManyPurchases: "TooManyPurchases",
  },
  limited: "Limited",
  numberOfItemsToRecommend: 5,
  itemDetailsLimitedInventoryEventName: "item-details-limited-inventory:render",
  itemDetailsLimitedInventoryElementName: "item-details-limited-inventory-container",
  marketplaceFeePercentage: 0.3,
  robloxCreatedlimited2MarketplaceFeePercentage: 0.3,
  limited2MarketplaceFeePercentage: 0.5,
  marketplaceFeeMinimum: 1,
  // A dropped digit puts the price at 10% of what the seller meant, so anything at or
  // above half of RAP is treated as deliberate undercutting rather than a typo.
  belowAveragePriceWarningRatio: 0.5,
};

export type TItemDetailsLimitedInventoryEventOptions = {
  targetId: number;
  isBundle: boolean;
};

export default itemDetailsLimitedInventoryConstants;
