const complimentaryItemRecommendationsConstants = {
  itemTypeConstants: {
    asset: 'asset',
    bundle: 'bundle'
  },
  batchBuyPurchaseResults: {
    success: 'Success',
    alreadyOwned: 'AlreadyOwned',
    insufficientFunds: 'InsufficientFunds',
    exceptionOccured: 'ExceptionOccurred',
    tooManyPurchases: 'TooManyPurchases'
  },
  limited: 'Limited',
  numberOfItemsToRecommend: 5,
  totalNumberOfRecommendations: 140,
  complimentaryItemRecommendationsEventName: 'complimentary-items:render',
  complimentaryItemElementName: 'complimentary-items-recommendations-container'
};

export type TComplimentaryItemsEventOptions = {
  targetId: number;
  isBundle: boolean;
  displayPurchaseButtonLeft: boolean;
};

export default complimentaryItemRecommendationsConstants;
