import CurrencyCode from "../enums/CurrencyCode";
import { UpdateInventoryTradePrivacyErrorCode } from "../enums/errorCodes";
import {
  OptionType,
  EnabledStatusValue,
  AllowedStatusValue,
  UserSetting,
  UserPrivacyLevel,
  CommunicationPrivacyLevel,
  SpendNotificationSetting,
  Theme,
  AccountTheme,
  ContentControls,
  PhoneNumberDiscoverability,
  UpdateFriendsAboutMyActivitySettingValue,
  RequirementType,
  CrossAgeGroupCollaborationValue,
  PartySettingsValue,
} from "../enums/userSettingsEnums";

export type TDoNotDisturbTimeWindow = {
  startTimeMinutes: number;
  endTimeMinutes: number;
};

export type TChannelSettingUpdate = {
  channelName: string;
  setting: string;
};

export type TChannelSettings = {
  channelSettings: TChannelSettingUpdate[];
};

export type TUserSettingsBody = {
  [UserSetting.contentAgeRestriction]?: ContentControls;
  [UserSetting.phoneNumberDiscoverability]?: PhoneNumberDiscoverability;
  [UserSetting.whoCanChatWithMeInApp]?: UserPrivacyLevel;
  [UserSetting.whoCanJoinMeInExperiences]?: CommunicationPrivacyLevel;
  [UserSetting.whoCanSeeMyInventory]?: UserPrivacyLevel;
  [UserSetting.whoCanTradeWithMe]?: CommunicationPrivacyLevel;
  [UserSetting.themeType]?: Theme;
  [UserSetting.accountTheme]?: AccountTheme;
  [UserSetting.canUploadContacts]?: boolean;
  [UserSetting.updateFriendsAboutMyActivity]?: UpdateFriendsAboutMyActivitySettingValue;
  [UserSetting.privateServerPrivacy]?: UserPrivacyLevel;
  [UserSetting.allowSellShareData]?: EnabledStatusValue;
  [UserSetting.allowPersonalizedAdvertising]?: EnabledStatusValue;
  [UserSetting.allowVoiceDataUsage]?: EnabledStatusValue;
  [UserSetting.monthlySpendLimit]?: number | null;
  [UserSetting.monthlySpendLimitCurrencyCode]?: CurrencyCode;
  [UserSetting.monthlySpendLimitNotificationType]?: SpendNotificationSetting;
  [UserSetting.enablePurchases]?: EnabledStatusValue;
  [UserSetting.whoCanGroupChatWithMeInApp]?: UserPrivacyLevel;
  [UserSetting.whoCanChatWithMeInExperiences]?: UserPrivacyLevel;
  [UserSetting.whoCanWhisperChatWithMeInExperiences]?: UserPrivacyLevel;
  [UserSetting.dailyScreenTimeLimit]?: number;
  [UserSetting.whoCanSeeMySocialNetworks]?: UserPrivacyLevel;
  [UserSetting.allowThirdPartyAppPermissions]?: EnabledStatusValue;
  [UserSetting.allowEnablePushNotifications]?: AllowedStatusValue;
  [UserSetting.allowEnableEmailNotifications]?: AllowedStatusValue;
  [UserSetting.allowEnableGroupNotifications]?: AllowedStatusValue;
  [UserSetting.allowEnableExperienceNotifications]?: AllowedStatusValue;
  [UserSetting.whoCanOneOnOnePartyWithMe]?: UserPrivacyLevel;
  [UserSetting.whoCanGroupPartyWithMe]?: UserPrivacyLevel;
  [UserSetting.doNotDisturb]?: EnabledStatusValue;
  [UserSetting.doNotDisturbTimeWindow]?: TDoNotDisturbTimeWindow;
  [UserSetting.whoCanSeeMyOnlineStatus]?: UserPrivacyLevel;
  [UserSetting.allowSensitiveIssues]?: EnabledStatusValue;
  [UserSetting.allowMarketingEmailNotifications]?: EnabledStatusValue;
  [UserSetting.allowCrossAgeGroupStudioCollaboration]?: CrossAgeGroupCollaborationValue;
  [UserSetting.allowFacialAgeEstimation]?: EnabledStatusValue;
  [UserSetting.aggregatedDesktopNotifications]?: EnabledStatusValue;
  [UserSetting.whoCanPartyWithMe]?: PartySettingsValue;
  [UserSetting.whoCanUsePartyChatWithMe]?: PartySettingsValue;
  [UserSetting.whoCanUsePartyVoiceWithMe]?: PartySettingsValue;
  [UserSetting.spendNotifications]?: SpendNotificationSetting;
  [UserSetting.AllowPromotionalOffersNotifications]?: TChannelSettings;
  [UserSetting.allowPresetChat]?: EnabledStatusValue;
};

