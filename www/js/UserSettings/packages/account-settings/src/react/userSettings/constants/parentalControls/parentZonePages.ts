import ParentalControlsPageName from "../../../../enums/parentalControls/ParentalControlsPageName";
import { TSettingsPage } from "../../../../types/commonTypes";
import { baseParentalControlsPath } from "./parentalControlsConstants";
import parentalControlsTranslationConstants from "../contentConstants/parentalControlsTranslationConstants";

const { pageTitles } = parentalControlsTranslationConstants;

type TParentZonePages = {
  topGamesPage: TSettingsPage;
  manageOnDeviceParentPage: TSettingsPage;
};

// Pages an on-device parent can reach from Parent Zone. There is only ever one child here, so
// these need no child id in the path.
export const parentZonePages: TParentZonePages = {
  topGamesPage: {
    name: ParentalControlsPageName.TopGames,
    path: `${baseParentalControlsPath}/${ParentalControlsPageName.TopGames}`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.TopGames],
  },
  manageOnDeviceParentPage: {
    name: ParentalControlsPageName.ManageOnDeviceParent,
    path: `${baseParentalControlsPath}/${ParentalControlsPageName.ManageOnDeviceParent}`,
    titleTranslationKey: pageTitles[ParentalControlsPageName.ManageOnDeviceParent],
  },
};

export const parentZonePageList: TSettingsPage[] = Object.values(parentZonePages);

export default parentZonePages;
