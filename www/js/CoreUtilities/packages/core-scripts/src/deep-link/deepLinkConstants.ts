export type DeepLinkParams = Record<string, string>;

export enum PathPart {
  GameDetails = "game_details",
  Profile = "profile",
  Home = "home",
  Games = "games",
  Avatar = "avatar",
  Catalog = "catalog",
  Friends = "friends",
  ItemDetails = "item_details",
  Navigation = "navigation",
  PlaceId = "placeId",
  UserId = "userId",
  ShareLinks = "share_links",
  Chat = "chat",
  GiftCards = "gift_cards",
  NotificationSettings = "notification_settings",
  AccountInfo = "account_info",
  PrivacySettings = "privacy_settings",
  AppPermissionsSettings = "app_permissions_settings",
  ScreentimeSubsettings = "screentime_subsettings",
  BlockedExperiencesSubsettings = "blocked_experiences_subsettings",
  BlockedUsersSubsettings = "blocked_users_subsettings",
  ExperienceChatSubsettings = "experience_chat_subsettings",
  PartySubsettings = "party_subsettings",
  VoiceSubsettings = "voice_subsettings",
  CommunicationSettings = "communication_settings",
  CommunicationSubsettings = "communication_subsettings",
  TradingInventorySubsettings = "trading_inventory_subsettings",
  PrivateServerSubsettings = "private_server_subsettings",
  FriendsContactsSubsettings = "friends_contacts_subsettings",
  VisibilitySubsettings = "visibility_subsettings",
  ParentalControls = "parental_controls",
  SpendingSettings = "spending_settings",
  Group = "group",
  ExternalWebUrl = "external_web_link",
  SecurityAlert = "security_alert",
  Fae = "fae",
  Messages = "messages",
  BuyRobux = "buy_robux",
  CurrencyTransfer = "currency_transfer",
  ProfileCard = "profile_card",
  AmpWizard = "amp_wizard",
  SupportCenter = "support_center",
  PlusUpsell = "plus_upsell",
}

export enum ItemType {
  Asset = "Asset",
  Bundle = "Bundle",
  Look = "Look",
}

export const AmpFeatureName = {
  Fae: "TriggerAgeVerifyRecourse",
};

export const AmpNamespace = {
  Fae: "social/Upsells",
};

export const ItemTypePathMap: Record<string, string> = {
  [ItemType.Asset]: "/catalog",
  [ItemType.Bundle]: "/bundles",
  [ItemType.Look]: "/looks",
};

export type DeepLink = {
  path: PathPart[];
  params: DeepLinkParams;
  url: string;
};

export const DeepLinkNavigationMap: Record<string, string> = {
  [PathPart.Home]: "/home",
  [PathPart.Games]: "/games",
  [PathPart.Catalog]: "/catalog",
  [PathPart.Friends]: "/users/friends",
  [PathPart.GiftCards]: "/giftcards",
  [PathPart.NotificationSettings]: "/my/account#!/notifications",
  [PathPart.AccountInfo]: "/my/account#!/info",
  [PathPart.PrivacySettings]: "/my/account#!/privacy",
  [PathPart.ParentalControls]: "/my/account#!/parental-controls",
  [PathPart.SpendingSettings]: "/my/account#!/billing",
  [PathPart.AppPermissionsSettings]: "/my/account#!/app-permissions",
  [PathPart.ScreentimeSubsettings]: "/my/account#!/privacy/Screentime",
  [PathPart.BlockedExperiencesSubsettings]:
    "/my/account#!/privacy/ContentRestrictions/BlockedExperiences",
  [PathPart.BlockedUsersSubsettings]: "/my/account#!/privacy/BlockedUsers",
  [PathPart.ExperienceChatSubsettings]: "/my/account#!/privacy/Communication/ExperienceChat",
  [PathPart.PartySubsettings]: "/my/account#!/privacy/Communication/Party",
  [PathPart.VoiceSubsettings]: "/my/account#!/privacy/Communication/Voice",
  [PathPart.CommunicationSettings]: "/my/account#!/privacy/Communication",
  [PathPart.CommunicationSubsettings]: "/my/account#!/privacy/Communication",
  [PathPart.TradingInventorySubsettings]: "/my/account#!/privacy/TradingAndInventory",
  [PathPart.FriendsContactsSubsettings]: "/my/account#!/privacy/FriendsAndContacts",
  [PathPart.PrivateServerSubsettings]:
    "/my/account#!/privacy/VisibilityAndPrivateServers/PrivateServerPrivacy",
  [PathPart.VisibilitySubsettings]: "/my/account#!/privacy/VisibilityAndPrivateServers/Visibility",
  [PathPart.Messages]: "/my/messages/#!/inbox",
  [PathPart.BuyRobux]: "/upgrades/robux",
};

