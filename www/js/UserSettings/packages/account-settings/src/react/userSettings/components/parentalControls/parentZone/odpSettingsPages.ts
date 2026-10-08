import {
  TParentalSpendControlsSettings,
  TUserSettingsAndOptionsBody,
  TUserSettingsAndOptionsV2Body,
  UserSetting,
} from "@rbx/user-settings";
import { getChildSettingsPages } from "../../../../apis/slices/childPagesSlice";
import { TChildSettingsInfo } from "../../../../../types/childrenInfoTypes";
import SpendSettingName from "../../../../../enums/SpendSettingName";
import SettingCategoryPageName from "../../../../../enums/SettingCategoryPageName";
import PrivacySettingName from "../../../../../enums/privacy/PrivacySettingName";
import { TSettingsPage } from "../../../../../types/commonTypes";
import { TGetOdpChildContextResponse } from "../../../../../types/odpChildContextTypes";
import { TSettingsUIPolicyBody } from "../../../../../types/policyTypes";
import { baseParentalControlsPath } from "../../../constants/parentalControls/parentalControlsConstants";
import privacyTranslationConstants from "../../../constants/contentConstants/privacyTranslationConstants";
import doesUserHaveNotificationSettings from "../../../utils/notificationUtils";

export type TOdpSettingsPage = TSettingsPage & {
  settings: { name: UserSetting }[];
};

const childPages = getChildSettingsPages(baseParentalControlsPath);
const categories = childPages.childSettingCategoryPages;
export const odpSettingsPageList: TSettingsPage[] = [
  categories.ContentRestrictions,
  categories.Communication,
  {
    name: PrivacySettingName.Screentime,
    path: `${baseParentalControlsPath}/${PrivacySettingName.Screentime}`,
    titleTranslationKey: privacyTranslationConstants.pageTitles[PrivacySettingName.Screentime],
  },
  categories.Spending,
  categories.VisibilityAndPrivateServers,
  categories.FriendsAndContacts,
  categories.BlockedUsers,
  categories.TradingAndInventory,
  categories.ThirdPartyApplications,
  categories.Notifications,
  categories.AgeCheck,
];

export const odpSettingsSubpageGroups: Record<string, Record<string, TSettingsPage>> = {
  [SettingCategoryPageName.ContentRestrictions]: childPages.contentRestrictionPages,
  [SettingCategoryPageName.Communication]: childPages.communicationPages,
  [SettingCategoryPageName.Spending]: childPages.spendingPages,
  [SettingCategoryPageName.VisibilityAndPrivateServers]:
    childPages.visibilityAndPrivateServersPages,
};

const subpageSettings: Record<string, UserSetting[]> = {
  [PrivacySettingName.ContentMaturity]: [UserSetting.contentAgeRestriction],
  [PrivacySettingName.SensitiveIssues]: [UserSetting.allowSensitiveIssues],
  [PrivacySettingName.PrivatePlaytest]: [UserSetting.privatePlaytest],
  [SettingCategoryPageName.ExperienceChat]: [
    UserSetting.whoCanChatWithMeInExperiences,
    UserSetting.whoCanWhisperChatWithMeInExperiences,
  ],
  [SettingCategoryPageName.Party]: [UserSetting.whoCanOneOnOnePartyWithMe],
  [SettingCategoryPageName.PartyAndPartyChat]: [UserSetting.whoCanPartyWithMe],
  [SettingCategoryPageName.PartyAndPartyChatV2]: [UserSetting.whoCanPartyWithMe],
  [SettingCategoryPageName.VoiceDataUsage]: [UserSetting.allowVoiceDataUsage],
  [SettingCategoryPageName.StudioCollaboration]: [
    UserSetting.allowCrossAgeGroupStudioCollaboration,
  ],
  [SettingCategoryPageName.PresetChat]: [UserSetting.allowPresetChat],
  [SpendSettingName.AllowPurchases]: [UserSetting.enablePurchases],
  [SpendSettingName.MonthlySpendingLimit]: [UserSetting.monthlySpendLimit],
  [SpendSettingName.SpendNotifications]: [UserSetting.monthlySpendLimitNotificationType],
  [SettingCategoryPageName.Visibility]: [
    UserSetting.whoCanSeeMyOnlineStatus,
    UserSetting.whoCanJoinMeInExperiences,
    UserSetting.updateFriendsAboutMyActivity,
    UserSetting.whoCanSeeMySocialNetworks,
  ],
  [PrivacySettingName.PrivateServerPrivacy]: [UserSetting.privateServerPrivacy],
};

