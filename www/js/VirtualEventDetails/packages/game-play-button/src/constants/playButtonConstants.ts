import { TPlayabilityStatusWithUnplayableError } from "../types/playButtonTypes";
import { PlayabilityStatus } from "./playabilityStatus";

// NOTE: This does not override the true event name since it is set in:
// Roblox.CoreScripts.WebApp/Roblox.CoreScripts.WebApp/js/core/services/playGames/playGameService.js
// Roblox.GameLaunch.WebApp/Roblox.GameLaunch.WebApp/js/gamePlayEvents.js
const eventStreamProperties = (
  placeId: string,
  eventProperties: Record<string, string | number | undefined>,
): {
  eventName: string;
  ctx: string;
  properties: Record<string, string | number | undefined> & { placeId: string };
  gamePlayIntentEventCtx: string;
} => ({
  eventName: "playGameClicked",
  ctx: "click",
  properties: {
    ...eventProperties,
    placeId,
  },
  gamePlayIntentEventCtx: "PlayButton",
});

const playButtonErrorStatusTranslationMap: Record<TPlayabilityStatusWithUnplayableError, string> = {
  [PlayabilityStatus.UnplayableOtherReason]: "UnplayableError.UnplayableOther",
  [PlayabilityStatus.TemporarilyUnavailable]: "UnplayableError.TemporarilyUnavailable",
  [PlayabilityStatus.GameUnapproved]: "UnplayableError.GameUnapproved",
  [PlayabilityStatus.IncorrectConfiguration]: "UnplayableError.IncorrectConfiguration",
  [PlayabilityStatus.UniverseRootPlaceIsPrivate]: "UnplayableError.CreatorHasntMadeAvailable",
  [PlayabilityStatus.InsufficientPermissionFriendsOnly]:
    "UnplayableError.CreatorHasntMadeAvailable",
  [PlayabilityStatus.InsufficientPermissionGroupOnly]: "UnplayableError.CreatorHasntMadeAvailable",
  [PlayabilityStatus.DeviceRestricted]: "UnplayableError.DeviceRestrictedDefault",
  [PlayabilityStatus.FiatPurchaseDeviceRestricted]: "UnplayableError.FiatPurchaseDeviceRestricted",
  [PlayabilityStatus.UnderReview]: "UnplayableError.Moderated",
  [PlayabilityStatus.AccountRestricted]: "UnplayableError.AccountRestricted",
  [PlayabilityStatus.ComplianceBlocked]: "UnplayableError.ComplianceBlocked",
  [PlayabilityStatus.ContextualPlayabilityRegionalAvailability]:
    "UnplayableError.ContextualPlayabilityRegionalAvailability",
  [PlayabilityStatus.ContextualPlayabilityRegionalCompliance]:
    "UnplayableError.ContextualPlayabilityRegionalCompliance",
  [PlayabilityStatus.ContextualPlayabilityAgeRecommendationParentalControls]:
    "UnplayableError.ContextualPlayabilityAgeRecommendationParentalControls",
  [PlayabilityStatus.ContextualPlayabilityAgeGated]:
    "UnplayableError.ContextualPlayabilityAgeGated",
  [PlayabilityStatus.PlaceHasNoPublishedVersion]: "UnplayableError.CreatorHasntMadeAvailable",
  [PlayabilityStatus.ContextualPlayabilityUnrated]: "UnplayableError.ContextualPlayabilityUnrated",
  [PlayabilityStatus.ContextualPlayabilityAgeGatedByDescriptor]:
    "UnplayableError.ContextualPlayabilityAgeGatedByDescriptor",
  [PlayabilityStatus.ContextualPlayabilityExperienceBlockedParentalControls]:
    "UnplayableError.ContextualPlayabilityExperienceBlockedParentalControls",
  [PlayabilityStatus.ContextualPlayabilityRequireParentApproval]:
    "UnplayableError.ContextualPlayabilityRequireParentApproval",
};

const playButtonTextTranslationMap = {
  Unlock: "PlayButtonText.Unlock",
  Unplayable: "PlayButtonText.Unavailable",
  Buy: "PlayButtonText.Buy",
  PlayDemo: "PlayButtonText.PlayDemo",
};

