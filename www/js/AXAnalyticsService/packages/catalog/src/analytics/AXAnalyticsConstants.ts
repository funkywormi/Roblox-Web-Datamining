import type { AXAnalyticsConstantsType } from "./types";

const CatalogTrackingConstants: AXAnalyticsConstantsType = {
  CatalogView: "CatalogView",
};

const CatalogSearchTrackingConstants: AXAnalyticsConstantsType = {
  CatalogSearchView: "CatalogSearchView",
};

const CatalogFilterTrackingConstants: AXAnalyticsConstantsType = {
  CatalogFiltersApplied: "CatalogFiltersApplied",
};

const CatalogSearchFilterTrackingConstants: AXAnalyticsConstantsType = {
  CatalogSearchFiltersApplied: "CatalogSearchFiltersApplied",
};

const AvatarEditorTrackingConstants: AXAnalyticsConstantsType = {
  AvatarEditorView: "AvatarEditorView",
  AvatarEditorChangeAvatar: "AvatarEditorChangeAvatar",
  AvatarEditorReactMigrationEnabled: "AvatarEditorReactMigrationEnabled",
  AvatarEditorReactMigrationControlGroup: "AvatarEditorReactMigrationControlGroup",
};

// Avatar editor (Customize page) user interaction events. These are emitted by
// the avatar component, which keeps a local copy of the string values so it does
// not depend on this external being redeployed. Keep both in sync.
const AvatarEditorInteractionTrackingConstants: AXAnalyticsConstantsType = {
  // Fired once per session, the first time the user edits their avatar.
  AvatarEditorFirstEditClick: "AvatarEditorFirstEditClick",
  // Fired on every avatar edit (equip, body color, scale, type, emote, ...).
  AvatarEditorEditClick: "AvatarEditorEditClick",
  AvatarEditorEquipClick: "AvatarEditorEquipClick",
  AvatarEditorUnequipClick: "AvatarEditorUnequipClick",
  AvatarEditorBodyColorChangeClick: "AvatarEditorBodyColorChangeClick",
  AvatarEditorScaleChangeClick: "AvatarEditorScaleChangeClick",
  AvatarEditorTypeChangeClick: "AvatarEditorTypeChangeClick",
  AvatarEditorAdvancedEditorClick: "AvatarEditorAdvancedEditorClick",
  AvatarEditorEmoteChangeClick: "AvatarEditorEmoteChangeClick",
  AvatarEditorRecommendationClick: "AvatarEditorRecommendationClick",
  AvatarEditorGetMoreClick: "AvatarEditorGetMoreClick",
  AvatarEditorOutfitCreatedClick: "AvatarEditorOutfitCreatedClick",
  AvatarEditorOutfitDeletedClick: "AvatarEditorOutfitDeletedClick",
  AvatarEditorOutfitEditedClick: "AvatarEditorOutfitEditedClick",
};

const CatalogItemDetailsTrackingConstants: AXAnalyticsConstantsType = {
  CatalogItemDetailsView: "CatalogItemDetailsView",
  CatalogLookDetailsView: "CatalogLookDetailsView",
  PurchaseSuccessAsset: "PurchaseSuccessAsset",
  PurchaseSuccessBundle: "PurchaseSuccessBundle",
  PurchaseSuccess: "PurchaseSuccess",
  PurchaseSuccessShoppingCart: "PurchaseSuccessShoppingCart",
  PurchaseErrorShoppingCart: "PurchaseErrorShoppingCart",
  PurchaseSuccessLook: "PurchaseSuccessLook",
  PurchaseSuccessDirectResale: "PurchaseSuccessDirectResale",
  // Fired when a user purchases a timed option (days > 0) for an item they
  // already own or already have (expiring) timed access to.
  PurchaseSuccessTimedOptionRepurchase: "PurchaseSuccessTimedOptionRepurchase",
};

const WebCatalogRevampCounters: AXAnalyticsConstantsType = {
  CatalogRevampEnabledWithRobuxInThumbnail: "CatalogRevampEnabledWithRobuxInThumbnail",
  CatalogRevampEnabledWithoutRobuxInThumbnail: "CatalogRevampEnabledWithoutRobuxInThumbnail",
  CatalogRevampControlGroup: "CatalogRevampControlGroup",
};