export const UrlPart = {
  Games: "/games",
  Users: "/users",
  Groups: "/groups",
  Profile: "/profile",
  GameStart: "/games/start",
  GiftCards: "/giftcards",
  ExperienceLauncher: "roblox://experiences/start?",
  Asset: "/catalog",
  Bundle: "/bundles",
  Look: "/looks",
  AppLauncher: "roblox://navigation",
  ContentPost: "/content_posts",
  Avatar: "/my/avatar",
  SecurityAlert: "/security-feedback",
  SupportCenter: "/support-center",
  Plus: "/plus",
};

export const buildResolveLinkEvent = (
  linkStatus: string,
  linkId: string,
  linkType: string,
): {
  type: string;
  context: string;
  params: { linkType: string; linkStatus: string; linkId: string };
} => ({
  type: "linkResolved",
  context: "deepLink",
  params: {
    linkType,
    linkStatus,
    linkId,
  },
});

export const CounterEvents = {
  NavigationFailed: "DeeplinkParserNavigationFailed",
  InviteResolutionFailed: "DeeplinkParserInviteResolutionFailed",
  NotificationInviteResolutionFailed: "DeeplinkParserNotificationInviteResolutionFailed",
  FriendRequestResolutionFailed: "DeeplinkParserFriendRequestResolutionFailed",
  ProfileShareResolutionFailed: "DeeplinkParserProfileShareResolutionFailed",
  ScreenshotInviteShareResolutionFailed: "DeeplinkParserScreenshotInviteShareResolutionFailed",
  PrivateServerLinkResolutionFailed: "DeeplinkParserPrivateServerLinkResolutionFailed",
  ExperienceDetailsResolutionFailed: "DeeplinkParserExperienceDetailsResolutionFailed",
  AvatarItemDetailsResolutionFailed: "DeeplinkParserAvatarItemDetailsResolutionFailed",
  ExperienceAffiliateResolutionFailed: "DeeplinkParserExperienceAffiliateResolutionFailed",
  ContentPostResolutionFailed: "DeeplinkParserContentPostResolutionFailed",
  ExperienceEventResolutionFailed: "DeeplinkParserExperienceEventResolutionFailed",
  UserTrustedConnectionResolutionFailed: "DeeplinkParserUserTrustedConnectionResolutionFailed",
  StudioTrustedConnectionResolutionFailed: "DeeplinkParserStudioTrustedConnectionResolutionFailed",
  MomentsResolutionFailed: "DeeplinkParserMomentsResolutionFailed",
  SchoolInviteResolutionFailed: "DeeplinkParserSchoolInviteResolutionFailed",
  RobloxPlusReferralResolutionFailed: "DeeplinkParserRobloxPlusReferralResolutionFailed",
};

export const buildDeepLinkLaunchGameEvent = (
  placeId: string,
  linkId: string,
  linkStatus: string,
): {
  eventName: string;
  ctx: string;
  gamePlayIntentEventCtx: string;
  properties: {
    linkStatus: string;
    linkType: string;
    placeId: string;
    linkId: string;
  };
} => ({
  eventName: "joinGameFromInviteLink",
  ctx: "shareLinks",
  gamePlayIntentEventCtx: "shareLinks",
  properties: {
    linkStatus,
    linkType: "ExperienceInvite",
    placeId,
    linkId,
  },
});
