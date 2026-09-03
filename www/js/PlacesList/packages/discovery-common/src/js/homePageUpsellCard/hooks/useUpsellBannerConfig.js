import {
  UpsellCardActionType,
  UpsellCardComponentType,
  UpsellCardBadgeType,
  UpsellCardType,
} from "../constants/upsellCardConstants";
import {
  UpsellPurpose,
  UpsellStage,
} from "../../../ts/homePageUpsellCard/constants/upsellAnalyticsConstants";
import getCardComponentType from "../utils/upsellCardUtils";
import isCompactUpsellBannerConfig from "../../../ts/homePageUpsellCard/utils/isCompactUpsellBannerConfig";

const badgeConfig = {
  [UpsellCardBadgeType.Countdown]: {
    iconClassName: "icon-filled-clock",
  },
};

const cardTypeConfig = {
  [UpsellCardType.AgeVerificationModal]: {
    iconClassNames: {
      full: "icon-regular-speech-bubble-align-center",
      compact: "icon-regular-shield-check",
    },
  },
};

const buttonActionTypeConfig = {
  [UpsellCardActionType.OpenFAEUpsell]: {
    variant: "Emphasis",
  },
  [UpsellCardActionType.OpenFAEViewDetails]: {
    variant: "ActionUtility",
  },
  [UpsellCardActionType.Dismiss]: {
    variant: "ActionUtility",
  },
};

const analyticsConfigByCardType = {
  [UpsellCardType.AgeVerificationModal]: {
    upsellPurpose: UpsellPurpose.FacialAgeEstimation,
    upsellStage: UpsellStage.Fae,
  },
};

const useUpsellBannerConfig = (upsellCardType, upsellCardV2Config, actionTypeToCallback) => {
  const upsellCardComponentType = getCardComponentType(upsellCardType);

  const badges = upsellCardV2Config?.label_items || [];
  const badgePropsArray = badges.map(badge => ({
    text: badge.metadata?.countdown_text || "",
    iconClassName: badgeConfig[badge.type]?.iconClassName,
  }));

  const buttons = upsellCardV2Config?.buttons || [];
  const buttonPropsArray = buttons
    .filter(button => actionTypeToCallback[button.action.type])
    .map(button => ({
      text: button.text || "",
      onClick: actionTypeToCallback[button.action.type],
      variant: buttonActionTypeConfig[button.action.type]?.variant || "ActionUtility",
    }));

  const isCompactBanner = isCompactUpsellBannerConfig({
    badgePropsArray,
    buttonPropsArray,
    dismissible: upsellCardV2Config?.dismissible,
    bodyText: upsellCardV2Config?.body?.text,
  });
  const iconClassName = isCompactBanner
    ? cardTypeConfig[upsellCardType]?.iconClassNames?.compact
    : cardTypeConfig[upsellCardType]?.iconClassNames?.full;

  if (upsellCardComponentType === UpsellCardComponentType.UpsellBanner) {
    return {
      badgePropsArray,
      buttonPropsArray,
      titleText: upsellCardV2Config?.header?.text || "",
      bodyText: upsellCardV2Config?.body?.text,
      iconClassName,
      dismissible: upsellCardV2Config?.dismissible || false,
      cardTypeAnalyticsFields: analyticsConfigByCardType[upsellCardType] || {},
    };
  }

  return {
    badgePropsArray: [],
    buttonPropsArray: [],
    titleText: "",
    dismissible: false,
    cardTypeAnalyticsFields: {},
  };
};

export default useUpsellBannerConfig;
