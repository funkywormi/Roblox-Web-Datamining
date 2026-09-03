// Metric event names emitted by the Roblox+ landing page. Pair these with
// publishMetric (./publishMetric) to fire Prometheus counters. We intentionally
// do NOT route through the legacy EventTracker.fireEvent path here — new
// instrumentation lives only on the Prometheus pipeline.
export enum Event {
  LIST_AVAILABLE_PRODUCTS_FAILED = "ListAvailableProductsFailed",
  LIST_AVAILABLE_PRODUCTS_EMPTY = "ListAvailableProductsEmpty",
  LIST_SUBSCRIPTIONS_FAILED = "ListSubscriptionsFailed",
  GET_USER_BENEFITS_FAILED = "GetUserBenefitsFailed",
  GUAC_APP_POLICY_FAILED = "GuacAppPolicyFailed",
  MEMBERSHIP_POLLING_TIMEOUT = "MembershipPollingTimeout",
  PURCHASE_VIEW_SHOWN = "PurchaseViewShown",
  PURCHASE_VIEW_OPEN_SHEET_CLICK = "PurchaseViewOpenSheetClick",
  BUNDLE_PICKER_SHEET_OPENED = "BundlePickerSheetOpened",
  BUNDLE_PICKER_TIER_SELECTED = "BundlePickerTierSelected",
  BUNDLE_PICKER_SUBSCRIBE_CLICK = "BundlePickerSubscribeClick",
  BUNDLE_PICKER_ROW_MISSING_ROBUX_ALLOWANCE = "BundlePickerRowMissingRobuxAllowance",
  BUNDLE_PICKER_ROW_MISSING_STRIKETHROUGH_PRICE = "BundlePickerRowMissingStrikethroughPrice",
  MISSING_FEATURE_CONFIG = "MissingFeatureConfig",
}
