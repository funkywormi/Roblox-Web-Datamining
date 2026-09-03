import { eventStreamService } from "core-roblox-utilities";
import { ContentControls, UserSetting } from "@rbx/user-settings";
import wrapEventServiceWithTryCatch from "../../../../core/utils/eventUtils";
import PrivacySettingName from "../../../../enums/privacy/PrivacySettingName";
import SettingCategoryPageName from "../../../../enums/SettingCategoryPageName";
import { getEventParams } from "../../constants/eventConstants";
import { TSettingConsentRequirements } from "../../../apis/slices/parentalConsentSlice";
import { isOptionBlockedByParentalConsent } from "../../utils/parentalControls/parentalConsentUtils";
import { allPrivacyPages } from "../../constants/privacy/privacyConstants";

const contentMaturityState = (
  settingConsentRequirements: TSettingConsentRequirements | undefined,
): string => {
  if (
    isOptionBlockedByParentalConsent(
      settingConsentRequirements,
      UserSetting.contentAgeRestriction,
      ContentControls.ThirteenPlus,
    )
  ) {
    return "minimalAllowed";
  }

  if (
    isOptionBlockedByParentalConsent(
      settingConsentRequirements,
      UserSetting.contentAgeRestriction,
      ContentControls.SeventeenPlus,
    )
  ) {
    return "moderateAllowed";
  }

  return "restrictedAllowed";
};

