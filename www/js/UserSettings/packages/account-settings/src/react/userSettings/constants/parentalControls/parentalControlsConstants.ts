import { ContentControls, CurrencyCode, SpendNotificationSetting } from "@rbx/user-settings";
import { TChildInfo, TGetChildrenInfoResponse } from "../../../../types/childrenInfoTypes";
import ContentMaturityLevel from "../../../../enums/parentalControls/ContentMaturityLevel";
import ParentalControlsPageName from "../../../../enums/parentalControls/ParentalControlsPageName";
import RouterPath from "../../../../enums/RouterPath";
import { TRadioButtonOption } from "../../../common/components/RadioButtonOptions";
import parentalControlsTranslationConstants from "../contentConstants/parentalControlsTranslationConstants";

export const baseParentalControlsPath = `/${RouterPath.ParentalControls}`;

export const getLinkedChildDetailsPath = (childUserId: number): string =>
  // If this is changed, also update the parsing logic in getCurrentChildDisplayName
  // As well as getChildSettingUrl urlConstants.ts in Roblox.ParentalConsent.WebApp
  `${baseParentalControlsPath}/${ParentalControlsPageName.LinkedChildDetails}-${childUserId}`;

export const getTopGamesPath = (childUserId: number): string =>
  `${getLinkedChildDetailsPath(childUserId)}/${ParentalControlsPageName.TopGames}`;

export const getTopGameDetailsPath = (childUserId: number, universeId: number | string): string =>
  `${getTopGamesPath(childUserId)}/${universeId}`;

export const getTopGameDetailsRoutePath = (childUserId: number): string =>
  `${getTopGamesPath(childUserId)}/:universeId`;

export const getCurrentChild = (
  pathname: string,
  childrenInfo: TGetChildrenInfoResponse | undefined,
): TChildInfo | undefined => {
  const childIdMatch = new RegExp(`/${ParentalControlsPageName.LinkedChildDetails}-(\\d+)`).exec(
    pathname,
  );
  if (!childIdMatch) return undefined;

  const childId = Number(childIdMatch[1]);
  const child = childrenInfo?.childrenInfoList.find((c: TChildInfo) => c.userId === childId);
  return child;
};

export default {
  getContentMaturityToContentControlsMap: (): Map<ContentMaturityLevel, ContentControls> => {
    const mapping = new Map<ContentMaturityLevel, ContentControls>([
      [ContentMaturityLevel.Minimal, ContentControls.AllAges],
      [ContentMaturityLevel.Mild, ContentControls.NinePlus],
      [ContentMaturityLevel.Moderate, ContentControls.ThirteenPlus],
      [ContentMaturityLevel.Restricted, ContentControls.SeventeenPlus],
    ]);
    return mapping;
  },
  getContentControlsToContentMaturityMap: (): Map<ContentControls, ContentMaturityLevel> => {
    const mapping = new Map<ContentControls, ContentMaturityLevel>([
      [ContentControls.AllAges, ContentMaturityLevel.Minimal],
      [ContentControls.NinePlus, ContentMaturityLevel.Mild],
      [ContentControls.ThirteenPlus, ContentMaturityLevel.Moderate],
      [ContentControls.SeventeenPlus, ContentMaturityLevel.Restricted],
    ]);
    return mapping;
  },
  getAllowedExperienceOptions: (
    disabled: boolean,
    shouldDisplay17Plus: boolean,
  ): TRadioButtonOption[] => {
    const { allowedExperience } = parentalControlsTranslationConstants;
    const age13Option: TRadioButtonOption = {
      label: allowedExperience.age13,
      value: ContentControls.ThirteenPlus,
      id: "content-controls-13",
      name: "13",
      disabled,
    };
    const age9Option: TRadioButtonOption = {
      label: allowedExperience.age9,
      value: ContentControls.NinePlus,
      id: "content-controls-9",
      name: "9",
      disabled,
    };
    const allAgeOption: TRadioButtonOption = {
      label: allowedExperience.allAge,
      value: ContentControls.AllAges,
      id: "content-controls-all-age",
      name: "allAge",
      disabled,
    };
    const age17Option: TRadioButtonOption = {
      label: allowedExperience.age17,
      value: ContentControls.SeventeenPlus,
      id: "content-controls-17",
      name: "17",
      disabled,
    };
    const age18Option: TRadioButtonOption = {
      label: allowedExperience.age18,
      value: ContentControls.EighteenPlus,
      id: "content-controls-18",
      name: "18",
      disabled,
    };
    // Not display age 18 now
    const allowedExperienceOptions = [age13Option, age9Option, allAgeOption];
    if (shouldDisplay17Plus) {
      allowedExperienceOptions.unshift(age17Option);
    }
    return allowedExperienceOptions;
  },
  contentAgeRestrictionSettingName: "contentAgeRestriction",
  spendControls: {
    defaultMaxMonthlySpendLimit: 10000,
    defaultCutoffAge: 13,
    defaultCurrencyCode: CurrencyCode.USD,
    getSpendNotificationsOptions: (disabled: boolean): TRadioButtonOption[] => {
      const allNotifications: TRadioButtonOption = {
        label: parentalControlsTranslationConstants.spendControls.allTransactionsLabel,
        value: SpendNotificationSetting.AllNotifications,
        id: "all-notifications",
        name: "allNotifications",
        disabled,
      };
      const highSpendNotifications: TRadioButtonOption = {
        label: parentalControlsTranslationConstants.spendControls.highSpendAlertsLabel,
        value: SpendNotificationSetting.Default,
        id: "default-notifications",
        name: "defaultNotifications",
        disabled,
      };
      const noNotifications: TRadioButtonOption = {
        label: parentalControlsTranslationConstants.spendControls.noTransactionsLabel,
        value: SpendNotificationSetting.NotificationsOff,
        id: "no-notifications",
        name: "noNotifications",
        disabled,
      };
      return [allNotifications, highSpendNotifications, noNotifications];
    },
  },
  enableBackLinkInterruptEventName: "enableBackLinkInterruptEvent",
  disableBackLinkInterruptEventName: "disableBackLinkInterruptEvent",
};
