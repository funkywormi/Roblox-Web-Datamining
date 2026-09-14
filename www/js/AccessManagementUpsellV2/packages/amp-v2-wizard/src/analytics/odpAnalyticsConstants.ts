export const OdpEventContext = {
  VerifyMethod: "odpVerifyMethod",
} as const;

export const OdpEventName = {
  ButtonClick: "authButtonClick",
  FormInteraction: "authFormInteraction",
  ModalShown: "authModalShown",
} as const;

export const OdpEventField = {
  VerifyMethod: "verifyMethod",
} as const;

export const OdpEventButton = {
  Continue: "continue",
} as const;

export const OdpAssociatedText = {
  VerificationMethodSelector: "Identity verification - Choose a verification method",
  VerificationMethodOptions: "Facial age estimation / Credit card / Government ID",
  VerificationMethodContinue: "Continue",
} as const;

/** The name the backend's age-group rule is configured under. */
export const AgeGroupKey = "ageGroup";
