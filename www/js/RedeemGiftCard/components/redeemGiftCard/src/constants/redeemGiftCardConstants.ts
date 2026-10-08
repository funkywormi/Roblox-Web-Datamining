import { EnvironmentUrls } from "Roblox";
import { urlService } from "core-utilities";

const { billingApi, apiGatewayUrl } = EnvironmentUrls;

export const redeemCodeQueryParamKey = "code";
export const redeemBonusItemURL = "https://help.roblox.com/hc/articles/360000316606";
export const redeemGiftCardURL = "https://help.roblox.com/hc/articles/115005566223";
export const redeemPromoCodeURL = "https://help.roblox.com/hc/articles/360029650831";
export const robloxSafetyURL = "https://about.roblox.com/safety";
export const avatarPageUrl = urlService.getAbsoluteUrl("/my/avatar");
export const buyRobuxPageUrl = urlService.getAbsoluteUrl("/upgrades/robux");
export const supportLinkURL = urlService.getAbsoluteUrl("/support");
export const twentyPercentMoreRobuxUKLayerName = "Payments.BuyRobux.TwentyPercentMoreRobux";
export const twentyPercentMoreRobuxBrazilLayerName =
  "Payments.BuyRobux.TwentyPercentMoreRobux.Brazil";

// Promo codes detection logic as specified in https://jira.rbx.com/browse/PAY-4965
export const promoCodeMarker = "free";
export const legacyPromoCodes = ["spidercola", "tweetroblox"];

export const getRedeemGiftCardMetadataUrlConfig = () => ({
  withCredentials: true,
  url: `${billingApi}/v1/gamecard/redeem/metadata`,
});

export const redeemPaymentsGatewayConfig = () => ({
  withCredentials: true,
  url: `${apiGatewayUrl}/payments-gateway/v1/gift-card/redeem`,
});

export const keyCodeMapping = {
  13: "Enter",
};

export const UNEXPECTED_ERROR_CODE = 0;
export const ALREADY_REDEEMED_ERROR_CODE = 10;
export const INVALID_CODE_ERROR_CODE = 20;
export const NETWORK_ERROR_CODE = 30;
export const OUT_OF_SERVICE_ERROR_CODE = 70;
export const CAPTCHA_REQUIRED_ERROR_CODE = 80;
export const CREDIT_CONVERSION_REQUIRED_ERROR_CODE = 120;
export const UNOWNED_REDEMPTION_ERROR_CODE = 170;

export const gameCardMessageMapping: Record<
  number,
  { translationKey: string; type: "server-error" | "input-error" }
> = {
  [UNEXPECTED_ERROR_CODE]: {
    translationKey: "Response.UnexpectedError",
    type: "server-error",
  },
  [ALREADY_REDEEMED_ERROR_CODE]: {
    translationKey: "Response.AlreadyRedeemedCodeFullError",
    type: "input-error",
  },
  [INVALID_CODE_ERROR_CODE]: {
    translationKey: "Response.InvalidCode",
    type: "input-error",
  },
  [NETWORK_ERROR_CODE]: {
    translationKey: "Response.NetworkError",
    type: "server-error",
  },
  [OUT_OF_SERVICE_ERROR_CODE]: {
    translationKey: "Response.OutOfService",
    type: "server-error",
  },
  [CAPTCHA_REQUIRED_ERROR_CODE]: {
    translationKey: "Response.NeedCaptcha",
    type: "input-error",
  },
  [CREDIT_CONVERSION_REQUIRED_ERROR_CODE]: {
    translationKey: "Response.RedeemGiftCardCurrencyCodeNotMatchV2",
    type: "input-error",
  },
  [UNOWNED_REDEMPTION_ERROR_CODE]: {
    translationKey: "Response.InvalidCard",
    type: "input-error",
  },
};

export const eventTypes = {
  pageLoaded: "redeemGiftCardPageLoaded",
  redeemClicked: "redeemGiftCardRedeemButtonClicked",
  redeemGiftCardScanSuccess: "redeemGiftCardScanSuccess",
  redeemGiftCardScanFailure: "redeemGiftCardScanFailure",
  codeRedeemStarted: "redeemGiftCardCodeRedemptionStarted",
  codeRedeemSuccess: "redeemGiftCardCodeRedemptionSucceeded",
  codeRedeemFailure: "redeemGiftCardCodeRedemptionFailed",
  successModalOpened: "redeemGiftCardCodeRedemptionSuccessModalOpened",
  successModalClosed: "redeemGiftCardCodeRedemptionSuccessModalClosed",
  equipAvatarClicked: "redeemGiftCardEquipAvatarClicked",
  getRobuxClicked: "redeemGiftCardGetRobuxClicked",
  redeemAgainClicked: "redeemGiftCardBackToRedeemClicked",
  convertCreditClicked: "redeemGiftCardConvertToRobuxButtonClicked",
  convertCreditStarted: "redeemGiftCardConvertCreditStarted",
  convertCreditSuccess: "redeemGiftCardConvertCreditSucceeded",
  convertCreditFailure: "redeemGiftCardConvertCreditFailed",
  confirmConvertModalOpened: "redeemGiftCardConfirmConvertModalOpened",
  confirmConvertModalClosed: "redeemGiftCardConfirmConvertModalClosed",
  convertCancelled: "redeemGiftCardConvertCancelClicked",
  convertConfirmed: "redeemGiftCardConvertConfirmClicked",
  convertCreditSuccessBanner: "redeemGiftCardConvertCreditSuccessBanner",
  convertCreditFailureBanner: "redeemGiftCardConvertCreditFailureBanner",
  continueClicked: "redeemGiftCardConversionContinueButtonClicked",
  creditConversionCancelClicked: "redeemGiftCardConversionCancelButtonClicked",
};

export const eventStreamNames = {
  redeemGiftCard: "redeemGiftCard",
};

export const RedeemInstructionsYoutubeVideoIdByLocale: Record<string, string> & {
  default: string;
} = {
  us: "KTOvZZHfODM",
  ar: "BzVLph6iFhc",
  es: "9fTANNYEPLg",
  pt: "fZOQfeoKr6c",
  ko: "D4VjNHfvEQE",
  ja: "r441yJvOyNY",
  it: "OCn3V770J2Q",
  de: "7IkNhJa3Sno",
  fr: "0i6PW5cWD08",
  default: "KTOvZZHfODM", // same as `us`
};
