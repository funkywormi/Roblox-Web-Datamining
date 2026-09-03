// Sort alphabetically when adding new tags.
enum ApiCacheTag {
  AccountCountry = "AccountCountry",
  ApprovedExperiences = "ApprovedExperiences",
  AccountLocale = "AccountLocale",
  AccountInfo = "AccountInfo",
  AccountInfoAgeVerificationPolicy = "AccountInfoAgeVerificationPolicy",
  Birthdate = "Birthdate",
  BlockedUsers = "BlockedUsers",
  ChildrenInfo = "ChildrenInfo",
  Contacts = "Contacts",
  Gender = "Gender",
  OAuthorizations = "OAuthorizations",
  ParentInfo = "ParentInfo",
  Phone = "Phone",
  PromotionChannels = "PromotionChannels",
  UndoAgeVerificationEligibility = "UndoAgeVerificationEligibility",
  UserSettings = "UserSettings",
  UserSettingsAndOptions = "UserSettingsAndOptions",
  VerifiedAge = "VerifiedAge",
  VoiceSettings = "VoiceSettings",
  Games = "Games",
  AgeGroup = "AgeGroup",

  // Cache tag types - not to be used directly as cache tags, but instead associated with an id
  ChildFriendsType = "ChildFriendsType",
  ChildSettingsType = "ChildSettingsType",
  ParentalConsentsType = "ParentalConsentsType",
  ParentLinkSettings = "ParentLinkSettings",
  SpendControls = "SpendControls",
  ExperienceSearch = "ExperienceSearch",
  BlockedExperiences = "BlockedExperiences",
}

export default ApiCacheTag;