const privacyEventService = {
  // Privacy tab events
  authPageloadSettingsPrivacyContentMaturity: wrapEventServiceWithTryCatch(
    (settingConsentRequirements: TSettingConsentRequirements | undefined): void => {
      const state = contentMaturityState(settingConsentRequirements);
      const params = getEventParams.authPageloadSettingsPrivacyContentMaturity(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Content restriction events
  authPageloadSettingsContentMaturity: wrapEventServiceWithTryCatch(
    (settingConsentRequirements: TSettingConsentRequirements | undefined): void => {
      const state = contentMaturityState(settingConsentRequirements);
      const params = getEventParams.authPageloadSettingsContentMaturity(state);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authModalShownSettingsContentMaturityAgeVerify: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authModalShownSettingsContentMaturityAgeVerify();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsContentMaturityVerify: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsContentMaturityVerify();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsContentMaturityCancelVerify: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsContentMaturityCancelVerify();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authModalShownSettingsContentMaturityContentRestricted: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authModalShownSettingsContentMaturityContentRestricted();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageLoadSettingsContentRestrictions: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageLoadSettingsContentRestrictions();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageLoadSettingsBlockedExperiences: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageLoadSettingsBlockedExperiences();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsBlockedExperiencesEdp: wrapEventServiceWithTryCatch(
    (universeId: number, experienceTitle: string): void => {
      const params = getEventParams.authButtonClickSettingsBlockedExperiencesEdp(
        universeId,
        experienceTitle,
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authPageLoadSettingsSensitiveIssues: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageLoadSettingsSensitiveIssues();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),

  // Back-link interrupt modal events
  authModalShownSettingsParentRequestNotSent: wrapEventServiceWithTryCatch(
    (settingName: string): void => {
      const params = getEventParams.authModalShownSettingsParentRequestNotSent(settingName);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickBackLinkInterruptParentAskNow: wrapEventServiceWithTryCatch(
    (settingName: string): void => {
      const params = getEventParams.authButtonClickBackLinkInterruptParentAskNow(settingName);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
  authButtonClickRejectBackLinkInterruptParentAsk: wrapEventServiceWithTryCatch(
    (settingName: string): void => {
      const params = getEventParams.authButtonClickRejectBackLinkInterruptParentAsk(settingName);
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // Ask parent button events
  authButtonClickSettingsAskMyParent: wrapEventServiceWithTryCatch((settingName: string): void => {
    const params = getEventParams.authButtonClickSettingsAskMyParent(settingName);
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),

  // Screentime events
  authPageloadSettingsScreentime: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsScreentime();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authModalShownSettingsScreentimeAskParent: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authModalShownSettingsScreentimeAskParent();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsScreentimeAskParent: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsScreentimeAskParent();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsScreentimeCancel: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsScreentimeCancel();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),

  // Communication events
  authPageloadSettingsCommunication: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsCommunication();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsExperienceChat: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsExperienceChat();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsParty: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsParty();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsVoiceChat: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsVoiceChat();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsCameraInput: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsCameraInput();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),

  // Visibility and Private Servers events
  authPageloadSettingsVisibilityAndPrivateServers: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsVisibilityAndPrivateServers();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsVisibility: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsVisibility();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsPrivateServers: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsPrivateServers();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),

  // Friends and Contacts events
  authPageloadSettingsFriendsAndContacts: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsFriendsAndContacts();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),

  // Trading and Inventory events
  authPageloadSettingsTradingAndInventory: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsTradingAndInventory();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),

  // Ads Preferences events
  authPageloadSettingsAdsPreferences: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsAdsPreferences();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),

  // Blocked Users events
  authPageloadSettingsBlockedUsers: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsBlockedUsers();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),

  // Account Deactivation events
  authPageloadSettingsAccountDeactivation: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsAccountDeactivation();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsSelfServeRequestAccountData: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsSelfServeRequestAccountData();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authPageloadSettingsSelfServeDeleteAccount: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageloadSettingsSelfServeDeleteAccount();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsAccountDeactivate: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsAccountDeactivate();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsDeleteMyAccount: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsDeleteMyAccount();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsRequestAccountData: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsRequestAccountData();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsDeleteMyAccountConfirm: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsDeleteMyAccountConfirm();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsDeleteMyAccountConfirmSuccess: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsDeleteMyAccountConfirmSuccess();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsRequestAccountDataConfirm: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authButtonClickSettingsRequestAccountDataConfirm();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsRequestAccountDataConfirmSuccess: wrapEventServiceWithTryCatch(
    (): void => {
      const params = getEventParams.authButtonClickSettingsRequestAccountDataConfirmSuccess();
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),

  // PerExperienceScreentime events - Child side
  authPageLoadSettingsTopExperiences: wrapEventServiceWithTryCatch((): void => {
    const params = getEventParams.authPageLoadSettingsTopExperiences();
    eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
  }),
  authButtonClickSettingsTopExperiencesEdp: wrapEventServiceWithTryCatch(
    (universeId: number, experienceTitle: string): void => {
      const params = getEventParams.authButtonClickSettingsTopExperiencesEdp(
        universeId,
        experienceTitle,
      );
      eventStreamService.sendEventWithTarget(params.type, params.context, params.params);
    },
  ),
};

export const sendPrivacyPageloadEvent = (
  pathname: string,
  settingConsentRequirements: TSettingConsentRequirements,
): void => {
  const page = Object.values(allPrivacyPages).find(p => p.path === pathname);
  if (page) {
    switch (page.name) {
      case SettingCategoryPageName.PrivacySettingCategoriesList:
        privacyEventService.authPageloadSettingsPrivacyContentMaturity(settingConsentRequirements);
        break;
      case PrivacySettingName.ContentMaturity:
        privacyEventService.authPageloadSettingsContentMaturity(settingConsentRequirements);
        break;
      case PrivacySettingName.SensitiveIssues:
        privacyEventService.authPageLoadSettingsSensitiveIssues();
        break;
      case PrivacySettingName.Screentime:
        privacyEventService.authPageloadSettingsScreentime();
        break;
      case PrivacySettingName.PerExperienceScreentime:
        privacyEventService.authPageLoadSettingsTopExperiences();
        break;
      case SettingCategoryPageName.Communication:
        privacyEventService.authPageloadSettingsCommunication();
        break;
      case SettingCategoryPageName.ExperienceChat:
        privacyEventService.authPageloadSettingsExperienceChat();
        break;
      case SettingCategoryPageName.Party:
        privacyEventService.authPageloadSettingsParty();
        break;
      case SettingCategoryPageName.Voice:
        privacyEventService.authPageloadSettingsVoiceChat();
        break;
      case SettingCategoryPageName.Camera:
        privacyEventService.authPageloadSettingsCameraInput();
        break;
      case SettingCategoryPageName.VisibilityAndPrivateServers:
        privacyEventService.authPageloadSettingsVisibilityAndPrivateServers();
        break;
      case SettingCategoryPageName.Visibility:
        privacyEventService.authPageloadSettingsVisibility();
        break;
      case PrivacySettingName.PrivateServerPrivacy:
        privacyEventService.authPageloadSettingsPrivateServers();
        break;
      case SettingCategoryPageName.FriendsAndContacts:
        privacyEventService.authPageloadSettingsFriendsAndContacts();
        break;
      case SettingCategoryPageName.TradingAndInventory:
        privacyEventService.authPageloadSettingsTradingAndInventory();
        break;
      case PrivacySettingName.AdPreferences:
        privacyEventService.authPageloadSettingsAdsPreferences();
        break;
      case PrivacySettingName.BlockedUsers:
        privacyEventService.authPageloadSettingsBlockedUsers();
        break;
      case PrivacySettingName.AccountDeactivationAndDeletion:
      case PrivacySettingName.AccountDataDeactivationAndDeletion:
        privacyEventService.authPageloadSettingsAccountDeactivation();
        break;
      case SettingCategoryPageName.ContentRestrictions:
        privacyEventService.authPageLoadSettingsContentRestrictions();
        break;
      case PrivacySettingName.BlockedExperiences:
        privacyEventService.authPageLoadSettingsBlockedExperiences();
        break;
      default:
        break;
    }
  }
};

export default privacyEventService;
