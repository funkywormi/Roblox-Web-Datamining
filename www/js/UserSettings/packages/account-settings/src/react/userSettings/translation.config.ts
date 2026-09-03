type TConfig = {
  common: string[];
  feature: string;
};

export const accountSettingstranslationConfig: TConfig = {
  common: [
    "CommonUI.Controls",
    "CommonUI.Features",
    "Feature.Parents",
    "Feature.Friends",
    "Feature.DisplayName",
    "Feature.Screentime",
    "Feature.DoNotDisturb",
    "AccountIdentity.AgeCheck",
    "Feature.SocialLinks",
    "Amp.FAEUpsell",
    "Feature.Accessibility",
    "Feature.RobloxSubscription",
    "Authentication.LinkedAccounts",
  ],
  feature: "Feature.AccountSettings",
};
export const authSocialTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Authentication.Social",
};
export const premiumTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Feature.Premium",
};
export const displayNameTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Feature.DisplayName",
};
export const twoStepVerificationTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Authentication.TwoStepVerification",
};
export const idVerificationTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Feature.IdVerification",
};
