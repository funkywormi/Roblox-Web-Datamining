import { CurrentUser, AccountIntegrityChallengeService, DeviceMeta } from "Roblox";
import { eventStreamService } from "core-roblox-utilities";
import {
  SpendNotificationSetting,
  TOptionValue,
  TUpdateUserSettingValueRequest,
} from "@rbx/user-settings";
import { TEventParams } from "../../../core/types/common/eventTypes";
import RouterPath from "../../../enums/RouterPath";
import { optionToString } from "../utils/parentalControls/parentalConsentUtils";

const { eventTypes } = eventStreamService;
const { ActionType } = AccountIntegrityChallengeService.TwoStepVerification;
enum AllowedExperiences {
  AllAges = "All",
  NinePlus = "EG9AndOver",
  ThirteenPlus = "EG13AndOver",
}

const ERROR_MESSAGE = "errorMessage";
export const accountSettingsOrigin = "AccountSettings";

export const btnClickEvent = (btnName: string, eventName?: string): TEventParams => ({
  name: eventName || `${btnName}BtnClicked`,
  type: eventTypes.formInteraction,
  context: "settings",
  params: { btn: btnName },
});

const authEventNames = {
  authPageload: "authPageload",
  authButtonClick: "authButtonClick",
  authFormInteraction: "authFormInteraction",
  authMsgShown: "authMsgShown",
  authModalShown: "authModalShown",
};

// Mirrors the event names emitted by the Lua app's robloxPlusThemeAnalytics so
// web and in-app App Themes funnels can be unioned in analysis.
const appThemeEventNames = {
  upsellBannerShown: "app_theme_upsell_banner_shown",
  upsellSubscribeClick: "app_theme_upsell_subscribe_click",
  themeSelected: "app_theme_selected",
  devicePreferencesExit: "device_preferences_exit",
};

const eventContext = {
  settingsAppTheme: "settingsAppTheme",
  settingsPControlsFriends: "settingsPControlsFriends",
  settingsPControlsTrustedFriends: "settingsPControlsTrustedFriends",
  settingsPControlsBlockedUsers: "settingsPControlsBlockedUsers",
  settingsBlockedUsers: "settingsBlockedUsers",
  settingsPControlsContentRestrictions: "settingsPControlsContentRestrictions",
  settingsPControlsBlockedExperiences: "settingsPControlsBlockedExperiences",
  settingsContentRestrictions: "settingsContentRestrictions",
  settingsBlockedExperiences: "settingsBlockedExperiences",
  settingsPControlsTopExperiences: "settingsPControlsTopExperiences",
  settingsPControlsTopGames: "settingsPControlsTopGames",
  settingsPControlsTopGameDetails: "settingsPControlsTopGameDetails",
  settingsTopExperiences: "settingsTopExperiences",
  settingsPControlsScreentime: "settingsPControlsScreentime",
  settingsPControlsConnections: "settingsPControlsConnections",
  settingsPControlsSpendingNotification: "settingsPControlsSpendingNotification",
  settingsPControlsUpdateAttempt: "settingsPControlsUpdateAttempt",
  settingsPControlsCreatorCollab: "settingsPControlsCreatorCollab",
  settingsPControlsAgeCheck: "settingsPControlsAgeCheck",
  settingsPControlsGiftRobux: "settingsPControlsGiftRobux",
};

// Per-tab event data for the shell-level page load emitted when a settings tab becomes active.
const settingsTabEventData: Record<RouterPath, { context: string; associatedText: string }> = {
  [RouterPath.Info]: { context: "settingsTabInfo", associatedText: "Account info" },
  [RouterPath.Security]: { context: "settingsTabSecurity", associatedText: "Security" },
  [RouterPath.Privacy]: { context: "settingsTabPrivacy", associatedText: "Privacy" },
  [RouterPath.Notifications]: {
    context: "settingsTabNotifications",
    associatedText: "Notifications",
  },
  [RouterPath.Billing]: { context: "settingsTabBilling", associatedText: "Billing" },
  [RouterPath.Robux]: { context: "settingsTabRobux", associatedText: "Robux" },
  [RouterPath.Subscriptions]: {
    context: "settingsTabSubscriptions",
    associatedText: "Subscriptions",
  },
  [RouterPath.ParentalControls]: {
    context: "settingsTabParentalControls",
    associatedText: "Parental controls",
  },
  [RouterPath.AppPermissions]: {
    context: "settingsTabAppPermissions",
    associatedText: "App permissions",
  },
  [RouterPath.BrowserPreferences]: {
    context: "settingsTabBrowserPreferences",
    associatedText: "Browser preferences",
  },
};

