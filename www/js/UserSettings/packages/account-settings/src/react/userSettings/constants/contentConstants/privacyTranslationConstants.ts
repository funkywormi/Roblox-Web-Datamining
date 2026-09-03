import SettingCategoryPageName from "../../../../enums/SettingCategoryPageName";
import PrivacySettingName from "../../../../enums/privacy/PrivacySettingName";

export default {
  heading: "Heading.PrivacySettings",

  pageTitles: {
    [SettingCategoryPageName.PrivacySettingCategoriesList]: "Heading.Tab.PrivacyContentMaturity",
    privacyContentRestrictions: "Heading.Tab.PrivacyContentRestrictions", // TODO: Combine with heading above once M2 is rolled out

    [SettingCategoryPageName.ContentRestrictions]: "Heading.ContentRestrictions",
    [PrivacySettingName.ContentMaturity]: "Heading.ContentMaturity",
    [PrivacySettingName.BlockedExperiences]: "Heading.BlockedExperiences",
    [PrivacySettingName.ApprovedExperiences]: "Heading.ApprovedExperiences",
    [PrivacySettingName.SensitiveIssues]: "Label.SensitiveIssues",

    [PrivacySettingName.Screentime]: "Heading.ScreenTime",

    [PrivacySettingName.PerExperienceScreentime]: "Heading.TopGamesThisWeek",

    [SettingCategoryPageName.Communication]: "Heading.Communication",
    [SettingCategoryPageName.ExperienceChat]: "Heading.ExperienceChat",
    [SettingCategoryPageName.Party]: "Label.Party",
    [SettingCategoryPageName.PartyAndPartyChat]: "Heading.PartyAndPartyChat",
    [SettingCategoryPageName.PartyAndPartyChatV2]: "Heading.PartyAndPartyChatV2",
    [SettingCategoryPageName.Voice]: "Heading.VoiceChat",
    [SettingCategoryPageName.Camera]: "Description.CameraInput",
    [SettingCategoryPageName.VoiceDataUsage]: "Heading.VoiceDataUsage",
    [SettingCategoryPageName.StudioCollaboration]: "Heading.StudioCollaboration",
    [SettingCategoryPageName.PresetChat]: "Heading.GameplayCoordination",

    [SettingCategoryPageName.VisibilityAndPrivateServers]: "Heading.VisibilityAndPrivateServers",
    [PrivacySettingName.PrivateServerPrivacy]: "Label.PrivateServers",
    [SettingCategoryPageName.Visibility]: "Heading.Visibility",

    [SettingCategoryPageName.FriendsAndContacts]: "Heading.ConnectionsAndContacts",

    [SettingCategoryPageName.TradingAndInventory]: "Heading.TradingAndInventory",

    [PrivacySettingName.AdPreferences]: "Heading.AdsPreferencesV2",

    [PrivacySettingName.BlockedUsers]: "Heading.BlockedUsersV2",

    [PrivacySettingName.AccountDeactivationAndDeletion]: "Heading.AccountDeactivationAndDeletionV2",
    [PrivacySettingName.AccountDataDeactivationAndDeletion]:
      "Heading.AccountDataDeactivationAndDeletion",

    [SettingCategoryPageName.Notifications]: "Heading.Notifications",

    [SettingCategoryPageName.AgeCheck]: "Heading.AgeCheck",
  },

  // Account Deletion and Deactivation
  privacyRequestsDescription: "Description.PrivacyRequests",
  privacyRequestsDescriptionAddYourEmail: "Description.PrivacyRequestsAddYourEmail",
  exerciseDataRightsTitle: "Heading.ExerciseDataRights",
  exerciseDataRightsField: "Label.AccountDeletion",
  initiateBtnText: "Action.Initiate",
  exerciseDataRightsDescription: "Description.AccountDeletionDescription",
  deactivationAndDeletionTitle: "Heading.AccountDeactivationAndDeletion",
  deactivationTitle: "Heading.AccountDeactivation",
  deactivateBtnText: "Action.Deactivate",
  deactivateDescription: "Description.AccountDeactivationDescription",
  deactivateField: "Label.DeactivateAccount",
  deactivateConfirmationHeading: "Heading.DeactivateAccount",
  deactivateConfirmationBody: "Description.DeactivateConfirmation",
  deleteDescription: "Description.AccountDeletionRequest",
  deleteSuccessMessage: "Heading.AccountDeletionSuccessMessage",
  deleteAccountBtnText: "Action.DeleteAccount",
  deleteMyAccountReceivedHeading: "Label.DeleteAccountReceived",
  deleteMyAccountReceivedBody: "Description.DeleteAccountReceived",
  deleteMyAccountConfirmationHeading: "Label.DeleteAccountConfirmation",
  deleteMyAccountConfirmationBody: "Description.DeleteAccountConfirmation",
  deleteMyAccountHeading: "Heading.DeleteMyAccount",
  deleteMyAccountBody: "Description.DeleteMyAccount",

  // Request Account Data
  requestAccountDataHeading: "Heading.RequestAccountData",
  requestAccountDataBody: "Description.RequestAccountData",
  requestAccountDataBtnText: "Action.RequestData",
  requestAccountDataConfirmationHeading: "Label.RequestAccountDataConfirmation",
  requestAccountDataConfirmationBody: "Description.RequestAccountDataConfirmation",
  requestAccountDataReceivedHeading: "Label.RequestAccountDataReceived",
  requestAccountDataReceivedBody: "Description.RequestAccountDataReceived",
  privacyRequestOngoingHeading: "Label.PrivacyRequestOngoing",
  privacyRequestOngoingBody: "Description.PrivacyRequestOngoing",

  // Other privacy settings
  otherSettingsHeading: "Heading.OtherSettings",

  // Private servers
  privateServerPrivacyLabel: "Label.PrivateServerPrivacy",
  privateServerInviteLabel: "Label.WhoCanInvitePrivateServerV3",
  privateServerInviteTooltip: "Label.ToolTip.WhoCanInvitePrivateServerV3",
  privateServerV2Tooltip: "Label.ToolTip.PrivateServer",
  privateServersDescription: "Description.PrivateServers",
  privateServerPrivacyDescription: "Description.PrivateServersSetting",
  privateServerPrivacyDescriptionO13: "Description.PrivateServersSettingO13",
  parentSidePrivateServerPrivacyDescription: "Description.ParentSide.PrivateServersSetting",
  parentSidePrivateServerPrivacyDescriptionO13: "Description.ParentSide.PrivateServersSettingO13",

  // Online status, join experience privacy and friend activity updates
  onlineStatusLabel: "Label.OnlineStatus",
  onlineStatusDescription: "Description.OnlineStatus",
  parentSideOnlineStatusDescription: "Description.ParentSide.OnlineStatus",
  onlineStatusCascadingUpdatesSuccessMessage: "Description.OnlineStatusUpdated",

  joinExperienceLabel: "Label.WhoCanJoinGame",
  joinExperienceTooltip: "Label.ToolTip.WhoCanJoinGame",
  showCurrentExperienceLabel: "Label.ShowCurrentExperience",
  showCurrentExperienceDescription: "Description.ShowCurrentExperience",
  parentSideShowCurrentExperienceDescription: "Description.ParentSide.ShowCurrentExperience",
  updateFriendsAboutMyActivityLabel: "Label.UpdateFriendsAboutMyActivity",
  updateFriendsAboutMyActivityTooltip: "Label.ToolTip.UpdateFriendsAboutMyActivity",
  conflictUpdateJoinSettingPopupHeader: "Heading.Dialog.ShareCurrentExperiencesWithFriends",
  conflictUpdateJoinSettingPopupMessage: "Response.Dialog.ShareCurrentExperiencesWithFriends",
  conflictUpdateUpdateFriendsActivityPopupHeader:
    "Heading.Dialog.DisableUpdateFriendsAboutMyActivity",
  conflictUpdateUpdateFriendsActivityPopupMessage:
    "Response.Dialog.DisableUpdateFriendsAboutMyActivity",
  currentExperienceCascadingUpdatesSuccessMessage: "Description.CurrentExperienceUpdated",
  inheritedSettingsDescription: "Description.InheritedSettingRestrictions",
  shareActivityUpdatesLabel: "Label.ShareActivityUpdates",
  shareActivityUpdatesDescription: "Description.ShareActivityUpdatesV2",
  parentSideShareActivityUpdatesDescription: "Description.ParentSide.ShareActivityUpdatesV2",
  shareActivityUpdatesDescriptionV2: "Description.ShareActivityUpdatesV3",
  parentSideShareActivityUpdatesDescriptionV2: "Description.ParentSide.ShareActivityUpdatesV3",

  // Inventory & trade privacy
  inventoryPrivacyLabel: "Label.WhoCanSeeInventory",
  inventoryPrivacyTooltip: "Label.ToolTip.WhoCanSeeInventory",
  tradePrivacyLabel: "Label.WhoCanTradeWithMe",
  tradeQualityLabel: "Label.TradeFilter",
  updateInventorySettingPopupMessage: "Response.Dialog.UpdateInventorySetting",
  updateTradeSettingPopupMessage: "Response.Dialog.UpdateTradeSetting",
  privacyRightsRequest: "Description.PrivacyRightsRequest",
  tradingAndInventoryDescription: "Description.TradingAndInventory",
  tradingLabel: "Label.Trading",
  tradingDescription: "Description.TradeSetting",
  parentSideTradingDescription: "Description.ParentSide.TradeSetting",
  inventoryVisibilityLabel: "Label.InventoryVisibility",
  inventoryVisibilityCascadingUpdatesSuccessMessage: "Description.InventoryVisibilityUpdated",

  // Communication privacy
  communicationPrivacyHeading: "Heading.Communication",
  communicationPrivacyTooltip: "Label.ToolTip.ContactSettings",
  textChatInAppLabel: "Label.WhoCanTextChatInApp",
  textChatInAppTooltip: "Label.ToolTip.WhoCanTextChatInApp",
  textChatInExperienceLabel: "Label.WhoCanTextChatInGame",
  textChatInExperienceTooltip: "Label.ToolTip.WhoCanTextChatInGame",

  // Experience chat
  experienceChatLabel: "Label.ExperienceChat",
  experienceChatDescription: "Description.ExperienceChat",
  parentSideExperienceChatDescription: "Description.ParentSide.ExperienceChat",
  parentSideExperienceChatDescriptionV2: "Descripton.ParentSide.ExperienceChatV2",
  parentSideExperienceChatDescriptionV3: "Descripton.ParentSide.ExperienceChatV3",
  experienceChatSettingDescription: "Description.ExperienceChatSetting",
  experienceChatSettingDescriptionV2: "Description.ChildSide.ExperienceChat",
  experienceChatSettingDescriptionV3: "Description.ChildSide.ExperienceChatV3",
  parentSideExperienceChatSettingDescription: "Description.ParentSide.ExperienceChatSetting",
  parentSideExperienceChatSettingDescriptionV2: "Description.ParentSide.ExperienceChatSettingV2",
  parentSideExperienceChatSettingDescriptionV3: "Description.ParentSide.ExperienceChatSettingV3",
  experienceChatDisclaimer: "Description.ExperienceChatDisclaimer",
  experienceChatOnlyDisclaimer: "Description.ExperienceChatOnlyDisclaimer",
  experienceChatCascadingUpdatesSuccessMessage: "Description.ExperienceChatUpdated",

  // Experience direct chat
  directChatLabel: "Label.DirectChat",
  directChatDescription: "Description.DirectChatV2",
  directChatDescriptionV2: "Description.ChildSide.DirectChatV2",
  directChatDescriptionV3: "Description.ChildSide.DirectChatSettingV3",
  parentSideDirectChatDescription: "Description.ParentSide.DirectChatV2",
  parentSideDirectChatDescriptionV2: "Description.ParentSide.DirectChatSetting",
  parentSideDirectChatDescriptionV3: "Description.ParentSide.DirectChatSettingV3",
  directChatOnlyDisclaimer: "Description.DirectChatOnlyDisclaimer",
  directChatCascadingUpdatesSuccessMessage: "Description.RobloxChatDirectChatUpdated",
  partyPrivacyCascadingUpdatesSuccessMessage: "Description.PartyPrivacyUpdated",

  // Party settings
  partyLabel: "Label.Party",
  groupPartyLabel: "Label.GroupParty",
  // Party settings page level description keys
  partyDescription: "Description.Party",
  partyDescriptionO13: "Description.PartyO13",
  partyDescriptionParentSide: "Description.ParentSide.Party",
  partyDescriptionParentSideO13: "Description.ParentSide.PartyO13",
  // Party settings page level description keys V2 for Aegis-enabled locations
  partyDescriptionV2: "Description.PartyV2",
  partyDescriptionO13V2: "Description.PartyO13V2",
  partyDescriptionParentSideV2: "Description.ParentSide.PartyV2",
  partyDescriptionParentSideO13V2: "Description.ParentSide.PartyO13V2",
  // Party settings-level descriptions (shown within the setting box)
  partySettingDescription: "Description.PartySetting",
  partySettingDescriptionParentSide: "Description.ParentSide.PartySetting",
  groupPartyDescription: "Description.GroupPartySetting",
  groupPartyDescriptionParentSide: "Description.ParentSide.GroupParty",
  // Party settings-level descriptions V2 for Aegis-enabled locations (shown within the setting box)
  partySettingDescriptionV2: "Description.PartySettingV2",
  partySettingDescriptionParentSideV2: "Description.ParentSide.PartySettingV2",
  groupPartySettingDescriptionV2: "Description.GroupPartySettingV2",
  groupPartySettingDescriptionParentSideV2: "Description.ParentSide.GroupPartySettingV2",

  // Party Settings V2 (whoCanPartyWithMe, whoCanUsePartyChatWithMe, whoCanUsePartyVoiceWithMe)
  partyV2Description: "Description.PartyAndPartyChat",
  partyDescriptionV3: "Description.PartySettingV3",
  partyChatLabel: "Label.PartyChat",
  partyChatDescription: "Description.PartyChat",
  partyVoiceLabel: "Label.PartyVoiceChat",
  partyVoiceDescription: "Description.PartyVoiceChat",
  partyV2DescriptionParentSide: "Description.PartyAndPartyChatParentSide",
  partySettingDescriptionParentSideV3: "Description.PartySettingConsent",
  partyChatDescriptionParentSide: "Description.PartyChatConsent",
  partyVoiceDescriptionParentSide: "Description.PartyVoiceChatConsent",

  // Indonesia restricted comms copy (trusted friends only)
  tfRestrictedExperienceChatChildSide: "Description.ChildSide.ExperienceChat.TrustedFriendsOnly",
  tfRestrictedDirectChatChildSide: "Description.ChildSide.DirectChatSetting.TrustedFriendsOnly",
  tfRestrictedExperienceChatPageParentSide: "Description.ParentSide.ExperienceChat.TrustedFriends",
  tfRestrictedExperienceChatSettingParentSide:
    "Description.ParentSide.ExperienceChatSetting.TrustedFriends",
  tfRestrictedDirectChatSettingParentSide:
    "Description.ParentSide.DirectChatSetting.TrustedFriends",
  // Indonesia removed comms copy (U13)
  removedCommsPartyChildSide: "Description.PartySetting.AddToParty",
  removedCommsPartyParentSide: "Description.PartySettingConsent.AddToParty",

  // Studio collaboration
  studioCollaborationLabel: "Heading.StudioCollaboration",
  studioCollaborationDescription: "Description.StudioCollaboration",
  parentSideStudioCollaborationDescription: "Description.ParentSide.StudioCollaboration",
  studioCollabTCAndVPCModal: {
    title: "Heading.StudioCollabOneMoreStepModal",
    description: "Description.StudioCollabOneMoreStepModal",
    actionButtonText: "Action.LearnAboutTrustedConnections",
    neutralButtonText: "Action.GetParentalConsent",
  },

  // contact import
  connectWithContactsTitle: "Heading.ConnectWithContacts",
  connectWithContactDescription: "Description.ConnectWithContactsV2",
  connectWithContactModalDescription: "Description.ConnectWithContactsWeb",
  contactImportAllowAccessContactsBtnMobile: "Action.AllowAccessContacts",
  contactImportAllowAccessContactsBtnDesktop: "Action.AllowAccessContactsV3",
  contactImportAllowAccessContactDescriptionMobile: "Description.AllowAccessContacts",
  contactImportAllowAccessContactDescriptionDesktop: "Description.AllowAccessContactsV2",
  deviceContactAccessLabel: "Label.DeviceContactAccess",
  deviceContactAccessDescription: "Description.DeviceContactAccess",
  deviceContactAccessParentSideDescription: "Description.ParentSide.DeviceContactAccess",
  friendDiscoveryLabel: "Label.ConnectionDiscovery",
  friendDiscoveryDescription: "Description.ConnectionDiscovery",
  friendDiscoveryParentSideDescription: "Description.ParentSide.FriendDiscovery",
  deleteSyncedContactsLabel: "Label.DeleteSyncedContacts",
  phoneVerifiedLabel: "Label.PhoneNumberVerified",
  phoneNotVerifiedLabel: "Label.PhoneNumberNotVerified",
  addPhoneBtn: "Label.AddPhoneLink",
  recommendedContactLabel: "Label.RecommendedContact",
  recommendedContactDescription: "Description.RecommendedContact",
  updateRecommendAsContactSuccess: "Message.UpdateRecommendAsContactSuccess",
  updateRecommendAsContactFailure: "Message.UpdateRecommendAsContactFailure",
  allowAccessContactsSuccess: "Message.AllowAccessContactsSuccess",
  allowAccessContactsFailure: "Message.AllowAccessContactsFailure",
  deleteContactDataSuccess: "Message.DeleteContactDataSuccess",
  deleteContactDataFailure: "Message.DeleteContactDataFailure",
  deleteSyncedContactDataLabel: "Label.DeleteSyncedContactData",
  deleteContactDataInstructions: "Description.DeleteContactDataInstructionsV2",
  deleteSyncedContactDataDescription: "Description.DeleteSyncedContactData",
  verifyYourPhone: "Label.VerifyYourPhone",
  phoneNumberDiscoverabilityLabel: "Label.PhoneNumberDiscoverability",
  phoneNumberDiscoverabilityDescription: "Description.PhoneNumberDiscoverability",
  parentSidePhoneNumberDiscoverabilityDescription:
    "Description.ParentSide.PhoneNumberDiscoverability",

  // Voice and avatar chat:
  useMicrophoneLabel: "Heading.UseMicrophone",
  enableChatWithVoiceLabel: "Label.EnableChatWithVoiceV2",
  useCameraLabel: "Heading.UseCameraMovement",
  cameraInputLabel: "Description.CameraInput",
  optInDisabled: "Description.HelpText.OptInDisabled",
  chatVoiceBan: "Description.HelpText.ChatWithVoiceBan",
  videoNotShared: "Description.HelpText.VideoNotShared",
  greenDotLabel: "Label.GreenDotIndication",
  redDotLabel: "Label.RedDotAudio",
  title: "Title.AboutVoiceChat",
  voiceChatHeading: "Heading.EnableMicrophone",
  voiceChatHeadingV2: "Heading.ChatWithVoice",
  chatWithVoiceDescription: "Label.SettingAllowsChatWithVoice",
  chatWithVoiceDescriptionV2: "Label.SettingAllowsChatWithVoiceV2",
  communityStandardsDescription: "Label.FollowCommunityStandards",
  communityStandardsDescriptionV2: "Label.FollowCommunityStandardsV2",
  explicitConsentText: "Label.ExplicitVoiceConsent",
  implicitConsentText: "Label.ImplicitVoiceConsent",
  implicitConsentTextV2: "Label.ImplicitVoiceConsentV2",
  learnMoreAboutVoiceRecordingLabel: "Label.LearnMoreAboutVoiceRecording",
  learnMoreAboutVoiceRecordingLabelV2: "Label.LearnMoreAboutVoiceRecordingV2",
  enableButton: "Label.Enable",
  cameraNotAvailable: "Label.CameraNotSupported",
  improveChatWithVoiceDescription: "Heading.ImproveChatWithVoice",
  analyticsAndImprovementsHeader: "Heading.AnalyticsAndImprovements",
  helpImproveChatDescription: "Description.HelpText.HelpImproveChat",

  // Blocked Users
  unblockBtnText: "Action.Unblock",
  blockLimitMessage: "Description.BlockedLimitMessage",
  hideBtnText: "Action.Hide",
  showBtnText: "Action.Show",
  blockedUsersTitle: "Heading.BlockedUsers",
  noBlockedUsersDescription: "Description.NoBlockedUsers",
  unblockHeading: "Heading.ConfirmUnblock",
  unblockDescription: "Description.UnblockUserV2",
  parentSideUnblockDescription: "Description.ParentUnblockUserV2",
  blockedByChild: "Heading.BlockedByChild",
  blockedByParent: "Heading.BlockedByParent",
  blockedByYou: "Heading.BlockedByYou",
  blockedByYourParent: "Heading.BlockedByYourParent",
  blockedByYourChild: "Heading.BlockedByYourChild",
  all: "Label.All",
  unblockSuccess: "Description.UnblockUserSuccess",

  // Preset Chat
  presetChatDescription: "Description.ChildSide.PresetChat",
  parentSidePresetChatDescription: "Description.ParentSide.PresetChat",
  presetChatSubtitle: "Description.PresetChat.Subtitle",
  restrictivePresetChatSubtitle: "Description.PresetChat.RestrictiveSubtitle",
  presetChatLabel: "Label.PresetChat",

  // Ads Privacy Settings
  adsPrivacySettingsTitle: "Heading.AdsPreferences",

  // Age Verification
  ageCheckBannerDescription: "Description.ageCheckBanner",
  ageCheckRequiredModalTitle: "Title.AgeCheckRequiredForChild",
  ageCheckRequiredModalDescription: "Description.AgeCheckRequiredForChild",
};