const counterEvents = {
  ActionNeeded: "ActionNeededButtonShown",
  Unplayable: "UnplayableErrorShown",
  SeventeenPlusInPlayable: "ReachedSeventeenPlusCaseInPlayable",
  PlayButtonUpsellSelfUpdateSettingTriggered: "PlayButtonUpsellSelfUpdateSettingTriggered",
  PlayButtonUpsellAskYourParentTriggered: "PlayButtonUpsellAskYourParentTriggered",
  PlayButtonUpsellRestrictedUnplayableTriggered: "PlayButtonUpsellRestrictedUnplayableTriggered",
  PlayButtonUpsellAgeRestrictionVerificationTriggered:
    "PlayButtonUpsellAgeRestrictionVerificationTriggered",
  PlayButtonUpsellUnknownSettingOrAge: "PlayButtonUpsellUnknownSettingOrAge",
  PlayButtonUpsellMinimalMaturityRating: "PlayButtonUpsellMinimalMaturityRating",
  PlayButtonUpsellAgeNotInMapping: "PlayButtonUpsellAgeNotInMapping",
  PlayButtonUpsellParentalConsentError: "PlayButtonUpsellParentalConsentError",
  PlayButtonUpsellAgeRestrictionVerificationError:
    "PlayButtonUpsellAgeRestrictionVerificationError",
  PlayButtonUpsellUnknownRequirement: "PlayButtonUpsellUnknownRequirement",
  PlayButtonUpsellExperienceApprovalTriggered: "PlayButtonUpsellExperienceApprovalTriggered",
  PlayButtonUpsellExperienceApprovalError: "PlayButtonUpsellExperienceApprovalError",
  PreparePurchaseUrlError: "PreparePurchaseUrlError",
  PlayButtonShowIdentificationError: "PlayButtonShowIdentificationIssueCaught",
  PlayabilityStatusFetchInvalidUniverseId: "PlayabilityStatusFetchInvalidUniverseId",
  PlayabilityStatusFetchInvalidResponse: "PlayabilityStatusFetchInvalidResponse",
  PlayabilityStatusFetchFailed: "PlayabilityStatusFetchFailed",
  PlayableUxTreatmentMalformedData: "PlayableUxTreatmentMalformedData",
  PlayableUxTreatmentUnknownTreatment: "PlayableUxTreatmentUnknownTreatment",
  PlayableUxTreatmentPlayabilityStatusStillLoading:
    "PlayableUxTreatmentPlayabilityStatusStillLoading",
};

const avatarChatUpsellLayer = "Voice.AvatarChat.Upsell";
const avatarChatUpsellLayerU13 = "Voice.AvatarChat.U13Upsell";
const playButtonLayer = "Website.PlayButton";

const ageCheckUpsellFeatureName = "TriggerAgeCheckUpsellIncludingVPC";
const ageCheckUpsellNamespace = "core_content/CoreContent";

const unlockPlayIntentConstants = {
  eventName: "unlockPlayIntent",
  ageCheckUpsellName: "AgeCheckRequired",
  gameLaunchFallbackUpsellName: "GameLaunch",
  restrictedUnplayableUpsellName: "RestrictedUnplayableOptionNotFound",
  unverifiedSeventeenPlusUpsellName: "AgeVerificationUnverifiedSeventeenPlusUser",
  fiatPurchaseUpsellName: "FiatPurchase",
  reconfirmLaunchModalUpsellName: "ReconfirmLaunchModal",
  experienceApprovalUpsellName: "ExperienceApproval",
};

const playButtonUpsellContexts = {
  gameJoinAgeCheckRequired: "gameJoinAgeCheckRequired",
  gameJoinContentMaturityLock: "gameJoinContentMaturityLock",
};

export const FeatureExperienceDetails = {
  PlayButtonMessageAgreeToNotice: "PlayButtonMessage.AgreeToNotice",
};

const defaultAfReferralProperties = {
  pid: "experiencestart_mobileweb",
  is_retargeting: "false",
};

export default {
  playButtonErrorStatusTranslationMap,
  playButtonTextTranslationMap,
  eventStreamProperties,
  counterEvents,
  avatarChatUpsellLayer,
  avatarChatUpsellLayerU13,
  playButtonLayer,
  unlockPlayIntentConstants,
  FeatureExperienceDetails,
  defaultAfReferralProperties,
  playButtonUpsellContexts,
  ageCheckUpsellFeatureName,
  ageCheckUpsellNamespace,
};
