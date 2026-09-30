export const OdpEventContext = {
  Handoff: "odpHandoff",
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
} as const;

export const OdpAssociatedText = {
  VerificationMethodSelector: "Identity verification - Choose a verification method",
  VerificationMethodOptions: "Facial age estimation / Credit card / Government ID",
  VerificationMethodContinue: "Continue",
  VerificationMethodBack: "< back chevron",
  VerificationFailed: "Verification failed - Try again later",
} as const;

/** The name the backend's age-group rule is configured under. */
export const AgeGroupKey = "ageGroup";
