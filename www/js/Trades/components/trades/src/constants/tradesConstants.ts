import environmentUrls from "@rbx/environment-urls";
import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { TradeQualityType, TradeStatus, TradeStatusType } from "../types";

// TypeScript port of js/angular/trades/constants/tradesConstants.js, limited to
// the values used by the trades list feature.
const tradesConstants = {
  states: {
    tradesList: "trades-list",
    tradeWithUser: "trade-with-user",
    counterTrade: "counter-trade",
  },
  urls: {
    tradesApi: environmentUrls.tradesApi,
    inventoryApi: environmentUrls.inventoryApi,
    usersApi: environmentUrls.usersApi,
    privacySettings: getAbsoluteUrl("/my/account#!/privacy"),
    settings: getAbsoluteUrl("/my/account#!/security"),
    membership: getAbsoluteUrl("/premium/membership"),
    // Marketplace narrowed to Roblox-created Limiteds, since those are the only
    // tradable items.
    limitedsCatalog: getAbsoluteUrl("/catalog?Category=1&salesTypeFilter=2&CreatorName=Roblox"),
    badRequest: getAbsoluteUrl("/request-error?code=400"),
    forbidden: getAbsoluteUrl("/request-error?code=403"),
    get2SVConfiguration: `${environmentUrls.twoStepVerificationApi}/v1/users/{userId}/configuration`,
    generate: `${environmentUrls.tradesApi}/v1/trade-friction/two-step-verification/generate`,
    redeem: `${environmentUrls.tradesApi}/v1/trade-friction/two-step-verification/redeem`,
    getSettings: `${environmentUrls.apiGatewayUrl}/user-settings-api/v1/user-settings`,
    setTradeQuality: `${environmentUrls.apiGatewayUrl}/user-settings-api/v1/user-settings`,
  },
  tradeStatusType: {
    inbound: "Inbound",
    outbound: "Outbound",
    inactive: "Inactive",
    completed: "Completed",
  } satisfies Record<string, TradeStatusType>,
  tradeQualityType: {
    none: "None",
    low: "Low",
    medium: "Medium",
    high: "High",
  } satisfies Record<string, TradeQualityType>,
  tradeStatus: {
    unknown: "Unknown",
    open: "Open",
    pending: "Pending",
    completed: "Completed",
    expired: "Expired",
    declined: "Declined",
    rejectedDueToError: "RejectedDueToError",
    countered: "Countered",
    processing: "Processing",
    interventionRequired: "InterventionRequired",
  } as Record<string, TradeStatus>,
  tradeErrors: {
    invalidTrade: 2,
    inactiveTrade: 3,
    unauthorized: 4,
    tradeSystemUnavailable: 5,
    needsConfirmation: 6,
    userCannotTrade: 7,
    invalidPartner: 10,
    invalidUserAssets: 12,
    tradeUnbalanced: 15,
    tradeQualityInsufficient: 16,
    insufficientRobux: 17,
    tooManyRobux: 18,
    cannotTradeWithSelf: 21,
    userPrivacyTooStrict: 22,
    tradeFrictionEncountered: 23,
    // The trade asks a partner without Plus to send Robux. The locked partner
    // field heads this off, so this is the backstop for a draft built before
    // eligibility landed or changed underneath it.
    robuxRequiresPlus: 30,
  },
  tradeEligibility: {
    legalOrRegulatoryRestrictions: "IneligibleLegalOrRegulatoryRestrictions",
    ageCheckRequired: "IneligibleAgeCheckRequired",
    freeTradesLimitReached: "IneligibleFreeTradesLimitReached",
  },
  freeTradesWindow: {
    month: "Month",
  },
  // When the free-trade allowance promotion stops running. Spelled out with a
  // time so it parses as local midnight — a bare "2026-12-31" is UTC midnight
  // and would render as Dec 30 anywhere west of Greenwich.
  freeTradesEndDate: "2026-12-31T00:00:00",
  // Per-user localStorage key prefix for the Plus upsell card dismiss. The
  // user id is appended so a shared device does not hide the card for someone
  // who never closed it. Same pattern as catalog marketplace-offer banners.
  freeTradesUpsellStorageKey: "Roblox.Trades.FreeTradesUpsell",
  canTradeWithStatus: {
    canTrade: "CanTrade",
    senderCannotTrade: "SenderCannotTrade",
    senderAgeCheckRequired: "SenderAgeCheckRequired",
    cannotTradeWithSelf: "CannotTradeWithSelf",
    unknownError: "UnknownError",
  },
  invalidUserAssetReason: {
    doesNotExist: "DoesNotExist",
    notOwned: "NotOwned",
    recipientNeedsMembership: "RecipientNeedsMembership",
    contentRatingRestricted: "ContentRatingRestricted",
    recipientNeedsHigherMembershipType: "RecipientNeedsHigherMembershipType",
    notTradeable: "NotTradeable",
  } as Record<string, string>,
  tradesVisiblePerPage: 10,
  tradesLoadedPerPage: 25,
  maxItemsPerSide: 4,
  getTradableItemsLimit: 50,
  // Trade system may hold traded items for up to this long before they land in
  // the recipient's inventory.
  holdingPeriodDays: 2,
  minRobux: 0,
  maxRobux: 10000000,
  maxRobuxAsPercentOfValue: 50,
  minValueRatio: "50%",
  // Inventory category filter options (mirrors inventoryController.layout.filters).
  // Empty value means "All Categories" (no itemTargetTypes query param).
  inventoryFilters: [
    { labelKey: "Label.AllCategories", value: "" },
    { labelKey: "Label.HatAccessories", value: "HatAccessory" },
    { labelKey: "Label.HairAccessories", value: "HairAccessory" },
    { labelKey: "Label.FaceAccessories", value: "FaceAccessory" },
    { labelKey: "Label.NeckAccessories", value: "NeckAccessory" },
    { labelKey: "Label.ShoulderAccessories", value: "ShoulderAccessory" },
    { labelKey: "Label.FrontAccessories", value: "FrontAccessory" },
    { labelKey: "Label.BackAccessories", value: "BackAccessory" },
    { labelKey: "Label.WaistAccessories", value: "WaistAccessory" },
    { labelKey: "Label.Gear", value: "Gear" },
    { labelKey: "Label.Faces", value: "Face" },
    { labelKey: "Label.JacketAccessory", value: "JacketAccessory" },
    { labelKey: "Label.SweaterAccessory", value: "SweaterAccessory" },
    { labelKey: "Label.DressSkirtAccessory", value: "DressSkirtAccessory" },
    { labelKey: "Label.Characters", value: "Character" },
    { labelKey: "Label.Heads", value: "DynamicHead" },
    { labelKey: "Label.Shoes", value: "Shoes" },
    { labelKey: "Label.Animations", value: "Animation" },
  ] as { labelKey: string; value: string }[],
  // Inventory item-name search: how long typing pauses before we refetch, and
  // the longest query we send (item names are capped well below this).
  inventorySearchDebounceMs: 500,
  inventorySearchMaxLength: 100,
  tradesList: {
    scrollBarLazyLoadDistancePx: 200,
  },
  economicRestrictionsViolationLabels: {
    FraudPaymentAuthorizationAttempt: "Label.Sublabel.FraudPaymentAbuse",
    FraudVirtualEconomyAbuse: "Label.Sublabel.FraudVirtualEconomyAbuse",
    FraudAbuseOfAffiliateSystem: "Label.Sublabel.FraudAbuseOfTheAffiliateSystem",
    FraudAttemptedUnauthorizedPaymentMethodUse:
      "Label.Sublabel.FraudAttemptedUnauthorizedPaymentMethodUse",
    FraudRepeatedRefundRequests: "Label.Sublabel.FraudRepeatedRefundRequests",
    FraudSuspiciousRefundRequests: "Label.Sublabel.FraudSuspiciousRefundRequests",
    FraudUnauthorizedPurchase: "Label.Sublabel.FraudUnauthorizedPurchase",
    FraudUseOfUnauthorizedOffPlatformTransactions:
      "Label.Sublabel.FraudUseOfUnauthorizedOffPlatformTransactions",
    FraudUseOfUnauthorizedPaymentMethod: "Label.Sublabel.FraudUseOfUnauthorizedPaymentMethod",
    FraudSuspiciousAccountPatterns: "Label.Sublabel.FraudSuspiciousAccountPatterns",
    FraudChargeback: "Label.AbuseType.Chargeback",
  } as Record<string, string>,
};

export default tradesConstants;
