export const FaeUpsellEntrySurfaceType = {
  Homepage: "Homepage",
  ProfileCompletion: "ProfileCompletion",
  Unknown: "Unknown",
} as const;

export const AMP_CONSTANTS = {
  faeWithVpc: {
    featureName: "TriggerAgeCheckUpsellIncludingVPC",
    namespace: "core_content/CoreContent",
  },
  faeWithoutVpc: {
    featureName: "TriggerAgeVerifyRecourse",
    namespace: "social/Upsells",
  },
};

export const EmailUpsellOrigin = {
  Homepage: "homepage",
} as const;

export const PhoneUpsellLocalizationKey = {
  VoiceChatEnabledHeading: "Heading.VoiceChatEnabled",
  CanNowJoinVoiceDescription: "Description.CanNowJoinVoice",
  PhoneIsVerifiedHeading: "Heading.PhoneIsVerified",
  TurnOnVoiceChatDescription: "Description.TurnOnVoiceChat",
  AddPhoneVoiceAction: "Action.AddPhoneVoice",
  AddPhoneNumberDescription: "Description.AddPhoneNumber",
  VerifyAction: "Action.Verify",
  VoiceLegalConsentDescription: "Description.VoiceLegalConsent",
  VoiceLegalDisclaimerDescription: "Description.VoiceLegalDisclaimer3",
} as const;