const experienceSubpages: string[] = [
  PrivacySettingName.BlockedExperiences,
  PrivacySettingName.BlockedExperiencesSearch,
  PrivacySettingName.ApprovedExperiences,
];

export const odpSettingsSubpageList = Object.values(odpSettingsSubpageGroups)
  .flatMap(group => Object.values(group))
  .filter(page => subpageSettings[page.name] || experienceSubpages.includes(page.name));

export const getOdpSettingsSubpages = (
  page: TOdpSettingsPage,
  child: TChildSettingsInfo,
  policy?: TSettingsUIPolicyBody,
): Record<string, TSettingsPage> =>
  Object.fromEntries(
    Object.entries(odpSettingsSubpageGroups[page.name] ?? {}).filter(([name]) => {
      if (experienceSubpages.includes(name)) {
        return (
          child.canParentManageChildsExperiences === true &&
          (name !== PrivacySettingName.ApprovedExperiences ||
            policy?.isAllowedExperiencesEnabled === true)
        );
      }
      if (
        name ===
        (child.canSeeChatTerminology
          ? SettingCategoryPageName.PartyAndPartyChat
          : SettingCategoryPageName.PartyAndPartyChatV2)
      ) {
        return false;
      }
      return page.settings.some(setting => subpageSettings[name]?.includes(setting.name));
    }),
  );

