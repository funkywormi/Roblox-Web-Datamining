export enum PrivateServerEventType {
  PRIVATE_SERVER_JOIN = "privateServerJoin",
  PRIVATE_SERVER_LOAD = "privateServerLoad",
  PRIVATE_SERVER_PLUS_UPSELL = "privateServerPlusUpsell",
  PRIVATE_SERVER_CONFIG = "privateServerConfig",
}

export enum PrivateServerEventContext {
  GAME_TAB = "gameTab",
  PLUS_UPSELL_FREE_WITH_PLUS_CLICK = "plusUpsellFreeWithPlusClick",
  PLUS_UPSELL_SUBSCRIBE_BANNER_CLICK = "plusUpsellSubscribeBannerClick",
  PLUS_UPSELL_SUBSCRIBE_SHEET_CLICK = "plusUpsellSubscribeSheetClick",
  PLUS_UPSELL_SHEET_DISMISS = "plusUpsellSheetDismiss",
}
