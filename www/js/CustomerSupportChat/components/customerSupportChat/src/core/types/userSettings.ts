export interface TwoStepVerificationViewModel {
  UserId: number;
  IsEnabled: boolean;
  CodeLength: number;
  ValidCodeCharacters: string | null;
}

export interface MyAccountSecurityModel {
  IsEmailSet: boolean;
  IsEmailVerified: boolean;
  IsTwoStepEnabled: boolean;
  ShowSignOutFromAllSessions: boolean;
  TwoStepVerificationViewModel: TwoStepVerificationViewModel;
}

export interface UserSettingsLegacy {
  ChangeUsernameEnabled: boolean;
  IsAdmin: boolean;
  UserId: number;
  Name: string;
  DisplayName: string;
  IsEmailOnFile: boolean;
  IsEmailVerified: boolean;
  IsPhoneFeatureEnabled: boolean;
  RobuxRemainingForUsernameChange: number;
  PreviousUserNames: string;
  UseSuperSafePrivacyMode: boolean;
  IsAppChatSettingEnabled: boolean;
  IsGameChatSettingEnabled: boolean;
  IsParentalSpendControlsEnabled: boolean;
  IsSetPasswordNotificationEnabled: boolean;
  ChangePasswordRequiresTwoStepVerification: boolean;
  ChangeEmailRequiresTwoStepVerification: boolean;
  UserEmail: string;
  UserEmailMasked: boolean;
  UserEmailVerified: boolean;
  CanHideInventory: boolean;
  CanTrade: boolean;
  MissingParentEmail: boolean;
  IsUpdateEmailSectionShown: boolean;
  IsUnder13UpdateEmailMessageSectionShown: boolean;
  IsUserConnectedToFacebook: boolean;
  IsTwoStepToggleEnabled: boolean;
  AgeBracket: number;
  UserAbove13: boolean;
  ClientIpAddress: string;
  AccountAgeInDays: number;
  IsPremium: boolean;
  IsBcRenewalMembership: boolean;
  PremiumFeatureId: number | null;
  HasCurrencyOperationError: boolean;
  CurrencyOperationErrorMessage: string | null;
  Tab: string | null;
  ChangePassword: boolean;
  IsAccountPinEnabled: boolean;
  IsAccountRestrictionsFeatureEnabled: boolean;
  IsAccountSettingsSocialNetworksV2Enabled: boolean;
  IsUiBootstrapModalV2Enabled: boolean;
  IsDateTimeI18nPickerEnabled: boolean;
  InApp: boolean;
  MyAccountSecurityModel: MyAccountSecurityModel;
  ApiProxyDomain: string;
  AccountSettingsApiDomain: string;
  AuthDomain: string;
  IsDisconnectFacebookEnabled: boolean;
  IsDisconnectXboxEnabled: boolean;
  NotificationSettingsDomain: string;
  AllowedNotificationSourceTypes: string[];
  AllowedReceiverDestinationTypes: string[];
  BlacklistedNotificationSourceTypesForMobilePush: string[];
  MinimumChromeVersionForPushNotifications: number;
  PushNotificationsEnabledOnFirefox: boolean;
  LocaleApiDomain: string;
  HasValidPasswordSet: boolean;
  IsFastTrackAccessible: boolean;
  IsAgeDownEnabled: boolean;
  IsDisplayNamesEnabled: boolean;
}

export enum Theme {
  Classic = "Classic",
  Light = "Light",
  Dark = "Dark",
}

export interface XboxCrossPlaySetting {
  userId: number;
  isEnabled: boolean;
  created: string;
  updated: string;
}

export interface UserSettingsV1 {
  phoneNumberDiscoverability: string;
  contentAgeRestriction: string;
  themeType: Theme;
  canUploadContacts: boolean | null;
  whoCanMessageMe?: string;
  whoCanChatWithMe: string;
  whoCanChatWithMeInApp: string;
  whoCanJoinMeInExperiences: string;
  voiceChatOptIn: boolean;
  whoCanSeeMyInventory: string;
  whoCanTradeWithMe: string;
  whoCanWhisperChatWithMeInExperiences: string;
  whoCanGroupChatWithMeInApp: string;
  tradeQualityFilter: string;
  xboxCrossPlaySetting: XboxCrossPlaySetting;
  privateServerPrivacy: string;
  boundAuthTokenValidation: string;
  friendSuggestions: string;
  updateFriendsAboutMyActivity: string;
  allowSellShareData: string;
  allowPersonalizedAdvertising: string;
  dailyScreenTimeLimit: number | null;
  enablePurchases: string;
  whoCanSeeMySocialNetworks: string;
}
