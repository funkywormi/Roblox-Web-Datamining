export default {
  headings: {
    accountInfo: "Heading.AccountInfo",
    socialNetworks: "Heading.SocialNetworks",
    personal: "Heading.Personal",
    language: "Label.LocaleTitle",
    gender: "Label.GenderOptional",
    loginMethods: "Heading.LoginMethods",
    earlyAccessPrograms: "Heading.EarlyAccessPrograms",
  },

  linkedAccounts: {
    heading: "Heading.LinkedAccounts",
    verification: {
      heading: "Heading.LinkedAccountsVerify",
      description: "Description.LinkedAccountsVerify",
      action: "Action.VerifyItsYou",
    },
    error: "Response.LinkedAccountsLoadFailed",
  },

  ageGroup: {
    label: "Label.AgeGroupV2",
    verifyAgeWarning: "Description.VerifyAgeWarning",
    verifyAgeWarningUnknownDeadline: "Description.VerifyAgeWarningUnknownDeadline",
    checkedLabel: "Label.AgeVerification.AgeCheckedBadge",
  },

  birthdate: {
    label: "Label.Birthday",
    inlineLabel: "Label.BirthdayInline",
    birthdateSetByYourParentDescription: "Description.BirthdaySetByParent",
    birthdateSetByParentDescription: "Description.ParentSideBirthdaySetByParent",
    birthdayChangeTitle: "Title.UpdateBirthday",
    underageChangeBirthdayDescription: "Description.UnderageChangeBirthday",
    addBirthdayMessage: "Label.AddBirthday",
    updateChildBirthdayMessage: "Label.UpdateChildBirthday",
    updateChildBirthdayWarningDescription: "Description.UpdateChildBirthdayText",
    calendar: {
      year: "Label.Year",
      month: "Label.Month",
      day: "Label.Day",
    },
    warnings: {
      ageDown: {
        title: "Response.Dialog.Warning",
        body: "Response.Dialog.BirthdayChangeDefaultWarning",
      },
      ageDownInModal: {
        title: "Title.AreYouSure",
        body: "Description.ChangeAgeToU13V2",
      },
    },
    errors: {
      invalidBirthdateError: "Response.InvalidBirthday",
      noChangeError: "Response.BirthdayNoChange",
      alreadyApplied: "Message.ParentResponded",
    },
    changeBirthday: "Action.ChangeBirthday",
    pendingUpdateMessage: "Label.Pending",
    verifiedLabel: "Label.Verified",
    pendingConsent: {
      title: "Title.RequestPending",
      body: "Description.CancelRequest",
    },
  },

  changeUsername: {
    label: "Label.UsernameV2",
    editLabel: "Description.HoverText.ChangeUsername",
    missingEmail: "Description.Dialog.MissingEmailUsername",
    unverifiedEmail: "Description.Dialog.UnverifiedEmailUsername",
    changeUsernameBuy: "Action.Dialog.ChangeUsernameBuy",
    insufficientFundsDescription: "Description.Dialog.InsufficientFundsWarning",
    insufficientFundsHeading: "Heading.Dialog.InsufficientFunds",
    buyBtn: "Action.Dialog.ChangeUsernameBuy",
    modalTitle: "Heading.Dialog.ChangeUsernameTitle",
    changeUsernameFreeDescription: "Description.Dialog.ChangeUsernameForFree",
    changeUsernamePriceDescription: "Description.Dialog.ChangeUsernamePageText",
    changeUsernameSuccessDescription: "Response.Dialog.ChangeUsernameSuccess",
    enterUsernameLabel: "Response.PleaseEnterUsername",
    usernamePlaceholder: "Label.Dialog.ChangeUsernameField",
    disclaimer: "Description.Dialog.ChangeUsernameDisclaimer",
    error: {
      notProvided: "Response.Dialog.ChangeUsernameNoInput",
      notAvailable: "Response.Dialog.ChangeUsernameNotAvailable",
      notAllowed: "Response.Dialog.ChangeUsernameNotAllowed",
    },
  },

  email: {
    label: "Label.EmailV2",
    addLabel: "Action.Add",
    noneLabel: "Label.None",
    verifiedLabel: "Label.Verified",
    verifyLabel: "Label.Verify",
    updateLabel: "Action.Dialog.Update",
    verificationPendingLabel: "Label.Pending",
    parent: {
      label: "Label.EmailParentV2",
      addEmailLabel: "Action.Add",
      parentalRecoveryEmailLabel: "Label.ParentalRecoveryEmailV2",
      addParentalRecoveryEmailLabel: "Action.Add",
    },
    disablePinWarning: "Description.Dialog.ChangeEmailDisablePinWarning",
  },
  passkey: {
    upsellHeading: "Heading.TiredOfPasswordsUpsell",
    upsellDescription: "Description.PasskeysUpsellDescription",
    addPasskey: "Action.AddPasskey",
    label: "Label.Passkey",
    labelV2: "Label.PasskeyV2",
    numAdded: "Label.NumPasskeysAdded",
    numAddedSingular: "Label.NumPasskeysAddedSingular",
    numAddedPlural: "Label.NumPasskeysAddedPlural",
    manage: "Label.Manage",
    skips2sv: "Description.PasskeySkips2sv",
    createdHeading: "Heading.PasskeyCreated",
    alreadyCreated: "Response.PasskeyAlreadyCreated",
    createdSuccessfully: "Response.PasskeyCreatedSuccessfully",
    removedSuccessfully: "Response.PasskeyRemovedSuccessfully",
    deviceNotCompatible: "Description.DeviceNotCompatible",
    checkingPasskeyCompatibility: "Description.CheckingPasskeyCompatibility",
  },
  themeLabel: "Label.ThemeTitle",
  // Feature.Accessibility namespace.
  themeModeHeading: "Heading.AppThemeMode",
  themeModeDescription: "Description.AppThemeMode",

  socialNetworks: {
    facebookLabel: "Label.Facebook",
    twitterLabel: "Label.XFormerlyTwitter",
    youtubeLabel: "Label.YouTube",
    twitchLabel: "Label.Twitch",
    guildedLabel: "Label.Guilded",
    facebookExample: "Example.Facebook",
    twitterExample: "Example.Twitter",
    youtubeExample: "Example.YouTube",
    twitchExample: "Example.Twitch",
    guildedExample: "Example.Guilded",
    socialLinksVisibilityLabel: "Label.SocialLinksVisibility",
    socialNetworksVisibility: "Label.SocialNetworksVisibility",
    socialNetworksDescription: "Description.SocialNetworksVisibility",
    parentSideDescription: "Description.ParentSide.SocialLinkVisibility",
    manageLinksRequirement: "Description.ManageLinksRequirement",
  },

  // Change Password
  changePassword: {
    passwordLabel: "Label.PasswordV2",
    changePasswordCurrentPlaceholder: "Label.Dialog.ChangePasswordCurrent",
    changePasswordNewPlaceholder: "Label.Dialog.ChangePasswordNew",
    changePasswordConfirmPlaceholder: "Label.Dialog.ChangePasswordConfirm",
    changePasswordHeading: "Heading.Dialog.ChangePassword",
    passwordChangedSuccessHeading: "Heading.Dialog.ChangePasswordSuccess",
    changePasswordConfirmationDescription: "Description.Dialog.ChangePasswordConfirmation",
    changePasswordNoMatch: "Response.Dialog.ChangePasswordNoMatch",
    changePasswordAction: "Action.Dialog.ChangePassword",
  },

  // Change phone
  changePhone: {
    addPhoneLabel: "Action.Add",
    noneLabel: "Label.None",
    updatePhoneLabel: "Action.Dialog.Update",
    phoneLabel: "Label.PhoneV2",
    verifiedPhoneLabel: "Label.Verified",
  },

  previousUsernames: {
    label: "Label.PreviousUsernames",
  },

  displayName: {
    label: "Label.DisplayNameSettingV2",
    modalTitle: "Label.ConfigureDN",
    modalDescription: "Description.WarningFrequencyOfChanges",
    tooShortLabel: "ErrorMessage.NameTooShort",
    agedUp: {
      label: "Label.AgedUpDisplayNameV2",
      modalTitle: "Label.AgedUpConfigureDN",
      modalDescription: "Description.WarningFrequencyOfChanges",
    },
  },

  ageVerification: {
    verifyAgeConsent: "Description.VerifyAgeConsent",
    moreInfoToolTip: "Label.ToolTip.MoreInfo",
    verifyAgeDialog: "Action.Dialog.VerifyAge",
  },

  ageVerificationV2: {
    heading: "Heading.AgeVerification",
    headingIdvOnly: "Heading.AgeVerification.IDVOnly",
    headingIdvReverificationRequired: "Heading.IDReverificationRequired",
    requireIDReverification: "Description.CompleteNewAgeCheckIdRequired",
    descriptionFAEIDV: "Description.AgeVerification.FAEIDVV2",
    descriptionFAEOnly: "Description.AgeVerification.FAEOnlyV2",
    descriptionIdvOnly: "Description.AgeVerification.IDVOnly",
    disclaimerPersona: "Label.AgeVerification.PersonaDisclaimer",
    faeButton: "Label.AgeVerification.FAEButtonV2",
    idvButton: "Label.AgeVerification.IDVButton",
    ageCheckedBadge: "Label.AgeVerification.AgeCheckedBadge",
    continueAction: "Action.Dialog.Continue",
    cancelAction: "Action.Dialog.Cancel",
    temporaryFaeBannerDescription: "Description.temporaryFaeBanner",
    temporaryIdvBannerDescription: "Description.temporaryIdvBanner",
    temporaryNoChatBannerDescription: "Description.temporaryChatDisabledBanner",
    temporaryVpcForFaeBannerDescription: "Description.temporaryVpcForFaeBannerDescription",
    ageCheckUndoBannerHeading: "Heading.AgeVerificationUndo",
    ageCheckUndoBannerDescription: "Description.AgeVerificationUndo",
    redoWithIDVAction: "Action.AgeVerificationRedoWithIdv",
    resetAgeVerificationAction: "Action.AgeVerificationUndo",
    ageCheckUndoModalHeading: "Heading.AgeVerificationUndoConfirmation",
    ageVerificationUndoModalDescription: "Description.AgeVerificationUndoConfirmation",
    birthdayVerificationUndoBannerHeading: "Heading.BirthdayVerificationUndo",
    birthdayVerificationUndoBannerDescription: "Description.BirthdayVerificationUndo",
    birthdayVerificationUndoModalHeading: "Heading.BirthdayVerificationUndoConfirmation",
    redoIDVBannerDescription: "Description.IDVerificationRedo",
    ageCheckResetErrorBannerDescription: "Description.AgeVerificationUndoError",
    birthdayVerificationResetErrorBannerDescription: "Description.BirthdayVerificationUndoError",
    acceptDownageHeading: "Description.FacialAgeEstimate",
    acceptDownageDescription: "Description.AgeEstimationUpdate",
    acceptDownageDescriptionSuffix: "Description.UpdateBirthdateID",
    acceptDownageButton: "Action.AcceptNow",
    acceptDownageDisclaimer: "Description.AcceptDownageDisclaimer",
    // U5 pending-downage variant. Backend returns `estimatedAgeGroupU5` as the
    // `estimatedAgeGroupTranslationKey` when the FAE result is U5, in which case
    // we suppress the accept-downage action (U5 FAE results aren't a valid age
    // verification per AMP's GetAgeBandLabel rule) and show this dedicated copy.
    estimatedAgeGroupU5: "Label.AgeGroup5Estimated",
    acceptDownageU5Description: "Description.AgeEstimationToFive",
  },

  accountCountry: {
    accountLocationTitle: "Label.AccountLocationTitle",
    changeLocationTitle: "Response.Dialog.ChangeAccountLocation",
    setLocation: "Action.Dialog.SetAccountLocation",
    changeLocationModalBody: "Warning.ChangeAccountLocation",
    contactCustomerSupport: "Description.AccountLocation.ContactCustomerSupport",
    operationNotPermitted: "Description.AccountLocation.OperationNotPermitted",
    // The translation key has a misspelling but that's the value present in
    // go/translations ¯\_(ツ)_/¯
    unknownLocation: "Label.AccountLocation.Unkown",
  },

  earlyAccess: {
    description: "Description.EarlyAccess",
  },
};
