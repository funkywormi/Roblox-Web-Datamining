export enum AllowedExperienceStyle {
  RadioButtons = "RadioButtons",
  Slider = "Slider",
  SliderWithConsentRequests = "SliderWithConsentRequests",
}

export enum AppThemesAccess {
  Enabled = "Enabled",
  Eligible = "Eligible",
  Disabled = "Disabled",
}

export type TSettingsUIPolicyBody = {
  accountCountryPickerEnabled: boolean;
  displayParentalSpendControl: boolean;
  displayAccountRestrictions: boolean;
  displaySocialMedia: boolean;
  displayAccountDeletion: boolean;
  display17PlusDescription: boolean;
  display17PlusUnavailableIOSDescription: boolean;
  displayVoiceChatSettings: boolean;
  displayLanguageList: boolean;
  displayPhoneNumber: boolean;
  displayChangeUsername: boolean;
  displayPasswordRow: boolean;
  displayNewVoiceConsentModalCopy: boolean;
  displayReactNotificationsTab: boolean;
  displayBillingTab: boolean;
  displaySubscriptionsTab: boolean;
  displayParentalControlTab: boolean;
  displayAppPermissionsTab: boolean;
  displayBlockListV2: boolean;
  enableAccountCountrySubdivisionSetting: boolean;
  displayAccountDeactivation: boolean;
  isPrivateServerPrivacyV2Enabled: boolean;
  showDataConsentToggle: boolean;
  displayFriendsAndContactsSettings: boolean;
  displayBirthdayPicker: boolean;
  displayAgeVerification: boolean;
  renamePaymentsToSpendingTab: boolean;
  displayAvatarVideoSetting: boolean;
  displayVoiceSettingsForUser: boolean;
  renamePrivacyToPrivacyContentRestrictionsTab: boolean;
  hideDeviceContactSyncSettings: boolean;
  displayAgeGroup: boolean;
  rollbackUserControlledScreentime: boolean;
  enableVPCBirthdateUpdateLifetimeCap: boolean;
  displayVPCAgeVerifiedMetadata: boolean;
  displayFAEAccountInfoEntrypoint: boolean;
  hideFaeButton: boolean;
  displayAgeCheckedBadge: boolean;
  birthdatePickerLowerBoundInclusive: number;
  birthdatePickerUpperBoundInclusive: number;
  vpcForFaeCreatorCollabSettingEnabled: boolean;
  enableAgeCheckSetting: boolean;
  enableParentLinkActivityUpdates: boolean;
  enableChildSideParentDigestEmails: boolean;
  displayDesktopNotificationSettings: boolean;
  enableFoundationModals: boolean;
  experienceChatTCBreakthroughEnabled: boolean;
  enforceAgeVerificationForSocialLinks: boolean;
  disableSocialLinkCreation: boolean;
  hideSocialLinksSection: boolean;
  faeDeeplinkFlowEnabled: boolean;
  idvDeeplinkFlowEnabled: boolean;
  disableAndroidDeeplink: boolean;
  disableAndroidAccountInfoReturnpage: boolean;
  disableAndroidReturnpage: boolean;
  disableIosDeeplink: boolean;
  disableIosAccountInfoReturnpage: boolean;
  disableIosReturnpage: boolean;
  shouldDisplayPartySettingsV2: boolean;
  displayEmailAddress: boolean;
  parentEmailChangesEnabled: boolean;
  notificationSettingsRedesignEnabled: boolean;
  selfServeAccountDeletionEnabled: boolean;
  selfServeDataAccessEnabled: boolean;
  disableAutoSettingUpdateModal: boolean;
  isAllowedExperiencesEnabled: boolean;
  shouldShowTFRestrictiveCommsCopy: boolean;
  shouldShowRemovedCommsCopy: boolean;
  shouldShowRestrictivePresetChatSetting: boolean;
  shouldShowGenericShareActivityUpdatesCopy: boolean;
  isTrustedFriendsInVisibilitySettingsRolledOut: boolean;
  shouldShowContentMaturityLocalAgeRatingBanner: boolean;
  canSeeChatTerminology: boolean;
  appThemesAccess: AppThemesAccess;
};

export type TSettingsUIRequest = {
  bustCache: boolean;
};

export type TAccountInfoAgeVerificationRequest = {
  bustCache: boolean;
};

export type TFreeCommunicationInfographicPolicyBody = {
  requireExplicitVoiceConsent: boolean;
  showExperimentalDesign: boolean;
  cameraLearnMoreLink: string;
};

export type TDisplayNamesPolicyBody = {
  RealNamesInDisplayNamesEnabled: boolean;
};

export type TPrivateMessagesPolicyBody = {
  hideInboxMessagingElements: boolean;
};

export type TAbuseReportRevampPolicyBody = {
  EnableParentalDashboard: boolean;
};

export type TVpcLaunchStatusBody = {
  isVPCEnabled: boolean;
  isTeenLaunchEnabled: boolean;
};

export type TAccountInfoAgeVerificationPolicyBody = {
  faeAvailable: boolean;
  idvAvailable: boolean;
  vpcForFaeAvailable: boolean;
  undoAgeVerificationAvailable: boolean;
  acceptDownageAvailable: boolean;
  requireIDReverification: boolean;
};
