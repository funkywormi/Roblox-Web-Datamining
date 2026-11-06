export const emailRootElementId = "verificationUpsell-container";
export const phoneRootElementId = "phoneVerificationUpsell-container";
export const contactMethodPromptRootElementId = "contactMethodPrompt-container";
export const ageEstimationPromptRootElementId = "ageEstimationPrompt-container";

export const translation = {
  common: ["Feature.AccountSettings"],
  feature: "Feature.VerificationUpsell",
};

export const PHONE_UPSELL_TRANSLATION_NAMESPACES = [
  "Feature.VerificationUpsell",
  "Feature.AccountSettings",
  "CommonUI.Controls",
] as const;
