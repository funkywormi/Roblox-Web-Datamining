type TConfig = {
  common: string[];
  feature: string;
};
export const signupTranslationConfig: TConfig = {
  common: [
    "Common.Captcha",
    "CommonUI.Controls",
    "Feature.Landing",
    "Authentication.AccountSwitch",
  ],
  feature: "Authentication.SignUp",
};

export const landingTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Feature.Landing",
};

export const idVerificationTranslationConfig: TConfig = {
  common: [],
  feature: "Feature.IdVerification",
};

export const oneTimePassTranslationConfig: TConfig = {
  common: [],
  feature: "Authentication.OneTimePasscode",
};

// The page root's provider needs the union of every namespace its subtree reads, since one
// provider serves them all; the per-feature configs above stay as the record of who needs what.
// A flat list, not { common, features }: validateTranslationConfig rejects a config carrying
// both `feature` and `features`, and the exported type requires `feature`.
export const landingPageProviderConfig: string[] = [
  "Common.Captcha",
  "CommonUI.Controls",
  "Authentication.AccountSwitch",
  "Authentication.SignUp",
  "Feature.Landing",
  "Feature.IdVerification",
  "Authentication.OneTimePasscode",
];

export default {
  landingPageProviderConfig,
  signupTranslationConfig,
  landingTranslationConfig,
  idVerificationTranslationConfig,
  oneTimePassTranslationConfig,
};