export type TOptionValue =
  | ContentControls
  | PhoneNumberDiscoverability
  | Theme
  | AccountTheme
  | CommunicationPrivacyLevel
  | UserPrivacyLevel
  | UpdateFriendsAboutMyActivitySettingValue
  | EnabledStatusValue
  | AllowedStatusValue
  | boolean
  | SpendNotificationSetting
  | number
  | TDoNotDisturbTimeWindow
  | TChannelSettings
  | string; // for do not disturb time window in parental-controls-api/v1/parental-controls/grant-consent

export type TOption = {
  optionValue?: TOptionValue;
  optionType?: OptionType;
};

export type TSettingOptionAndRequirement = {
  option: TOption;
  requirement?: RequirementType;
};

export type TUserSettingAndOptions<T> = {
  currentValue?: T;
  options: TSettingOptionAndRequirement[];
};

export type TUserSettingsAndOptionsBody = {
  [UserSetting.contentAgeRestriction]?: TUserSettingAndOptions<ContentControls>;
  [UserSetting.themeType]?: TUserSettingAndOptions<Theme>;
  [UserSetting.accountTheme]?: TUserSettingAndOptions<AccountTheme>;
  [UserSetting.phoneNumberDiscoverability]?: TUserSettingAndOptions<PhoneNumberDiscoverability>;
  [UserSetting.whoCanJoinMeInExperiences]?: TUserSettingAndOptions<CommunicationPrivacyLevel>;
  [UserSetting.privateServerPrivacy]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.updateFriendsAboutMyActivity]?: TUserSettingAndOptions<UpdateFriendsAboutMyActivitySettingValue>;
  [UserSetting.whoCanChatWithMeInApp]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.whoCanGroupChatWithMeInApp]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.whoCanChatWithMeInExperiences]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.whoCanWhisperChatWithMeInExperiences]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.dailyScreenTimeLimit]?: TUserSettingAndOptions<number>;
  [UserSetting.enablePurchases]?: TUserSettingAndOptions<EnabledStatusValue>;
  [UserSetting.whoCanTradeWithMe]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.whoCanSeeMyInventory]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.whoCanSeeMySocialNetworks]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.allowThirdPartyAppPermissions]?: TUserSettingAndOptions<EnabledStatusValue>;
  [UserSetting.allowEnablePushNotifications]?: TUserSettingAndOptions<AllowedStatusValue>;
  [UserSetting.allowEnableEmailNotifications]?: TUserSettingAndOptions<AllowedStatusValue>;
  [UserSetting.allowEnableGroupNotifications]?: TUserSettingAndOptions<AllowedStatusValue>;
  [UserSetting.allowEnableExperienceNotifications]?: TUserSettingAndOptions<AllowedStatusValue>;
  [UserSetting.allowVoiceDataUsage]?: TUserSettingAndOptions<EnabledStatusValue>;
  [UserSetting.whoCanOneOnOnePartyWithMe]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.whoCanGroupPartyWithMe]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.doNotDisturb]?: TUserSettingAndOptions<EnabledStatusValue>;
  [UserSetting.doNotDisturbTimeWindow]?: TUserSettingAndOptions<TDoNotDisturbTimeWindow>;
  [UserSetting.whoCanSeeMyOnlineStatus]?: TUserSettingAndOptions<UserPrivacyLevel>;
  [UserSetting.allowSensitiveIssues]?: TUserSettingAndOptions<EnabledStatusValue>;
  [UserSetting.allowMarketingEmailNotifications]?: TUserSettingAndOptions<EnabledStatusValue>;
  [UserSetting.allowCrossAgeGroupStudioCollaboration]?: TUserSettingAndOptions<CrossAgeGroupCollaborationValue>;
  [UserSetting.allowFacialAgeEstimation]?: TUserSettingAndOptions<EnabledStatusValue>;
  [UserSetting.whoCanPartyWithMe]?: TUserSettingAndOptions<PartySettingsValue>;
  [UserSetting.whoCanUsePartyChatWithMe]?: TUserSettingAndOptions<PartySettingsValue>;
  [UserSetting.whoCanUsePartyVoiceWithMe]?: TUserSettingAndOptions<PartySettingsValue>;

  // These technically come from billing-api, not user-settings-api
  // But adding the types here makes it easier
  [UserSetting.monthlySpendLimit]?: TUserSettingAndOptions<number>;
  [UserSetting.spendNotifications]?: TUserSettingAndOptions<SpendNotificationSetting>;
};

