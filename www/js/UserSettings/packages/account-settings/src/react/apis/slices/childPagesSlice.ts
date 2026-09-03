/* eslint-disable no-param-reassign */
import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import SpendSettingName from "../../../enums/SpendSettingName";
import SettingCategoryPageName from "../../../enums/SettingCategoryPageName";
import PrivacySettingName from "../../../enums/privacy/PrivacySettingName";
import ParentalControlsPageName from "../../../enums/parentalControls/ParentalControlsPageName";
import { TGetChildrenInfoResponse } from "../../../types/childrenInfoTypes";
import { TSettingsPage } from "../../../types/commonTypes";
import {
  getLinkedChildDetailsPath,
  getTopGameDetailsRoutePath,
  getTopGamesPath,
} from "../../userSettings/constants/parentalControls/parentalControlsConstants";
import { RootState } from "../../redux/store";
import privacyTranslationConstants from "../../userSettings/constants/contentConstants/privacyTranslationConstants";
import parentalControlsTranslationConstants from "../../userSettings/constants/contentConstants/parentalControlsTranslationConstants";

type TChildPagesMap = Record<number, TChildPages>;

type TChildPagesState = {
  allChildPages: TSettingsPage[];
  childPagesMap: TChildPagesMap | undefined;
  childDetailLandingPages: TSettingsPage[];
};

export type TChildPages = {
  linkedChildDetailsLandingPage: TSettingsPage;
  contentRestrictionPages: Record<string, TSettingsPage>;
  childSettingCategoryPages: Record<string, TSettingsPage>;
  communicationPages: Record<string, TSettingsPage>;
  spendingPages: Record<string, TSettingsPage>;
  screenTimeManagementPage: TSettingsPage;
  topGamesPage: TSettingsPage;
  topGameDetailsPage: TSettingsPage;
  visibilityAndPrivateServersPages: Record<string, TSettingsPage>;
  consentCenterPage: TSettingsPage;
  friendManagementPage: TSettingsPage;
  editProfilePage: TSettingsPage;
};

const initialState: TChildPagesState = {
  allChildPages: [],
  childPagesMap: undefined,
  childDetailLandingPages: [],
};

const { pageTitles: privacyPageTitles } = privacyTranslationConstants;
const { pageTitles } = parentalControlsTranslationConstants;