export const getEventParams = {
  appThemeUpsellBannerShown: (): TEventParams => ({
    name: appThemeEventNames.upsellBannerShown,
    type: appThemeEventNames.upsellBannerShown,
    context: eventContext.settingsAppTheme,
    params: {},
  }),
  appThemeUpsellSubscribeClick: (): TEventParams => ({
    name: appThemeEventNames.upsellSubscribeClick,
    type: appThemeEventNames.upsellSubscribeClick,
    context: eventContext.settingsAppTheme,
    params: {},
  }),
  appThemeSelected: (themeKey: string): TEventParams => ({
    name: appThemeEventNames.themeSelected,
    type: appThemeEventNames.themeSelected,
    context: eventContext.settingsAppTheme,
    params: { theme_key: themeKey },
  }),
  devicePreferencesExit: (): TEventParams => ({
    name: appThemeEventNames.devicePreferencesExit,
    type: appThemeEventNames.devicePreferencesExit,
    context: eventContext.settingsAppTheme,
    params: {},
  }),
  parentalControlsTabClick: (): TEventParams => ({
    name: "accountParentalControlstabClicked",
    type: "tabClicked",
    context: "accountParentalControls",
    params: { uid: CurrentUser.userId },
  }),
  changeDisplayNameSuccess: (oldName: string, newName: string): TEventParams => ({
    name: "changeDisplaynameSuccess",
    type: "changeDisplayname",
    context: "success",
    params: { currentDisplayName: newName, originalDisplayName: oldName },
  }),
  changeDisplayNameCancel: (oldName: string): TEventParams => ({
    name: "changeDisplaynameCancel",
    type: "changeDisplayname",
    context: "cancel",
    params: { newDisplayName: "", originalDisplayName: oldName },
  }),
  verifyAgeButtonClicked: (): TEventParams => ({
    name: "verifyAgeBtnClicked",
    type: eventTypes.buttonClick,
    context: "Settings",
    params: {
      btn: "verifyMyAge",
      origin: accountSettingsOrigin,
    },
  }),
  verifyAgeButtonClickedIdVerification: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settings",
    params: {
      btn: "idVerification",
    },
  }),
  verifyAgeButtonClickedIdVerificationDeeplink: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settings",
    params: {
      btn: "idVerification",
      state: "deeplink",
    },
  }),
  verifyAgeButtonClickedFacialAgeEstimation: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settings",
    params: {
      btn: "facialAgeEstimation",
      os_time: Date.now(),
    },
  }),
  accountInfoPageViewFaeAvailble: (): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: "settings",
    params: {
      state: "faeAvailable",
    },
  }),
  temporaryCommsBannerFaeButtonClicked: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "Settings",
    params: {
      btn: "faeContinue",
      associatedText: "Continue",
      origin: accountSettingsOrigin,
    },
  }),
  temporaryCommsBannerIdvButtonClicked: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "Settings",
    params: {
      btn: "idvContinue",
      associatedText: "Continue",
      origin: accountSettingsOrigin,
    },
  }),
  temporaryCommsBannerFaeBannerLoad: (): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: "settings",
    params: {
      state: "faeUpsold",
    },
  }),
  temporaryCommsBannerIdvBannerLoad: (): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: "settings",
    params: {
      state: "idvUpsold",
    },
  }),
  temporaryCommsBannerChatDisabledBannerLoad: (): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: "settings",
    params: {
      state: "chatDisabled",
    },
  }),
  voiceInfographicDisplayed: (): TEventParams => ({
    name: "voiceInfographicDisplayed",
    type: "voiceInfographicDisplayed",
    context: "voiceChat",
    params: {},
  }),
  avatarInfographicDisplayed: (): TEventParams => ({
    name: "avatarInfographicDisplayed",
    type: "avatarInfographicDisplayed",
    context: "avatarVideo",
    params: {},
  }),
  voiceOptInToggleRequested: (requestedOptInStatus: boolean): TEventParams => ({
    name: "voiceChatOptInToggle",
    type: "voiceChatOptInToggle",
    context: "voiceChat",
    params: { requestedOptInStatus },
  }),
  addPhone: (): TEventParams => ({
    name: "addPhoneBtnClicked",
    type: eventTypes.buttonClick,
    context: "settings",
    params: { btn: "addPhone" },
  }),
  changePhone: (): TEventParams => ({
    name: "changePhoneBtnClicked",
    type: eventTypes.buttonClick,
    context: "settings",
    params: { btn: "changePhone" },
  }),
  allowedExperiences: (ageRecommendation: string): TEventParams => {
    const btnName = AllowedExperiences[ageRecommendation as keyof typeof AllowedExperiences] || "";
    return {
      name: "modifyAllowedExperience",
      type: eventTypes.formInteraction,
      context: "settingsAllowedExperiences",
      params: { btn: btnName },
    };
  },
  twoStepVerificationEnabled: (): TEventParams => btnClickEvent("turn2SVon"),
  twoStepVerificationDisabled: (): TEventParams => btnClickEvent("turn2SVoff"),
  get2SVEvents: (actionType: string, btn: string): TEventParams => {
    let context;
    switch (actionType) {
      case ActionType.RobuxSpend:
        context = "2svRobuxSpend";
        break;
      case ActionType.ItemTrade:
        context = "2svItemTrade";
        break;
      default:
        context = "2svResale";
    }
    return {
      name: "twoStepVerificationEvent",
      type: eventTypes.buttonClick,
      context,
      params: {
        btn,
      },
    };
  },
  privacyTabPageView: (): TEventParams => {
    return {
      name: "privacyTabPageView",
      type: eventTypes.pageLoad,
      context: "privacyPage",
      params: {
        inApp: DeviceMeta().isInApp.toString(),
      },
    };
  },
  deleteContactsSuccess: (): TEventParams => {
    return {
      name: "deleteContactsSuccess",
      type: eventTypes.buttonClick,
      context: "deleteContacts",
      params: {
        inApp: DeviceMeta().isInApp.toString(),
      },
    };
  },
  toggleSyncContacts: (access: boolean): TEventParams => {
    return {
      name: "toggleSyncContacts",
      type: eventTypes.buttonClick,
      context: "syncContactsToggle",
      params: {
        allowAccess: access.toString(),
      },
    };
  },
  passkeyPageload: (eligible: boolean, timeout?: boolean): TEventParams => {
    let state;
    if (timeout) {
      state = "passkeyTimeout";
    } else {
      state = eligible ? "passkeyEligible" : "passkeyIneligible";
    }

    return {
      name: "passkeyPageload",
      type: authEventNames.authPageload,
      context: "settings",
      params: {
        state,
      },
    };
  },
  passkeyCreated: (state: string): TEventParams => {
    return {
      name: "passkeyCreated",
      type: authEventNames.authModalShown,
      context: "settingsPasskeyCreated",
      params: {
        state,
      },
    };
  },
  passkeyCreationSource: (field: string): TEventParams => {
    return {
      name: "passkeyCreationSource",
      type: authEventNames.authMsgShown,
      context: "passkeyCreationSource",
      params: {
        state: "finishRegistration",
        field,
      },
    };
  },
  authPageLoad: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsAccountInfo",
      params: {
        state,
      },
    };
  },
  birthdayUpdateBtnClick: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsAccountInfo",
      params: {
        btn: "changeAge",
        associatedText: "Pencil icon",
        state,
      },
    };
  },
  cancelPendingConsentModalLoad: (state: string): TEventParams => {
    return {
      name: authEventNames.authModalShown,
      type: authEventNames.authModalShown,
      context: "settingsAccountInfo",
      params: {
        state,
        field: "requestPopup",
        associatedText: "Request In Process",
      },
    };
  },
  confirmCancelPendingConsent: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsAccountInfo",
      params: {
        btn: "cancelRequest",
        associatedText: "Yes",
        state,
      },
    };
  },
  rejectCancelPendingConsent: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsAccountInfo",
      params: {
        btn: "noCancelRequest",
        associatedText: "No",
        state,
      },
    };
  },
  authButtonClickConfirmFae: (state?: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsAccountInfo",
      params: {
        btn: "confirmFae",
        associatedText: "Age Check",
        state,
      },
    };
  },
  birthdayUpdateModalLoad: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsAgeChangeBirthday",
      params: {
        state,
        associatedText: "Update Your Birthday",
      },
    };
  },
  birthdayUpdateModalInteration: (state: string): TEventParams => {
    return {
      name: authEventNames.authFormInteraction,
      type: authEventNames.authFormInteraction,
      context: "settingsAgeChangeBirthday",
      params: {
        associatedText: "Update Your Birthday",
        state,
      },
    };
  },
  birthdayUpdateModalContinue: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsAgeChangeBirthday",
      params: {
        btn: "birthdayContinue",
        associatedText: "Continue",
        state,
      },
    };
  },
  birthdayUpdateModalCancel: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsAgeChangeBirthday",
      params: {
        btn: "birthdayCancel",
        associatedText: "Cancel",
        state,
      },
    };
  },
  birthdayUpdateModalError: (state: string, errorCode?: string): TEventParams => {
    return {
      name: authEventNames.authMsgShown,
      type: authEventNames.authMsgShown,
      context: "settingsAgeChangeBirthday",
      params: {
        state,
        field: "errorMessage",
        associatedText: "Error Message",
        errorCode,
      },
    };
  },
  authButtonClickSettingsPControlsAddParent: (): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsPControls",
      params: {
        btn: "addParent",
        associatedText: "Add Parent",
      },
    };
  },
  authModalShownSettingsPControlsCancelRequest: (state: string): TEventParams => {
    return {
      name: authEventNames.authModalShown,
      type: authEventNames.authModalShown,
      context: "settingsPControls",
      params: { state, field: "cancelRequest", associatedText: "Cancel request" },
    };
  },
  authButtonClickSettingsPControlsCancelParentRequest: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsPControls",
      params: {
        state,
        btn: "cancelParentRequest",
        associatedText: "Cancel Request",
      },
    };
  },
  authButtonClickSettingsPControlsDoNotCancelParentRequest: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsPControls",
      params: {
        state,
        btn: "doNotCancelParentRequest",
        associatedText: "Do Not Cancel",
      },
    };
  },
  authPageloadSettingsPrivacyContentMaturity: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPrivacyContentMaturity",
      params: {
        state,
        associatedText: "Privacy & content maturity",
      },
    };
  },
  authPageloadSettingsContentMaturity: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsContentMaturity",
      params: {
        state,
        associatedText: "Content maturity",
      },
    };
  },
  authPageLoadSettingsSensitiveIssues: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsSensitiveIssues",
      params: {
        associatedText: "Sensitive issues",
      },
    };
  },
  authModalShownSettingsContentMaturityAgeVerify: (): TEventParams => {
    return {
      name: authEventNames.authModalShown,
      type: authEventNames.authModalShown,
      context: "settingsContentMaturity",
      params: {
        field: "ageVerify",
        associatedText: "Verify your age",
      },
    };
  },
  authButtonClickSettingsContentMaturityVerify: (): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsContentMaturity",
      params: {
        btn: "verify",
        associatedText: "Verify Now",
      },
    };
  },
  authButtonClickSettingsContentMaturityCancelVerify: (): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsContentMaturity",
      params: {
        btn: "cancelVerify",
        associatedText: "Cancel",
      },
    };
  },
  authModalShownSettingsContentMaturityContentRestricted: (): TEventParams => {
    return {
      name: authEventNames.authModalShown,
      type: authEventNames.authModalShown,
      context: "settingsContentMaturity",
      params: {
        field: "contentRestricted",
        associatedText: "Content restricted",
      },
    };
  },
  authModalShownSettingsParentRequestNotSent: (state: string): TEventParams => {
    return {
      name: authEventNames.authModalShown,
      type: authEventNames.authModalShown,
      context: "settingsPrivacy",
      params: { state, field: "parentRequestNotSent", associatedText: "Request wasn't sent" },
    };
  },
  authButtonClickBackLinkInterruptParentAskNow: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsPrivacy",
      params: {
        state,
        btn: "askParentNow",
        associatedText: "Ask Now",
      },
    };
  },
  authButtonClickRejectBackLinkInterruptParentAsk: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsPrivacy",
      params: {
        state,
        btn: "cancelParentAsk",
        associatedText: "Cancel",
      },
    };
  },
  authButtonClickSettingsAskMyParent: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsPrivacy",
      params: { state, btn: "askMyParent", associatedText: "Ask My Parent" },
    };
  },
  authPageloadSettingsScreentime: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsScreentime",
      params: {
        associatedText: "Screen time",
      },
    };
  },
  authModalShownSettingsScreentimeAskParent: (): TEventParams => {
    return {
      name: authEventNames.authModalShown,
      type: authEventNames.authModalShown,
      context: "settingsScreentime",
      params: {
        field: "askParent",
        associatedText: "Ask your parent",
      },
    };
  },
  authButtonClickSettingsScreentimeAskParent: (): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsScreentime",
      params: {
        btn: "askParent",
        associatedText: "Ask now",
      },
    };
  },
  authButtonClickSettingsScreentimeCancel: (): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsScreentime",
      params: {
        btn: "cancel",
        associatedText: "Cancel",
      },
    };
  },
  authPageloadSettingsCommunication: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsCommunication",
      params: {
        associatedText: "Communication",
      },
    };
  },
  authPageloadSettingsExperienceChat: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsExperienceChat",
      params: {
        associatedText: "Experience Chat",
      },
    };
  },
  authButtonClickSettingsUpdateAttempt: (request: TUpdateUserSettingValueRequest): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: "settingsUpdateAttempt",
      params: {
        btn: `updateSetting`,
        state: `settingName: ${request.setting} value: ${optionToString(request.value!)}`,
      },
    };
  },
  authPageloadSettingsParty: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsParty",
      params: {
        associatedText: "Party",
      },
    };
  },
  authPageloadSettingsVoiceChat: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsVoice",
      params: {
        associatedText: "Voice chat",
      },
    };
  },
  authPageloadSettingsCameraInput: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsCamera",
      params: {
        associatedText: "Camera input",
      },
    };
  },
  authPageloadSettingsVisibilityAndPrivateServers: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsVisibilityAndPrivateServers",
      params: {
        associatedText: "Visibility & private servers",
      },
    };
  },
  authPageloadSettingsVisibility: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsVisibility",
      params: {
        associatedText: "Visibility",
      },
    };
  },
  authPageloadSettingsPrivateServers: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPrivateServers",
      params: {
        associatedText: "Private servers",
      },
    };
  },
  authPageloadSettingsFriendsAndContacts: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsFriendsAndContacts",
      params: {
        associatedText: "Friends & contacts or Connect with contacts",
      },
    };
  },
  authPageloadSettingsTradingAndInventory: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsTradingAndInventory",
      params: {
        associatedText: "Trading & inventory",
      },
    };
  },
  authPageloadSettingsAdsPreferences: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsAdsPreferences",
      params: {
        associatedText: "Ads preferences",
      },
    };
  },
  authPageloadSettingsBlockedUsers: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: eventContext.settingsBlockedUsers,
      params: {
        associatedText: "Blocked users",
      },
    };
  },
  authPageloadSettingsAccountDeactivation: (): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsAccountDeactivation",
      params: {
        associatedText: "Account deactivation",
      },
    };
  },
  authPageloadSettingsSelfServeRequestAccountData: (): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: "settingsAccountDeactivation",
    params: {
      state: "selfServeRequestAccountData",
      associatedText: "Request Account Data",
    },
  }),
  authPageloadSettingsTab: (tabId: RouterPath, state: string): TEventParams => {
    const { context, associatedText } = settingsTabEventData[tabId];
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context,
      params: {
        state,
        associatedText,
      },
    };
  },
  authPageloadSettingsSelfServeDeleteAccount: (): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: "settingsAccountDeactivation",
    params: {
      state: "selfServeDeleteAccount",
      associatedText: "Delete My Account",
    },
  }),
  authButtonClickSettingsAccountDeactivate: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settingsAccountDeactivation",
    params: {
      btn: "deactivate",
      associatedText: "Deactivate My Account",
    },
  }),
  authButtonClickSettingsDeleteMyAccount: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settingsAccountDeactivation",
    params: {
      btn: "deleteMyAccount",
      associatedText: "Delete My Account",
    },
  }),
  authButtonClickSettingsRequestAccountData: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settingsAccountDeactivation",
    params: {
      btn: "requestAccountData",
      associatedText: "Request Account Data",
    },
  }),
  authButtonClickSettingsDeleteMyAccountConfirm: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settingsAccountDeactivation",
    params: {
      btn: "deleteMyAccountConfirm",
      associatedText: "Delete Account",
    },
  }),
  authButtonClickSettingsDeleteMyAccountConfirmSuccess: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settingsAccountDeactivation",
    params: {
      btn: "deleteMyAccountConfirmSuccess",
      associatedText: "Delete Account",
    },
  }),
  authButtonClickSettingsRequestAccountDataConfirm: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settingsAccountDeactivation",
    params: {
      btn: "requestAccountDataConfirm",
      associatedText: "Request Account Data",
    },
  }),
  authButtonClickSettingsRequestAccountDataConfirmSuccess: (): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: "settingsAccountDeactivation",
    params: {
      btn: "requestAccountDataConfirmSuccess",
      associatedText: "Request Account Data",
    },
  }),
  authPageloadSettingsPControlsChild: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsChild",
      params: {
        state,
        associatedText: "Parental controls + child account info",
      },
    };
  },
  authPageloadSettingsPControlsConsentCenter: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsConsentCenter",
      params: {
        state,
        associatedText: "Pending requests",
      },
    };
  },
  authPageloadSettingsPControlsEditProfile: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsEditProfile",
      params: {
        state,
        associatedText: "Edit profile",
      },
    };
  },
  authPageloadSettingsPControlsScreentime: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: eventContext.settingsPControlsScreentime,
      params: {
        state,
        associatedText: "Screentime",
      },
    };
  },
  authPageloadSettingsPControlsFriends: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: eventContext.settingsPControlsFriends,
      params: {
        state,
        associatedText: "Friends",
      },
    };
  },
  authPageloadSettingsPControlsTrustedFriends: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: eventContext.settingsPControlsTrustedFriends,
      params: {
        state,
        associatedText: "Trusted friends",
      },
    };
  },
  authPageloadSettingsPControlsContentMaturity: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsContentMaturity",
      params: {
        state,
        associatedText: "Content maturity",
      },
    };
  },
  authPageloadSettingsPControlsSensitiveIssues: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsSensitiveIssues",
      params: {
        state,
        associatedText: "Sensitive issues",
      },
    };
  },
  authPageloadSettingsPControlsCommunication: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsCommunication",
      params: {
        state,
        associatedText: "Communication",
      },
    };
  },
  authPageloadSettingsPControlsExperienceChat: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsExperienceChat",
      params: {
        state,
        associatedText: "Experience Chat",
      },
    };
  },
  authPageloadSettingsPControlsVoiceDataUsage: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsVoiceDataUsage",
      params: {
        state,
        associatedText: "Voice data usage",
      },
    };
  },
  authPageloadSettingsPControlsCreatorCollaboration: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: eventContext.settingsPControlsCreatorCollab,
      params: {
        state,
        associatedText: "Creator collaboration",
      },
    };
  },
  authPageloadSettingsPControlsParty: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsParty",
      params: {
        state,
        associatedText: "Party",
      },
    };
  },
  authPageloadSettingsPControlsSpending: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsSpending",
      params: {
        state,
        associatedText: "Spending",
      },
    };
  },
  authPageloadSettingsPControlsAllowPurchases: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsAllowPurchases",
      params: {
        state,
        associatedText: "Allow purchases",
      },
    };
  },
  authPageloadSettingsPControlsVisibilityPrivateServers: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsVisibilityPrivateServers",
      params: {
        state,
        associatedText: "Visibility & private servers",
      },
    };
  },
  authPageloadSettingsPControlsDiscoverability: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsDiscoverability",
      params: {
        state,
        associatedText: "Discoverability",
      },
    };
  },
  authPageloadSettingsPControlsVisibility: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsVisibility",
      params: {
        state,
        associatedText: "Visibility",
      },
    };
  },
  authPageloadSettingsPControlsPrivateServers: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsPrivateServers",
      params: {
        state,
        associatedText: "Private servers",
      },
    };
  },
  authPageloadSettingsPControlsTradingInventory: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsTradingInventory",
      params: {
        state,
        associatedText: "Trading & inventory",
      },
    };
  },
  authPageloadSettingsPControlsThirdPartyApplications: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsThirdPartyApplications",
      params: {
        state,
        associatedText: "Third-party applications",
      },
    };
  },
  authPageloadSettingsPControlsNotifications: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: "settingsPControlsNotifications",
      params: {
        state,
        associatedText: "Notifications",
      },
    };
  },
  authButtonClickSettingsPControlsFriendsUserDetail: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsFriends,
    params: {
      btn: "userDetail",
      associatedText: "Vertical three dots (⋮)",
      state,
    },
  }),
  authButtonClickSettingsPControlsFriendsViewProfile: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsFriends,
    params: {
      btn: "viewProfile",
      associatedText: "View profile",
      state,
    },
  }),
  authButtonClickSettingsPControlsFriendsBlock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsFriends,
    params: {
      btn: "block",
      associatedText: "Block",
      state,
    },
  }),
  authButtonClickSettingsPControlsFriendsReport: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsFriends,
    params: {
      btn: "report",
      associatedText: "Report",
      state,
    },
  }),
  authModalShownSettingsPControlsFriendsConfirmBlock: (state: string): TEventParams => ({
    name: authEventNames.authModalShown,
    type: authEventNames.authModalShown,
    context: eventContext.settingsPControlsFriends,
    params: {
      field: "confirmBlock",
      associatedText: "Confirm block",
      state,
    },
  }),
  authButtonClickSettingsPControlsFriendsConfirmBlock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsFriends,
    params: {
      btn: "confirmBlock",
      associatedText: "Block",
      state,
    },
  }),
  authButtonClickSettingsPControlsFriendsCancelBlock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsFriends,
    params: {
      btn: "cancelBlock",
      associatedText: "Cancel",
      state,
    },
  }),
  authModalShownSettingsPControlsFriendsCantBlock: (state: string): TEventParams => ({
    name: authEventNames.authModalShown,
    type: authEventNames.authModalShown,
    context: eventContext.settingsPControlsFriends,
    params: {
      field: "cantBlock",
      associatedText: "Can't block user",
      state,
    },
  }),

  authButtonClickSettingsPControlsFriendsUnblock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsFriends,
    params: {
      btn: "unblock",
      associatedText: "Unblock",
      state,
    },
  }),

  authModalShownSettingsPControlsFriendsUnblock: (state: string): TEventParams => ({
    name: authEventNames.authModalShown,
    type: authEventNames.authModalShown,
    context: eventContext.settingsPControlsFriends,
    params: {
      field: "unblock",
      associatedText: "Unblock this user",
      state,
    },
  }),

  authButtonClickSettingsPControlsFriendsConfirmUnblock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsFriends,
    params: {
      btn: "confirmUnblock",
      associatedText: "Unblock",
      state,
    },
  }),

  authButtonClickSettingsPControlsFriendsCancelUnblock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsFriends,
    params: {
      btn: "cancelUnblock",
      associatedText: "Cancel",
      state,
    },
  }),
  authPageloadSettingsPControlsBlockedUsers: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: eventContext.settingsPControlsBlockedUsers,
      params: {
        state,
        associatedText: "Blocked users",
      },
    };
  },
  authButtonClickSettingsBlockedUsersUnblock: (blockedUserId: number): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsBlockedUsers,
    params: {
      btn: "unblock",
      associatedText: "Unblock",
      state: blockedUserId,
    },
  }),
  authButtonClickSettingsBlockedUsersUnblockVpc: (blockedUserId: number): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsBlockedUsers,
    params: {
      btn: "unblockVpc",
      associatedText: "🔒 Unblock",
      state: blockedUserId,
    },
  }),
  authModalShownSettingsBlockedUsersUnblock: (blockedUserId: number): TEventParams => ({
    name: authEventNames.authModalShown,
    type: authEventNames.authModalShown,
    context: eventContext.settingsBlockedUsers,
    params: {
      field: "unblock",
      associatedText: "Unblock this user",
      state: blockedUserId,
    },
  }),
  authButtonClickSettingsBlockedUsersConfirmUnblock: (blockedUserId: number): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsBlockedUsers,
    params: {
      btn: "confirmUnblock",
      associatedText: "Unblock",
      state: blockedUserId,
    },
  }),
  authButtonClickSettingsBlockedUsersCancelUnblock: (blockedUserId: number): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsBlockedUsers,
    params: {
      btn: "cancelUnblock",
      associatedText: "Cancel",
      state: blockedUserId,
    },
  }),
  authPageLoadSettingsPControlsContentRestrictions: (state: string): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: eventContext.settingsPControlsContentRestrictions,
    params: {
      state,
      associatedText: "Content restrictions",
    },
  }),
  authPageLoadSettingsPControlsBlockedExperiences: (state: string): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      state,
      associatedText: "Blocked experiences",
    },
  }),
  authButtonClickSettingsPControlsBlockedExperiencesEdp: (
    state: string,
    experienceTitle: string,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      btn: "edp",
      state,
      associatedText: experienceTitle,
    },
  }),
  authButtonClickSettingsPControlsBlockedExperiencesUnblock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      btn: "unblock",
      state,
      associatedText: "Unblock",
    },
  }),

  authModalShownSettingsPControlsBlockedExperiencesConfirmUnblock: (
    state: string,
  ): TEventParams => ({
    name: authEventNames.authModalShown,
    type: authEventNames.authModalShown,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      field: "confirmUnblock",
      state,
      associatedText: "Confirm unblock",
    },
  }),
  authButtonClickSettingsPControlsBlockedExperiencesConfirmUnblock: (
    state: string,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      btn: "confirmUnblock",
      state,
      associatedText: "Unblock",
    },
  }),
  authButtonClickSettingsPControlsBlockedExperiencesCancelUnblock: (
    state: string,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      btn: "cancelUnblock",
      state,
      associatedText: "Cancel",
    },
  }),
  authFormInteractionSettingsPControlsBlockedExperiencesSearch: (
    state: string,
    field: string,
  ): TEventParams => ({
    name: authEventNames.authFormInteraction,
    type: authEventNames.authFormInteraction,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      field,
      state,
      associatedText: "🔍",
    },
  }),
  authButtonClickSettingsPControlsBlockedExperiencesBlock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      btn: "block",
      state,
      associatedText: "Block",
    },
  }),
  authModalShownSettingsPControlsBlockedExperiencesConfirmBlock: (state: string): TEventParams => ({
    name: authEventNames.authModalShown,
    type: authEventNames.authModalShown,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      field: "confirmBlock",
      state,
      associatedText: "Confirm block",
    },
  }),
  authButtonClickSettingsPControlsBlockedExperiencesConfirmBlock: (
    state: string,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      btn: "confirmBlock",
      state,
      associatedText: "Block",
    },
  }),
  authButtonClickSettingsPControlsBlockedExperiencesCancelBlock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      btn: "cancelBlock",
      state,
      associatedText: "Cancel",
    },
  }),
  authModalShownSettingsPControlsBlockedExperiencesCantBlock: (state: string): TEventParams => ({
    name: authEventNames.authModalShown,
    type: authEventNames.authModalShown,
    context: eventContext.settingsPControlsBlockedExperiences,
    params: {
      field: "cantBlock",
      state,
      associatedText: "Can't block experience",
    },
  }),
  authPageLoadSettingsContentRestrictions: (): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: eventContext.settingsContentRestrictions,
    params: {
      associatedText: "Content restrictions",
    },
  }),
  authPageLoadSettingsBlockedExperiences: (): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: eventContext.settingsBlockedExperiences,
    params: {
      associatedText: "Blocked experiences",
    },
  }),
  authButtonClickSettingsBlockedExperiencesEdp: (
    universeId: number,
    experienceTitle: string,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsBlockedExperiences,
    params: {
      btn: "edp",
      state: universeId,
      associatedText: experienceTitle,
    },
  }),
  authPageLoadSettingsPControlsTopGames: (state: string): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: eventContext.settingsPControlsTopGames,
    params: {
      state,
      associatedText: "Top games",
    },
  }),
  authPageLoadSettingsPControlsTopGameDetails: (state: string): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: eventContext.settingsPControlsTopGameDetails,
    params: {
      state,
      associatedText: "Game details",
    },
  }),
  authButtonClickSettingsPControlsTopExperiencesExperienceDetail: (
    state: string,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsTopExperiences,
    params: {
      btn: "experienceDetail",
      state,
      associatedText: "Vertical three dots (⋮)",
    },
  }),
  authButtonClickSettingsPControlsTopExperiencesEdp: (
    state: string,
    experienceTitle: string,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsTopExperiences,
    params: {
      btn: "edp",
      state,
      associatedText: "View details",
    },
  }),
  authButtonClickSettingsPControlsTopExperiencesBlock: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsTopExperiences,
    params: {
      btn: "block",
      state,
      associatedText: "Block",
    },
  }),
  authPageLoadSettingsTopExperiences: (): TEventParams => ({
    name: authEventNames.authPageload,
    type: authEventNames.authPageload,
    context: eventContext.settingsTopExperiences,
    params: {
      associatedText: "Top experiences",
    },
  }),
  authButtonClickSettingsTopExperiencesEdp: (
    universeId: number,
    experienceTitle: string,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsTopExperiences,
    params: {
      btn: "edp",
      state: universeId,
      associatedText: experienceTitle,
    },
  }),
  authButtonClickSettingsPControlsScreentimeMore: (state: string): TEventParams => {
    const childAge = state.split(" ")[0];
    let btn = "more";
    let associatedText = "More";
    if (childAge === "U13") {
      btn = "manage";
      associatedText = "Manage";
    }
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: eventContext.settingsPControlsScreentime,
      params: {
        btn,
        state,
        associatedText,
      },
    };
  },
  authButtonClickSettingsPControlsConnectionsMore: (state: string): TEventParams => {
    const childAge = state.split(" ")[0];
    let btn = "more";
    let associatedText = "More";
    if (childAge === "U13") {
      btn = "manage";
      associatedText = "Manage";
    }
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: eventContext.settingsPControlsConnections,
      params: {
        btn,
        state,
        associatedText,
      },
    };
  },
  authButtonClickSettingsPControlsSpendingNotifications: (
    state: string,
    value: SpendNotificationSetting,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsSpendingNotification,
    params: {
      btn: "enableSpendingNotification",
      state,
      associatedText: value,
    },
  }),
  authButtonClickSettingsPControlsUpdateAttempt: (state: string): TEventParams => {
    return {
      name: authEventNames.authButtonClick,
      type: authEventNames.authButtonClick,
      context: eventContext.settingsPControlsUpdateAttempt,
      params: {
        btn: "updateSetting",
        state,
      },
    };
  },
  authPageloadSettingsPControlsAgeCheck: (state: string): TEventParams => {
    return {
      name: authEventNames.authPageload,
      type: authEventNames.authPageload,
      context: eventContext.settingsPControlsAgeCheck,
      params: {
        state,
        associatedText: "Age check",
      },
    };
  },
  authButtonClickSettingsPControlsGiftRobuxOpen: (state: string): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsGiftRobux,
    params: {
      btn: "addRobux",
      state,
      associatedText: "Add Robux",
    },
  }),
  authButtonClickSettingsPControlsGiftRobuxCheckout: (
    state: string,
    productId: number,
  ): TEventParams => ({
    name: authEventNames.authButtonClick,
    type: authEventNames.authButtonClick,
    context: eventContext.settingsPControlsGiftRobux,
    params: {
      btn: "selectPackage",
      state,
      associatedText: String(productId),
    },
  }),
  authMsgShownSettingsPControlsGiftRobuxError: (
    state: string,
    errorType: string,
  ): TEventParams => ({
    name: authEventNames.authMsgShown,
    type: authEventNames.authMsgShown,
    context: eventContext.settingsPControlsGiftRobux,
    params: {
      state,
      field: ERROR_MESSAGE,
      associatedText: errorType,
    },
  }),
};