export const getOdpSettingsPages = (
  context: TGetOdpChildContextResponse | undefined,
  settings: TUserSettingsAndOptionsBody | undefined,
  settingsV2: TUserSettingsAndOptionsV2Body | undefined,
  policy: TSettingsUIPolicyBody | undefined,
  spendControls: TParentalSpendControlsSettings | undefined,
  hasRemoteParent = false,
): Record<string, TOdpSettingsPage> => {
  if (context?.canManageSettings !== true) {
    return {};
  }

  const canParentAccessBasicPrivacySettings =
    context.canParentAccessChildBasicPrivacySettings === true;
  const canParentAccessCommunicationSettings =
    canParentAccessBasicPrivacySettings ||
    context.canParentManageChildsCommunicationSettings === true;
  const isPartyV2Enabled = policy?.shouldDisplayPartySettingsV2 === true;
  const useLegacyParty =
    canParentAccessCommunicationSettings &&
    !isPartyV2Enabled &&
    !!settings?.whoCanOneOnOnePartyWithMe &&
    !!settings.whoCanGroupPartyWithMe;
  const usePartyV2 =
    canParentAccessCommunicationSettings && isPartyV2Enabled && !!settingsV2?.whoCanPartyWithMe;
  const pages: Record<string, TOdpSettingsPage> = {};

  const addPage = (
    name: string,
    candidates: [
      settingName: UserSetting,
      isSettingVisible: boolean | undefined,
      useV2?: boolean,
    ][],
    shouldShowWithoutSettings = false,
  ) => {
    const rows: TOdpSettingsPage["settings"] = [];
    candidates.forEach(([settingName, isSettingVisible, useV2]) => {
      const setting = useV2
        ? settingsV2?.[settingName as keyof TUserSettingsAndOptionsV2Body]
        : settings?.[settingName as keyof TUserSettingsAndOptionsBody];
      const value = setting?.currentValue;
      if (isSettingVisible && value !== undefined && typeof value !== "object") {
        rows.push({ name: settingName });
      }
    });
    if (rows.length > 0 || shouldShowWithoutSettings) {
      pages[name] = {
        ...odpSettingsPageList.find(page => page.name === name)!,
        settings: rows,
      };
    }
  };

  addPage(
    SettingCategoryPageName.ContentRestrictions,
    [
      [UserSetting.contentAgeRestriction, canParentAccessBasicPrivacySettings],
      [UserSetting.allowSensitiveIssues, true],
      [UserSetting.privatePlaytest, context.canParentManageChildsPrivatePlaytestSetting, true],
    ],
    context.canParentManageChildsExperiences === true,
  );
  addPage(SettingCategoryPageName.Communication, [
    [UserSetting.whoCanChatWithMeInExperiences, canParentAccessCommunicationSettings, true],
    [
      UserSetting.whoCanWhisperChatWithMeInExperiences,
      canParentAccessCommunicationSettings ||
        context.canParentManageChildsInExperienceDirectChatSetting,
      true,
    ],
    [UserSetting.whoCanOneOnOnePartyWithMe, useLegacyParty],
    [UserSetting.whoCanGroupPartyWithMe, useLegacyParty],
    [UserSetting.whoCanPartyWithMe, usePartyV2, true],
    [
      UserSetting.whoCanUsePartyChatWithMe,
      usePartyV2 && (settingsV2?.whoCanUsePartyChatWithMe?.options.length ?? 0) > 1,
      true,
    ],
    [
      UserSetting.whoCanUsePartyVoiceWithMe,
      usePartyV2 && (settingsV2?.whoCanUsePartyVoiceWithMe?.options.length ?? 0) > 1,
      true,
    ],
    [
      UserSetting.allowVoiceDataUsage,
      canParentAccessBasicPrivacySettings && policy?.showDataConsentToggle,
    ],
    [
      UserSetting.allowCrossAgeGroupStudioCollaboration,
      context.canParentViewChildCreatorCollaborationSettings,
      true,
    ],
    [UserSetting.allowPresetChat, context.canParentManageChildsPresetChatSetting, true],
  ]);

  addPage(SettingCategoryPageName.Spending, [
    [UserSetting.enablePurchases, context.canParentViewChildSpendRestrictions],
  ]);

  const spendingSettings: [UserSetting, boolean | undefined][] = [
    [UserSetting.monthlySpendLimit, spendControls?.monthlyLimitVisible],
    [
      UserSetting.monthlySpendLimitNotificationType,
      hasRemoteParent && spendControls?.notificationSettingVisible,
    ],
  ];
  spendingSettings.forEach(([setting, isSettingVisible]) => {
    if (!context.canParentViewChildSpendRestrictions || !isSettingVisible) {
      return;
    }
    const name = SettingCategoryPageName.Spending;
    const page = pages[name] ?? {
      ...odpSettingsPageList.find(p => p.name === name)!,
      settings: [],
    };
    page.settings.push({ name: setting });
    pages[name] = page;
  });

  addPage(SettingCategoryPageName.VisibilityAndPrivateServers, [
    [UserSetting.whoCanSeeMyOnlineStatus, canParentAccessBasicPrivacySettings],
    [UserSetting.whoCanJoinMeInExperiences, canParentAccessBasicPrivacySettings],
    [UserSetting.updateFriendsAboutMyActivity, canParentAccessBasicPrivacySettings],
    [
      UserSetting.whoCanSeeMySocialNetworks,
      canParentAccessBasicPrivacySettings,
      policy?.enforceAgeVerificationForSocialLinks,
    ],
    [UserSetting.privateServerPrivacy, canParentAccessBasicPrivacySettings],
  ]);
  addPage(
    SettingCategoryPageName.FriendsAndContacts,
    [[UserSetting.phoneNumberDiscoverability, true]],
    context.canParentViewChildDeviceContactAccessDisclaimer === true,
  );
  addPage(PrivacySettingName.BlockedUsers, [], context.canParentManageChildsFriends === true);
  addPage(SettingCategoryPageName.TradingAndInventory, [
    [UserSetting.whoCanSeeMyInventory, canParentAccessBasicPrivacySettings],
    [UserSetting.whoCanTradeWithMe, canParentAccessBasicPrivacySettings],
  ]);
  addPage(SettingCategoryPageName.ThirdPartyApplications, [
    [UserSetting.allowThirdPartyAppPermissions, true],
  ]);

  if (doesUserHaveNotificationSettings(settings)) {
    addPage(
      SettingCategoryPageName.Notifications,
      [
        [UserSetting.allowEnableEmailNotifications, true],
        [UserSetting.allowEnablePushNotifications, true],
        [
          UserSetting.aggregatedDesktopNotifications,
          policy?.displayDesktopNotificationSettings,
          true,
        ],
        [UserSetting.doNotDisturb, context.canParentManageChildsDoNotDisturb],
      ],
      true,
    );
  }
  addPage(SettingCategoryPageName.AgeCheck, [
    [
      UserSetting.allowFacialAgeEstimation,
      policy?.enableAgeCheckSetting ||
        (context.canParentViewChildCreatorCollaborationSettings &&
          policy?.vpcForFaeCreatorCollabSettingEnabled),
    ],
    [
      UserSetting.allowIdentityVerification,
      context.canParentManageChildsAllowIdentityVerificationSetting,
      true,
    ],
  ]);

  return pages;
};
