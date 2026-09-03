import type { EventContext } from "@rbx/unified-logging";
import { PlayabilityStatus } from "../constants/playabilityStatus";
import { IgrsRating } from "../constants/igrsRating";

export type ValueOf<T> = T[keyof T];
export type TPlayabilityStatuses = typeof PlayabilityStatus;
export type TPlayabilityStatus = keyof typeof PlayabilityStatus;
export type TPlayabilityStatusWithUnplayableError = Exclude<
  TPlayabilityStatus,
  | TPlayabilityStatuses["Playable"]
  | TPlayabilityStatuses["GuestProhibited"]
  | TPlayabilityStatuses["PurchaseRequired"]
  | TPlayabilityStatuses["ContextualPlayabilityUnverifiedSeventeenPlusUser"]
  | TPlayabilityStatuses["ContextualPlayabilityAgeCheckRequired"]
  | TPlayabilityStatuses["ContextualPlayabilityCoreGated"]
  | TPlayabilityStatuses["FiatPurchaseRequired"]
>;

export type TPlayabilityStatusPurchaseRequired =
  | TPlayabilityStatuses["PurchaseRequired"]
  | TPlayabilityStatuses["FiatPurchaseRequired"];

export type TPlayButtonPageContext = EventContext | "UNKNOWN";

type TFiatPurchaseData = {
  localizedFiatPrice: string;
  basePriceId: string;
};

export type TGetProductDetails = {
  placeId: number;
  name: string;
  description: string;
  url: string;
  builder: string;
  builderId: number;
  isPlayable: boolean;
  reasonProhibited: string;
  universeId: number;
  universeRootPlaceId: number;
  price: number;
  imageToken: string;
  fiatPurchaseData?: TFiatPurchaseData;
};

export type TGetProductInfo = {
  universeId: number;
  isForSale: boolean;
  productId: number;
  price: number;
  sellerId: number;
};

export const PlayableUxTreatmentEnum = {
  ReconfirmLaunchModal: "reconfirmLaunchModal",
} as const;

export type TPlayableUxTreatmentData = {
  titleText: string;
  bodyText: string;
  primaryActionText: string;
  secondaryActionText: string;
};

export type TPlayableUxTreatment = {
  treatment: string;
  data?: Record<string, string>;
};

export const UpsellUxTreatmentEnum = {
  AgeCheckUpsell: "ageCheckUpsell",
} as const;

export type TUpsellUxTreatmentData = {
  bodyText: string;
};

export type TUpsellUxTreatment = {
  treatment: string;
  data?: Record<string, string>;
};

export type TGetPlayabilityStatus = {
  playabilityStatus: TPlayabilityStatus;
  isPlayable: boolean;
  universeId: number;
  unplayableDisplayText: string | null;
  playableUxTreatment?: TPlayableUxTreatment;
  upsellUxTreatment?: TUpsellUxTreatment;
  demoModeAvailable?: boolean;
};

export type TGuacPlayButtonUIResponse = {
  playButtonOverlayWebFlag: boolean;
  voiceOptInWebFlag: boolean;
  cameraOptInWebFlag: boolean;
  cameraOptInWebFlagU13: boolean;
  requireExplicitVoiceConsent: boolean;
  useCameraU13Design: boolean;
  useVoiceUpsellV2Design: boolean;
  useExperienceApprovalForParentalConsent: boolean;
};

export type TUniversePlaceVoiceEnabledSettings = {
  isUniverseEnabledForVoice: boolean;
  isUniverseEnabledForAvatarVideo: boolean;
};

export type TShowAgeVerificationOverlayResponse = {
  universePlaceVoiceEnabledSettings: TUniversePlaceVoiceEnabledSettings;
  elegibleToSeeVoiceUpsell: boolean;
  showAgeVerificationOverlay: boolean;
  showVoiceOptInOverlay: boolean;
  showAvatarVideoOptInOverlay: boolean;
  requireExplicitVoiceConsent: boolean;
  useCameraU13Design: boolean;
  useVoiceUpsellV2Design: boolean;
};

export type TPostOptUserInToVoiceChatResponse = {
  isUserOptIn: boolean;
};

export type TAgeRestrictionSettingOptionValue =
  | "NinePlus"
  | "ThirteenPlus"
  | "SeventeenPlus"
  | "EighteenPlus";

type TSettingOption = {
  option: {
    optionValue: TAgeRestrictionSettingOptionValue;
  };
  requirement: string;
};

export type TSettingResponse = {
  currentValue: TAgeRestrictionSettingOptionValue;
  options: TSettingOption[];
};

export type TGetUserSettingsAndOptionsResponse = Record<string, TSettingResponse>;

export type TContentMaturityRating = "minimal" | "mild" | "moderate" | "restricted" | "unrated";

type TExperienceDescriptor = {
  name: string;
  displayName: string;
};

type TExperienceDescriptorUsage = {
  contains?: boolean;
  name: string;
  descriptor: TExperienceDescriptor;
};

export type TAgeRecommendationDetails = {
  summary: {
    ageRecommendation: {
      displayName: string;
      displayNameWithHeaderShort: string;
      minimumAge: number;
      igrsRating?: IgrsRating;
      igrsRatingDisplayMessage?: string;
      contentMaturity?: TContentMaturityRating;
    } | null;
  };
  descriptorUsages: TExperienceDescriptorUsage[] | null;
};

export type TAgeGuidelinesResponse = {
  headerDisplayName: string;
  headerDisplayNameShort: string;
  ageRecommendationDetails: TAgeRecommendationDetails | null;
};

export type TFiatPreparePurchaseResponse = {
  checkoutUrl: string;
};

export type TFiatPreparePurchaseCheckoutUrl = {
  checkoutUrl: string;
  CheckoutUrl: string;
};

export type TAppsFlyerReferralProperties = Record<string, string | number>;