const getChildPages = (childUserId: number): TChildPages => {
  const linkedChildDetailsPath = getLinkedChildDetailsPath(childUserId);
  const linkedChildDetailsLandingPage: TSettingsPage = {
    name: ParentalControlsPageName.LinkedChildDetails,
    path: linkedChildDetailsPath,
  };
  const childSettingCategoryPages = {
    [SettingCategoryPageName.ContentRestrictions]: {
      name: SettingCategoryPageName.ContentRestrictions,
      path: `${linkedChildDetailsPath}/${SettingCategoryPageName.ContentRestrictions}`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.ContentRestrictions],
    },
    [PrivacySettingName.ContentMaturity]: {
      name: PrivacySettingName.ContentMaturity,
      path: `${linkedChildDetailsPath}/${PrivacySettingName.ContentMaturity}`,
      titleTranslationKey: privacyPageTitles[PrivacySettingName.ContentMaturity],
    },
    [SettingCategoryPageName.Communication]: {
      name: SettingCategoryPageName.Communication,
      path: `${linkedChildDetailsPath}/${SettingCategoryPageName.Communication}`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.Communication],
    },
    [SettingCategoryPageName.Spending]: {
      name: SettingCategoryPageName.Spending,
      path: `${linkedChildDetailsPath}/${SettingCategoryPageName.Spending}`,
      titleTranslationKey: pageTitles[SettingCategoryPageName.Spending],
    },
    [SettingCategoryPageName.VisibilityAndPrivateServers]: {
      name: SettingCategoryPageName.VisibilityAndPrivateServers,
      path: `${linkedChildDetailsPath}/${SettingCategoryPageName.VisibilityAndPrivateServers}`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.VisibilityAndPrivateServers],
    },
    [SettingCategoryPageName.FriendsAndContacts]: {
      name: SettingCategoryPageName.FriendsAndContacts,
      path: `${linkedChildDetailsPath}/${SettingCategoryPageName.FriendsAndContacts}`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.FriendsAndContacts],
    },
    [SettingCategoryPageName.TradingAndInventory]: {
      name: SettingCategoryPageName.TradingAndInventory,
      path: `${linkedChildDetailsPath}/${SettingCategoryPageName.TradingAndInventory}`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.TradingAndInventory],
    },
    [SettingCategoryPageName.ThirdPartyApplications]: {
      name: SettingCategoryPageName.ThirdPartyApplications,
      path: `${linkedChildDetailsPath}/${SettingCategoryPageName.ThirdPartyApplications}`,
      titleTranslationKey: pageTitles[SettingCategoryPageName.ThirdPartyApplications],
    },
    [SettingCategoryPageName.Notifications]: {
      name: SettingCategoryPageName.Notifications,
      path: `${linkedChildDetailsPath}/${SettingCategoryPageName.Notifications}`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.Notifications],
    },
    [PrivacySettingName.BlockedUsers]: {
      name: PrivacySettingName.BlockedUsers,
      path: `${linkedChildDetailsPath}/${PrivacySettingName.BlockedUsers}`,
      titleTranslationKey: privacyPageTitles[PrivacySettingName.BlockedUsers],
    },
    [SettingCategoryPageName.AgeCheck]: {
      name: SettingCategoryPageName.AgeCheck,
      path: `${linkedChildDetailsPath}/${SettingCategoryPageName.AgeCheck}`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.AgeCheck],
    },

    // Top-level Spend Notifications page (Spending Insights)
    [SpendSettingName.SpendNotifications]: {
      name: SpendSettingName.SpendNotifications,
      path: `${linkedChildDetailsPath}/${SpendSettingName.SpendNotifications}`,
      titleTranslationKey: pageTitles[SpendSettingName.SpendNotifications],
    },

    // Top-level Activity Updates page (parent link digest email preference)
    [ParentalControlsPageName.ActivityUpdates]: {
      name: ParentalControlsPageName.ActivityUpdates,
      path: `${linkedChildDetailsPath}/${ParentalControlsPageName.ActivityUpdates}`,
      titleTranslationKey: pageTitles[ParentalControlsPageName.ActivityUpdates],
    },
  };

  const contentRestrictionPages: Record<string, TSettingsPage> = {
    [PrivacySettingName.ContentMaturity]: {
      name: PrivacySettingName.ContentMaturity,
      path: `${childSettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}/${
        PrivacySettingName.ContentMaturity
      }`,
      titleTranslationKey: privacyPageTitles[PrivacySettingName.ContentMaturity],
    },
    [PrivacySettingName.BlockedExperiences]: {
      name: PrivacySettingName.BlockedExperiences,
      path: `${childSettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}/${
        PrivacySettingName.BlockedExperiences
      }`,
      titleTranslationKey: privacyPageTitles[PrivacySettingName.BlockedExperiences],
    },
    [PrivacySettingName.BlockedExperiencesSearch]: {
      name: PrivacySettingName.BlockedExperiencesSearch,
      path: `${childSettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}/${
        PrivacySettingName.BlockedExperiences
      }/${PrivacySettingName.BlockedExperiencesSearch}`,
    },
    [PrivacySettingName.ApprovedExperiences]: {
      name: PrivacySettingName.ApprovedExperiences,
      path: `${childSettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}/${
        PrivacySettingName.ApprovedExperiences
      }`,
      titleTranslationKey: privacyPageTitles[PrivacySettingName.ApprovedExperiences],
    },
    [PrivacySettingName.SensitiveIssues]: {
      name: PrivacySettingName.SensitiveIssues,
      path: `${childSettingCategoryPages[SettingCategoryPageName.ContentRestrictions].path}/${
        PrivacySettingName.SensitiveIssues
      }`,
      titleTranslationKey: privacyPageTitles[PrivacySettingName.SensitiveIssues],
    },
  };

  const communicationPages: Record<string, TSettingsPage> = {
    [SettingCategoryPageName.ExperienceChat]: {
      name: SettingCategoryPageName.ExperienceChat,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Communication].path}/${
        SettingCategoryPageName.ExperienceChat
      }`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.ExperienceChat],
    },
    [SettingCategoryPageName.Party]: {
      name: SettingCategoryPageName.Party,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Communication].path}/${
        SettingCategoryPageName.Party
      }`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.Party],
    },
    [SettingCategoryPageName.PartyAndPartyChat]: {
      name: SettingCategoryPageName.PartyAndPartyChat,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Communication].path}/${
        SettingCategoryPageName.PartyAndPartyChat
      }`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.PartyAndPartyChat],
    },
    [SettingCategoryPageName.PartyAndPartyChatV2]: {
      name: SettingCategoryPageName.PartyAndPartyChatV2,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Communication].path}/${
        SettingCategoryPageName.PartyAndPartyChatV2
      }`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.PartyAndPartyChatV2],
    },
    [SettingCategoryPageName.VoiceDataUsage]: {
      name: SettingCategoryPageName.VoiceDataUsage,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Communication].path}/${
        SettingCategoryPageName.VoiceDataUsage
      }`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.VoiceDataUsage],
    },
    [SettingCategoryPageName.StudioCollaboration]: {
      name: SettingCategoryPageName.StudioCollaboration,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Communication].path}/${
        SettingCategoryPageName.StudioCollaboration
      }`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.StudioCollaboration],
    },
    [SettingCategoryPageName.PresetChat]: {
      name: SettingCategoryPageName.PresetChat,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Communication].path}/${
        SettingCategoryPageName.PresetChat
      }`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.PresetChat],
    },
  };

  const spendingPages: Record<string, TSettingsPage> = {
    [SpendSettingName.AllowPurchases]: {
      name: SpendSettingName.AllowPurchases,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Spending].path}/${
        SpendSettingName.AllowPurchases
      }`,
      titleTranslationKey: pageTitles[SpendSettingName.AllowPurchases],
    },
    [SpendSettingName.MonthlySpendingLimit]: {
      name: SpendSettingName.MonthlySpendingLimit,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Spending].path}/${
        SpendSettingName.MonthlySpendingLimit
      }`,
      titleTranslationKey: pageTitles[SpendSettingName.MonthlySpendingLimit],
    },
    [SpendSettingName.SpendNotifications]: {
      name: SpendSettingName.SpendNotifications,
      path: `${childSettingCategoryPages[SettingCategoryPageName.Spending].path}/${
        SpendSettingName.SpendNotifications
      }`,
      titleTranslationKey: pageTitles[SpendSettingName.SpendNotifications],
    },
  };

  const visibilityAndPrivateServersPages: Record<string, TSettingsPage> = {
    [SettingCategoryPageName.Visibility]: {
      name: SettingCategoryPageName.Visibility,
      path: `${
        childSettingCategoryPages[SettingCategoryPageName.VisibilityAndPrivateServers].path
      }/${PrivacySettingName.WhoCanJoinMeInExperiences}`,
      titleTranslationKey: privacyPageTitles[SettingCategoryPageName.Visibility],
    },
    [PrivacySettingName.PrivateServerPrivacy]: {
      name: PrivacySettingName.PrivateServerPrivacy,
      path: `${
        childSettingCategoryPages[SettingCategoryPageName.VisibilityAndPrivateServers].path
      }/${PrivacySettingName.PrivateServerPrivacy}`,
      titleTranslationKey: privacyPageTitles[PrivacySettingName.PrivateServerPrivacy],
    },
  };

  const consentCenterPage: TSettingsPage = {
    name: ParentalControlsPageName.ConsentCenter,
    path: `${linkedChildDetailsPath}/${ParentalControlsPageName.ConsentCenter}`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.ConsentCenter],
  };

  const friendManagementPage: TSettingsPage = {
    name: ParentalControlsPageName.FriendManagement,
    path: `${linkedChildDetailsPath}/${ParentalControlsPageName.FriendManagement}`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.FriendManagement],
  };

  const editProfilePage: TSettingsPage = {
    name: ParentalControlsPageName.EditChildProfile,
    path: `${linkedChildDetailsPath}/${ParentalControlsPageName.EditChildProfile}`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.EditChildProfile],
  };

  const screenTimeManagementPage: TSettingsPage = {
    name: ParentalControlsPageName.ScreentimeManagement,
    path: `${linkedChildDetailsPath}/${ParentalControlsPageName.ScreentimeManagement}`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.ScreentimeManagement],
  };

  const topGamesPage: TSettingsPage = {
    name: ParentalControlsPageName.TopGames,
    path: getTopGamesPath(childUserId),
    titleTranslationKey: pageTitles[ParentalControlsPageName.TopGames],
  };

  // Registered with its `:universeId` route template so `matchPath`
  // can resolve the page title for back-link rendering. Navigation paths to
  // this page are produced by `getTopGameDetailsPath`.
  const topGameDetailsPage: TSettingsPage = {
    name: ParentalControlsPageName.TopGameDetails,
    path: getTopGameDetailsRoutePath(childUserId),
    titleTranslationKey: pageTitles[ParentalControlsPageName.TopGameDetails],
  };

  return {
    linkedChildDetailsLandingPage,
    childSettingCategoryPages,
    contentRestrictionPages,
    communicationPages,
    spendingPages,
    visibilityAndPrivateServersPages,
    consentCenterPage,
    friendManagementPage,
    editProfilePage,
    screenTimeManagementPage,
    topGamesPage,
    topGameDetailsPage,
  };
};

const getAllPages = (childPagesMap: TChildPagesMap): TSettingsPage[] => {
  // Reduce the childPagesMap object into a single array of TSettingsPage
  const allPages: TSettingsPage[] = Object.values(childPagesMap).reduce<TSettingsPage[]>(
    (pageList: TSettingsPage[], childPages) => {
      const newPages: TSettingsPage[] = [];
      Object.values(childPages).forEach(childPageGroup => {
        if (childPageGroup.path) {
          // The page group is a single page
          newPages.push(childPageGroup as TSettingsPage);
        } else {
          // The page group has multiple pages, as in a category of child pages
          const subpages = Object.values(childPageGroup);
          newPages.push(...subpages);
        }
      });
      return [...pageList, ...newPages];
    },
    [],
  );
  return allPages;
};

const getAllDashboardPages = (childPagesMap: TChildPagesMap): TSettingsPage[] => {
  const detailPages: TSettingsPage[] = Object.values(childPagesMap).map(
    childPages => childPages.linkedChildDetailsLandingPage,
  );
  return detailPages;
};

export const childPagesSlice = createSlice({
  name: "childPages",
  initialState,
  reducers: {
    updateChildPagesState: {
      prepare: (payload: TGetChildrenInfoResponse) => {
        // Maps child user id to their setting pages
        const pagesMap = payload.childrenInfoList.reduce(
          (pages: Record<number, TChildPages>, child) => {
            return {
              ...pages,
              [child.userId]: getChildPages(child.userId),
            };
          },
          {},
        );
        return { payload: pagesMap };
      },
      reducer: (state, action: PayloadAction<TChildPagesMap>) => {
        state.childPagesMap = action.payload;
        state.allChildPages = getAllPages(action.payload);
        state.childDetailLandingPages = getAllDashboardPages(action.payload);
      },
    },
  },
});

export const selectChildPagesForChildUserId = (
  childUserId: number,
): ((state: RootState) => TChildPages | undefined) =>
  createSelector(
    (state: RootState) => state.childPages.childPagesMap,
    (childPagesMap: TChildPagesMap | undefined) => childPagesMap?.[childUserId],
  );

// Get an array of all child pages
export const selectAllChildPages = (state: RootState): TSettingsPage[] =>
  state.childPages.allChildPages;

// Get a map of child user id to their setting pages
export const selectChildPagesMap = (state: RootState): TChildPagesMap | undefined =>
  state.childPages.childPagesMap;

// Gets a list of child detail landing pages (the page where you see an overview of the child)
export const selectChildDetailLandingPages = (state: RootState): TSettingsPage[] =>
  state.childPages.childDetailLandingPages;

export const { updateChildPagesState } = childPagesSlice.actions;
