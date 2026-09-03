export enum ContentControls {
  AllAges = "AllAges",
  NinePlus = "NinePlus",
  ThirteenPlus = "ThirteenPlus",
  SeventeenPlus = "SeventeenPlus",
  EighteenPlus = "EighteenPlus",
}

export enum PhoneNumberDiscoverability {
  Discoverable = "Discoverable",
  NotDiscoverable = "NotDiscoverable",
}

export enum Theme {
  Light = "Light",
  Dark = "Dark",
}

export enum AccountTheme {
  Default = "Default",
  Amethyst = "Amethyst",
  Emerald = "Emerald",
  Peridot = "Peridot",
  Rose = "Rose",
  Ruby = "Ruby",
  CosmicDust = "CosmicDust",
  PolarFreeze = "PolarFreeze",
  SuperCharge = "SuperCharge",
  ElectricLime = "ElectricLime",
  LavaGlow = "LavaGlow",
  StarBurst = "StarBurst",
  PixelPop = "PixelPop",
  NebulaDrift = "NebulaDrift",
  NitroFrost = "NitroFrost",
  CircuitRush = "CircuitRush",
  KineticEnergy = "KineticEnergy",
  InfernoBlast = "InfernoBlast",
  HyperPlum = "HyperPlum",
  QuantumPulse = "QuantumPulse",
}

export enum CommunicationPrivacyLevel {
  AllUsers = "All",
  Friends = "Friends",
  Following = "Following",
  Followers = "Followers",
  NoOne = "NoOne",
  TrustedFriends = "TrustedFriends",
}

export enum UserPrivacyLevel {
  AllUsers = "AllUsers",
  Friends = "Friends",
  FriendsAndFollowing = "FriendsAndFollowing",
  FriendsFollowingAndFollowers = "FriendsFollowingAndFollowers",
  NoOne = "NoOne",
  TrustedFriends = "TrustedFriends",
}

export enum SpendNotificationSetting {
  Default = "NotificationsOnlyOnThresholdPassed",
  AllNotifications = "NotificationsEveryAmountSpent",
  NotificationsOff = "NotificationsOff",
}

export enum UpdateFriendsAboutMyActivitySettingValue {
  Yes = "Yes",
  No = "No",
}

export enum EnabledStatusValue {
  Enabled = "Enabled",
  Disabled = "Disabled",
}

export enum AllowedStatusValue {
  Allowed = "Allowed",
  Disallowed = "Disallowed",
}

export enum CrossAgeGroupCollaborationValue {
  OlderAgeGroupsAllowed = "OlderAgeGroupsAllowed",
  SimilarAgeGroupsOnly = "SimilarAgeGroupsOnly",
  SimilarOrTrustedConnections = "SimilarOrTrustedConnections",
  NoOne = "NoOne",
}

export enum PartySettingsValue {
  AllConnections = "AllConnections",
  TrustedConnectionsOnly = "TrustedConnectionsOnly",
  NoOne = "NoOne",
}

export enum UserSetting {
  contentAgeRestriction = "contentAgeRestriction",
  phoneNumberDiscoverability = "phoneNumberDiscoverability",
  whoCanChatWithMeInApp = "whoCanChatWithMeInApp",
  whoCanJoinMeInExperiences = "whoCanJoinMeInExperiences",
  whoCanSeeMyInventory = "whoCanSeeMyInventory",
  whoCanTradeWithMe = "whoCanTradeWithMe",
  themeType = "themeType",
  accountTheme = "accountTheme",
  canUploadContacts = "canUploadContacts",
  updateFriendsAboutMyActivity = "updateFriendsAboutMyActivity",
  privateServerPrivacy = "privateServerPrivacy",
  allowSellShareData = "allowSellShareData",
  allowPersonalizedAdvertising = "allowPersonalizedAdvertising",
  monthlySpendLimit = "monthlySpendLimit",
  spendNotifications = "spendNotifications",
  monthlySpendLimitCurrencyCode = "monthlySpendLimitCurrencyCode",
  monthlySpendLimitNotificationType = "monthlySpendLimitNotificationType",
  enablePurchases = "enablePurchases",
  whoCanGroupChatWithMeInApp = "whoCanGroupChatWithMeInApp",
  whoCanWhisperChatWithMeInExperiences = "whoCanWhisperChatWithMeInExperiences",
  whoCanChatWithMeInExperiences = "whoCanChatWithMeInExperiences",
  dailyScreenTimeLimit = "dailyScreenTimeLimit",
  whoCanSeeMySocialNetworks = "whoCanSeeMySocialNetworks",
  allowThirdPartyAppPermissions = "allowThirdPartyAppPermissions",
  allowEnablePushNotifications = "allowEnablePushNotifications",
  allowEnableEmailNotifications = "allowEnableEmailNotifications",
  allowEnableGroupNotifications = "allowEnableGroupNotifications",
  allowEnableExperienceNotifications = "allowEnableExperienceNotifications",
  allowVoiceDataUsage = "allowVoiceDataUsage",
  whoCanOneOnOnePartyWithMe = "whoCanOneOnOnePartyWithMe",
  whoCanGroupPartyWithMe = "whoCanGroupPartyWithMe",
  doNotDisturb = "doNotDisturb",
  doNotDisturbTimeWindow = "doNotDisturbTimeWindow",
  whoCanSeeMyOnlineStatus = "whoCanSeeMyOnlineStatus",
  allowSensitiveIssues = "allowSensitiveIssues",
  allowMarketingEmailNotifications = "allowMarketingEmailNotifications",
  AllowPromotionalOffersNotifications = "AllowPromotionalOffersNotifications",
  allowCrossAgeGroupStudioCollaboration = "allowCrossAgeGroupStudioCollaboration",
  allowFacialAgeEstimation = "allowFacialAgeEstimation",
  whoCanPartyWithMe = "whoCanPartyWithMe",
  whoCanUsePartyChatWithMe = "whoCanUsePartyChatWithMe",
  whoCanUsePartyVoiceWithMe = "whoCanUsePartyVoiceWithMe",

  // Note: This is a V2 setting and not supported in the V1 Contracts.
  aggregatedDesktopNotifications = "aggregatedDesktopNotifications",
  allowPresetChat = "allowPresetChat",
}

// The type of a given option for a setting
export enum OptionType {
  Value = "Value", // The option is a value from an enum
  Integer = "Integer", // The option is an integer
}

// The type of requirement for a given option for a setting
export enum RequirementType {
  /**
   * This option is currently selected
   */
  None = "None",

  /**
   * Needs parental consent to have this option
   */
  ParentalConsent = "ParentalConsent",

  /**
   * User is free to update to this option without any restrictions
   */
  SelfUpdateSetting = "SelfUpdateSetting",

  /**
   * Needs to perform age verification to have this option
   */
  ContentAgeRestrictionVerification = "ContentAgeRestrictionVerification",

  /**
   * Needs FAE to have this option
   */
  FacialAgeEstimation = "FacialAgeEstimation",

  /**
   * Needs IDV to have this option
   */
  IdVerification = "IdVerification",

  /**
   * Needs VPC to enable FAE to have this option
   */
  VpcForFae = "VpcForFae",

  /**
   * This option requires the resolution of a pending downage
   */
  AgeCheckPending = "AgeCheckPending",

  /**
   * This option is blocked due to inherited setting restriction and parental consent
   */
  ParentConsentInherited = "ParentConsentInherited",

  /**
   * This option is blocked due to inherited setting restriction
   */
  Inherited = "Inherited",

  /**
   * The setting is visible but cannot be changed by the user
   */
  ReadableButNotActionable = "ReadableButNotActionable",
}