export const phoneVerificationButtonValues = {
  CONTINUE_BUTTON: "continue",
  RESEND_BUTTON: "resendCode",
  DELETE_PHONE_BUTTON: "deletePhone",
};

export const phoneVerificationPageValues = {
  addPhone: "addPhone",
  changePhone: "changePhone",
  verifyPhone: "verifyPhone",
  deletePhone: "deletePhone",
};

export const phoneVerificationEvents = {
  phoneModalShown: {
    name: "phoneModalShown",
    type: eventTypes.modalAction,
    context: "verificationSettings",
    params: {
      origin: accountSettingsOrigin,
      aType: "shown",
    },
  },

  phoneModalButtonClicked: {
    name: "phoneModalButtonClicked",
    type: eventTypes.formInteraction,
    context: "verificationSettings",
    params: {
      origin: accountSettingsOrigin,
    },
  },

  phoneModalErrorShown: {
    name: "phoneModalErrorShown",
    type: eventTypes.modalAction,
    context: "verificationSettings",
    params: {
      origin: accountSettingsOrigin,
      aType: "shown",
      field: ERROR_MESSAGE,
    },
  },
};

export const eventConstants = {
  formInteractionEventType: "formInteraction",
  settingsCtx: "settings",
  addEmailBtn: "addEmail",
  verifyEmailBtn: "verifyEmail",
  addPhoneBtn: "addPhone",
  changeEmailBtn: "changeEmail",
  changePhoneBtn: "changePhone",
  sourceStudio: "sourceStudio",
  sourceAccountInfo: "accountInfo",
};

export const twoStepVerificationEventConstants = {
  frictionEventType: "buttonClick",
  twoStepVerificationCtx: "2svRobuxSpend",
  resendCodeBtn: "resendCode",
  verifyCodeBtn: "verifyCode",
  verifySecurityPageBtn: "verifySecurityPage",
  verificationWarningSecurityPageTriggered: "verificationWarningSecurityPageTriggered",
  codeInputModalTriggered: "codeInputModalTriggered",
  successfulVerification: "successfulVerification",
  invalidCodeInput: "invalidCodeInput",
};
