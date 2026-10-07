export const OdpEventContext = {
  GameJoinContentMaturityLock: "gameJoinContentMaturityLock",
  ParentalEntrySettings: "parentalEntrySettings",
  Handoff: "odpHandoff",
  Intro: "odpIntro",
  VerifyMethod: "odpVerifyMethod",
  PinEntry: "odpPinEntry",
  PinRecovery: "odpPinRecovery",
} as const;

export const OdpEventName = {
  Pageload: "authPageload",
  ButtonClick: "authButtonClick",
  FormInteraction: "authFormInteraction",
  ModalShown: "authModalShown",
  MsgShown: "authMsgShown",
} as const;

export const OdpEventField = {
  AskParent: "askParent",
  RequestSentToast: "requestSentToast",
  VerifyMethod: "verifyMethod",
  VerificationFailed: "verificationFailed",
  PinEntry: "pinEntry",
  PinShowToggle: "pinShowToggle",
  PinIncorrect: "pinIncorrect",
} as const;

export const OdpEventButton = {
  AskInPerson: "askInPerson",
  AskParent: "askParent",
  Cancel: "cancel",
  CancelAskParent: "cancelAskParent",
  ContinueAsParent: "continueAsParent",
  Back: "back",
  Continue: "continue",
  EmailParent: "emailParent",
  Terms: "terms",
  Privacy: "privacy",
  ForgotPin: "forgotPin",
  Close: "close",
} as const;

export const OdpAssociatedText = {
  AskInPerson: "Ask in person / Continue on this device",
  AskViaEmail: "Send an email / Continue on parent's device",
  Cancel: "X icon",
  Prologue: "Ask your parent",
  RequestSent: "Request sent",
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
  // The service shows this copy for every request the child started, games included, so the spec's
  // game-specific wording is never on screen.
  PinEntryShown: "Enter your PIN - Enter your PIN to approve your child's request. Forgot PIN",
  PinEntry: "6-digit code",
  // The reveal toggle's label, which swaps once the digits are visible.
  PinShowToggle: "Show",
  PinHideToggle: "Hide",
  ForgotPin: "Forgot PIN",
  PinRecoveryClose: "X icon",
} as const;

/** The `state` token for the PIN reveal toggle, naming the state the tap switched to. */
export const PinRevealState = {
  Shown: "shown",
  Hidden: "hidden",
} as const;

export type ReverifyButton = {
  btn: string;
  associatedText: string;
};

export type ReverifyVariant = {
  field: string;
  associatedText: string;
  /** Keyed by the outcome the service declares on the screen's buttons. */
  buttons: Record<string, ReverifyButton>;
};

/**
 * The recovery modal the spec names for each of the service's ReverifyReason values. The service
 * serves every reason as the same `NeedToReverify` screen, so the reason is what tells them apart. A
 * reason without an entry (VerificationNoLongerValid) has no spec rows and sends nothing. Button text
 * is the screen's own copy, which labels the primary button Continue for every reason.
 */
export const ReverifyVariants: Record<string, ReverifyVariant> = {
  PinAttemptsExhausted: {
    field: "tooManyFailedAttempts",
    associatedText:
      "Too many failed attempts - To reset the PIN, a parent or guardian will need to verify their identity.",
    buttons: {
      Continue: { btn: "reset", associatedText: "Continue" },
      Cancel: { btn: "cancelReset", associatedText: "Cancel" },
    },
  },
  ForgotPin: {
    field: "verificationRequired",
    associatedText:
      "Verification required - To reset the PIN, you need to verify you are the parent or guardian.",
    buttons: {
      Continue: { btn: "continueVerification", associatedText: "Continue" },
      Cancel: { btn: "cancelVerification", associatedText: "Cancel" },
    },
  },
};

/** The node id the service serves the recovery modal under, on the shared TextScreen node type. */
export const NeedToReverifyNode = "NeedToReverify";

/** The node id the service serves the VPC prologue under, on the shared TextScreen node type. */
export const PrologueNode = "Prologue";

/** The name the backend's age-group rule is configured under. */
export const AgeGroupKey = "ageGroup";
export const AskCopyVariantKey = "askCopyVariant";
export const ParentSupervisionStateKey = "parentSupervisionState";

/** The ODP intro copy treatment configured by the flow provider. */
export const OdpIntroCopyVariantKey = "copyVariant";

/** The standard agreement screen is the current and fallback treatment. */
export const DefaultOdpIntroCopyVariant = "default";

/** The analytics strings the service attaches to the PinEntry and NeedToReverify fragments. */
export const PinPurposeKey = "pinPurpose";
export const ReverifyReasonKey = "reverifyReason";
