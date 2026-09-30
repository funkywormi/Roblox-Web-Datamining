export const OdpEventContext = {
  Handoff: "odpHandoff",
  Intro: "odpIntro",
  VerifyMethod: "odpVerifyMethod",
} as const;

export const OdpEventName = {
  Pageload: "authPageload",
  ButtonClick: "authButtonClick",
  FormInteraction: "authFormInteraction",
  ModalShown: "authModalShown",
} as const;

export const OdpEventField = {
  VerifyMethod: "verifyMethod",
  VerificationFailed: "verificationFailed",
} as const;

export const OdpEventButton = {
  ContinueAsParent: "continueAsParent",
  Back: "back",
  Continue: "continue",
  Terms: "terms",
  Privacy: "privacy",
} as const;

export const OdpAssociatedText = {
  AgreementScreen:
    "Parent mode - Your child is asking for parental approval. Let's get you set up. / Millions of kids play Roblox every day / Safety is built in",
  AgreementContinue: "Continue",
  AgreementBack: "< back chevron",
  AgreementTerms: "Terms of Use",
  AgreementPrivacy: "Privacy Policy",
  VerificationMethodSelector: "Identity verification - Choose a verification method",
  VerificationMethodOptions: "Facial age estimation / Credit card / Government ID",
  VerificationMethodContinue: "Continue",
  VerificationMethodBack: "< back chevron",
  VerificationFailed: "Verification failed - Try again later",
} as const;

/** The name the backend's age-group rule is configured under. */
export const AgeGroupKey = "ageGroup";

/** The ODP intro copy treatment configured by the flow provider. */
export const OdpIntroCopyVariantKey = "copyVariant";

/** The standard agreement screen is the current and fallback treatment. */
export const DefaultOdpIntroCopyVariant = "default";
