import ParentalControlsPageName from "../../../../enums/parentalControls/ParentalControlsPageName";
import RobuxSettingName from "../../../../enums/RobuxSettingName";
import SettingCategoryPageName from "../../../../enums/SettingCategoryPageName";
import { TSettingsPage } from "../../../../types/commonTypes";
import { baseParentalControlsPath } from "./parentalControlsConstants";
import parentalControlsTranslationConstants from "../contentConstants/parentalControlsTranslationConstants";

const { pageTitles } = parentalControlsTranslationConstants;

type TParentZonePages = {
  screentimeManagementPage: TSettingsPage;
  topGamesPage: TSettingsPage;
  manageOnDeviceParentPage: TSettingsPage;
  friendManagementPage: TSettingsPage;
  topGameDetailsPage: TSettingsPage;
  robuxPage: TSettingsPage;
  robuxTransferLimitsPage: TSettingsPage;
};

// Pages an on-device parent can reach from Parent Zone. There is only ever one child here, so
// these need no child id in the path.
const topGamesPath = `${baseParentalControlsPath}/${ParentalControlsPageName.TopGames}`;
const robuxPath = `${baseParentalControlsPath}/${SettingCategoryPageName.Robux}`;

export const parentZonePages: TParentZonePages = {
  screentimeManagementPage: {
    name: ParentalControlsPageName.ScreentimeManagement,
    path: `${baseParentalControlsPath}/${ParentalControlsPageName.ScreentimeManagement}`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.ScreentimeManagement],
  },
  topGamesPage: {
    name: ParentalControlsPageName.TopGames,
    path: topGamesPath,
    titleTranslationKey: pageTitles[ParentalControlsPageName.TopGames],
  },
  manageOnDeviceParentPage: {
    name: ParentalControlsPageName.ManageOnDeviceParent,
    path: `${baseParentalControlsPath}/${ParentalControlsPageName.ManageOnDeviceParent}`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.ManageOnDeviceParent],
  },
  friendManagementPage: {
    name: ParentalControlsPageName.FriendManagement,
    path: `${baseParentalControlsPath}/${ParentalControlsPageName.FriendManagement}`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.FriendManagement],
  },
  topGameDetailsPage: {
    name: ParentalControlsPageName.TopGameDetails,
    path: `${topGamesPath}/:universeId`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.TopGameDetails],
  },
  robuxPage: {
    name: SettingCategoryPageName.Robux,
    path: robuxPath,
    titleTranslationKey: pageTitles[SettingCategoryPageName.Robux],
  },
  robuxTransferLimitsPage: {
    name: RobuxSettingName.TransferLimits,
    path: `${robuxPath}/${RobuxSettingName.TransferLimits}`,
    titleTranslationKey: pageTitles[RobuxSettingName.TransferLimits],
  },
};

/** The details page for one experience, with the route parameter filled in. */
export const getParentZoneTopGameDetailsPath = (universeId: number | string): string =>
  `${topGamesPath}/${universeId}`;

export const parentZonePageList: TSettingsPage[] = Object.values(parentZonePages);

export default parentZonePages;