export type TUserSettingsRequestBody = {
  requestedUserSettings?: string;
};

export type TUserSettingsMetadataBody = {
  isAccountRestrictionsDoubleWriteEnabled?: boolean;
  isContactImportFeatureEnabled?: boolean;
  isDiscoverabilitySettingsEnabled?: boolean;
  prefillDiscoverabilitySetting?: boolean;
  showDiscoverabilityUpsells?: boolean;
  renderSeventeenPlusSettingChoice?: boolean;
  requireVerificationOnSeventeenPlus?: boolean;
  useExtendedParentControlsText?: boolean;
  hideEmailAddressChangeField?: boolean;
  displayUpdateFriendsAboutMyActivitySetting?: boolean;
  displayAdsSettings?: boolean;
  displaySpendLimitSettings?: boolean;
  isShowRobloxTranslationsEnabled?: boolean;
};

export type TSettingOptionWithActions = {
  option: TOption;
  requiredActions: RequirementType[];
};

export type TUserSettingsAndOptionsV2<T> = {
  currentValue?: T;
  options: TSettingOptionWithActions[];
};

export type TUserSettingsAndOptionsV2Body = {
  [UserSetting.whoCanWhisperChatWithMeInExperiences]?: TUserSettingsAndOptionsV2<UserPrivacyLevel>;
  [UserSetting.whoCanChatWithMeInExperiences]?: TUserSettingsAndOptionsV2<UserPrivacyLevel>;
  [UserSetting.whoCanSeeMySocialNetworks]?: TUserSettingsAndOptionsV2<UserPrivacyLevel>;
  [UserSetting.allowCrossAgeGroupStudioCollaboration]?: TUserSettingsAndOptionsV2<CrossAgeGroupCollaborationValue>;
  [UserSetting.aggregatedDesktopNotifications]?: TUserSettingsAndOptionsV2<EnabledStatusValue>;
  [UserSetting.whoCanPartyWithMe]?: TUserSettingsAndOptionsV2<PartySettingsValue>;
  [UserSetting.whoCanUsePartyChatWithMe]?: TUserSettingsAndOptionsV2<PartySettingsValue>;
  [UserSetting.whoCanUsePartyVoiceWithMe]?: TUserSettingsAndOptionsV2<PartySettingsValue>;
  [UserSetting.allowPresetChat]?: TUserSettingsAndOptionsV2<EnabledStatusValue>;
};

type TCascadingSettingUpdatesResponse = {
  [UserSetting.whoCanJoinMeInExperiences]?: CommunicationPrivacyLevel;
  [UserSetting.updateFriendsAboutMyActivity]?: UpdateFriendsAboutMyActivitySettingValue;
};

export type TUpdateUserSettingValueResponseBody = {
  // response from POST user-settings-api/v1/user-settings
  updateWhoCanSeeMyInventoryErrorCode?: UpdateInventoryTradePrivacyErrorCode;
  updateWhoCanTradeWithMeErrorCode?: UpdateInventoryTradePrivacyErrorCode;
  cascadingSettingUpdates?: TCascadingSettingUpdatesResponse;
  // This isn't actually returned from the api, but we use it to determine the success message to display
  settingUpdateBlocked?: boolean;

  // response from POST parental-controls-api/v1/parental-controls/grant-consent
  details?: {
    cascadingSettingsUpdated?: boolean;
  };
};

export type TUpdateUserSettingValueRequest = {
  setting: UserSetting;
  value?: TOptionValue;
  childUserId?: number;
  auditHeader?: string;
  usePrologue?: boolean;
  useRequirementsMapV2?: boolean;
  // Optional: directly provide the required actions for this setting update.
  // Avoids stale Redux state issues after settingsAndOptionsV2 refetch.
  requiredActionsOverride?: RequirementType[];
};

export type TUpdateChildSettingsRequest = {
  childUserId: number;
} & TUserSettingsBody;

export enum UpdateChildSettingsErrorCode {
  SettingsUpdateInheritanceViolation = "SettingsUpdateInheritanceViolation",
  ParentNotVerified = "ParentNotVerified",
}

export type TUpdateChildSettingsError = {
  data: {
    code: UpdateChildSettingsErrorCode;
  };
};

export type TParentEmailsBody = {
  parentEmails?: string[];
};