// Catalog user-interaction click events. The specific source/component and
// item/filter details are passed through the telemetry `metaData` field (JSON
// string) so a single counter can be sliced by source in telemetry, e.g.
// { source: "Catalog", itemId, itemType } for ItemCardClick.
const CatalogInteractionTrackingConstants: AXAnalyticsConstantsType = {
  // Fired when the user clicks an item card. `source` distinguishes where the
  // card was rendered (Catalog grid, item-details recommendations, bundle
  // contents, complimentary recommendations, look details, ...).
  ItemCardClick: "ItemCardClick",
  // Fired when the user changes any catalog filter. `filterType` + `value` in
  // metadata; `isSearch` indicates the filter was applied on a search results
  // page vs the plain catalog.
  CatalogFilterClick: "CatalogFilterClick",
  // Fired when the user submits a catalog search (search bar, enter, or
  // autocomplete suggestion).
  CatalogSearchClick: "CatalogSearchClick",
  // Fired when the user loads another page of results (infinite scroll or the
  // explicit "load more" button, distinguished by `mode` in metadata).
  CatalogPaginationClick: "CatalogPaginationClick",
  // Shopping cart interactions. Add/remove include a `source` (catalog item
  // card, item details page, look details, cart modal).
  ShoppingCartAddClick: "ShoppingCartAddClick",
  ShoppingCartRemoveClick: "ShoppingCartRemoveClick",
  ShoppingCartOpenClick: "ShoppingCartOpenClick",
  ShoppingCartCloseClick: "ShoppingCartCloseClick",
  // Fired when the user clicks a purchase/buy button (before confirmation).
  // `source` distinguishes the surface (item details page, shopping cart, look
  // details, current wearing, direct resale). Successful purchases are captured
  // by the existing PurchaseSuccess* events.
  PurchaseButtonClick: "PurchaseButtonClick",
};

// Trades webapp funnel + engagement events. The Trades webapp (legacy Angular)
// keeps a local copy of these string values in `tradeEventsService`, so it does
// not depend on this external being redeployed. Keep both in sync. Trade value
// dimensions (totalValueOffered, totalValueRequested, robux, per-item values)
// and a `context` are passed through the telemetry `metaData` field (JSON string).
const TradesTrackingConstants: AXAnalyticsConstantsType = {
  // Fired on trade page navigation (inbound, outbound, completed, inactive).
  TradePageView: "tradePageView",
  // Fired when a new trade request is sent (not a counter).
  TradeInitiated: "tradeInitiated",
  // Fired when the current user accepts a trade.
  TradeCompleted: "tradeCompleted",
  // Fired when the current user declines an inbound trade.
  TradeDeclined: "tradeDeclined",
  // Fired when the current user cancels their own outbound trade.
  TradeCanceled: "tradeCanceled",
  // Fired when the current user sends a counter to an existing trade.
  TradeCountered: "tradeCountered",
  // Fired when the current user opens a trade's full detail.
  TradeViewed: "tradeViewed",
  // Fired once per user on their first visit to the trade center list.
  // metaData carries `ownsLimiteds` and `entrySource` for the first-time
  // visitor funnel.
  TradeCenterFirstVisit: "tradeCenterFirstVisit",
  // Filter interactions. metaData `filterType` (statusTab | tradeQuality |
  // inventoryCategory) + `value` so a single counter slices every filter.
  TradeFilterClick: "tradeFilterClick",
  // "How do I trade" help-link clicks.
  TradeHowToTradeClick: "tradeHowToTradeClick",
  // Dismissing (X) an in-page banner; metaData `banner` identifies which one.
  TradeBannerDismiss: "tradeBannerDismiss",
  // Clicking through to a trade partner's profile; metaData `tradeStatusType`
  // + `source` (listRow | detailHeader).
  TradeProfileClick: "tradeProfileClick",
};

const AXAnalyticsConstants: AXAnalyticsConstantsType = {
  ...CatalogTrackingConstants,
  ...CatalogSearchTrackingConstants,
  ...CatalogFilterTrackingConstants,
  ...CatalogSearchFilterTrackingConstants,
  ...AvatarEditorTrackingConstants,
  ...AvatarEditorInteractionTrackingConstants,
  ...CatalogItemDetailsTrackingConstants,
  ...WebCatalogRevampCounters,
  ...CatalogInteractionTrackingConstants,
  ...TradesTrackingConstants,
};

export default AXAnalyticsConstants;
