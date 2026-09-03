export enum PrivacySettingName {
  // Content Restrictions
  ContentMaturity = "ContentMaturity",
  BlockedExperiences = "BlockedExperiences",
  BlockedExperiencesSearch = "BlockedExperiencesSearch",
  ApprovedExperiences = "ApprovedExperiences",
  SensitiveIssues = "SensitiveIssues",

  // Visibility & Private Servers
  PrivateServerPrivacy = "PrivateServerPrivacy",
  WhoCanJoinMeInExperiences = "WhoCanJoinMeInExperiences",
  UpdateFriendsAboutMyActivity = "UpdateFriendsAboutMyActivity",

  // Friends & Contacts
  ContactImport = "ContactImport",

  // Trade & Inventory
  WhoCanTradeWithMe = "WhoCanTradeWithMe",
  WhoCanSeeMyInventory = "WhoCanSeeMyInventory",

  // Ad preferences
  AdPreferences = "AdPreferences",

  // Blocked Users
  BlockedUsers = "BlockedUsers",

  // Account Deactivation & Deletion
  AccountDeactivationAndDeletion = "AccountDeactivationAndDeletion",
  AccountDataDeactivationAndDeletion = "AccountDataDeactivationAndDeletion",

  // Screentime
  Screentime = "Screentime",
  PerExperienceScreentime = "PerExperienceScreentime",
}

export default PrivacySettingName;
