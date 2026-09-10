type TConfig = {
  common: string[];
  feature: string;
};
export const loginTranslationConfig: TConfig = {
  common: [
    "Common.Captcha",
    "CommonUI.Controls",
    "Authentication.AccountSwitch",
    "Feature.Landing",
  ],
  feature: "Authentication.Login",
};

export const screentimeTranslationConfig: TConfig = {
  common: [],
  feature: "Feature.Screentime",
};

export const idVerificationTranslationConfig: TConfig = {
  common: [],
  feature: "Feature.IdVerification",
};

export const accountSwitchingTranslationConfig: TConfig = {
  common: ["CommonUI.Controls"],
  feature: "Authentication.AccountSwitch",
};

// The page root's provider needs the union of every namespace its subtree reads.
// A flat list, not { common, features }: validateTranslationConfig rejects a config carrying
// both `feature` and `features`, and the exported type requires `feature`.
export const loginPageProviderConfig: string[] = [
  "Common.Captcha",
  "CommonUI.Controls",
  "Authentication.AccountSwitch",
  "Authentication.Login",
  "Feature.Landing",
  "Feature.IdVerification",
];

export default {
  loginPageProviderConfig,
  loginTranslationConfig,
  screentimeTranslationConfig,
  idVerificationTranslationConfig,
  accountSwitchingTranslationConfig,
};
