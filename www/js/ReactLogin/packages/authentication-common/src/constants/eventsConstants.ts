/**
 * Constants for event stream events in auth webapp.
 */
const EVENT_CONSTANTS = {
  schematizedEventTypes: {
    authFormInteraction: "authFormInteraction",
    authButtonClick: "authButtonClick",
    authMsgShown: "authMsgShown",
    authPageLoad: "authPageload",
    authModalShown: "authModalShown",
    authClientError: "authClientError",
    authOperationTiming: "authOperationTiming",
    usernameSuggestionShown: "usernameSuggestionShown",
    passkeyRegistrationEvent: "passkeyRegistrationEvent",
  },
  eventName: {
    loginOtherDevice: "loginOtherDevice",
    formValidation: "formValidation",
    authPageLoad: "authPageload",
    authFormInteraction: "authFormInteraction",
    authButtonClick: "authButtonClick",
    authModalShown: "authModalShown",
    saiCreated: "saiCreated",
    saiMissing: "saiMissing",
    signupUsernameKeystrokes: "accountIntegrityKeystrokeEvents",
    // NOTE (jcountryman, 08/23/24): This event tracks if the affiliate link API
    // call was successful
    qualifiedSignup: "qualifiedSignup",
  },
  context: {
    loginPage: "loginPage",
    loginForm: "LoginForm",
    schematizedLoginForm: "loginForm",
    landingPage: "Multiverse",
    signupForm: "MultiverseSignupForm",
    schematizedSignupForm: "signupForm",
    sendOTP: "sendOTP",
    schematizedSendOTP: "sendOtp",
    enterOTP: "enterOTP",
    schematizedEnterOTP: "enterOtp",
    validateOTP: "validateOTP",
    disambiguationOTP: "disambiguationOTP",
    disambiguationEmail: "disambiguationEmail",
    disambiguationPhone: "disambiguationPhone",
    disambigOTP: "disambigOtp",
    revertAccount: "revertAccount",
    accountSwitcherConfirmation: "accountSwitcherConfirmation",
    accountSwitcherModal: "accountSwitcherModal",
    accountSwitcherLimitError: "accountSwitcherLimitError",
    accountSwitcherLogin: "accountSwitcherLogin",
    accountSwitcherSignup: "accountSwitcherSignup",
    accountSwitcherBackendRequestFailure: "accountSwitcherBackendRequestFailure",
    accountSwitcherLocalStorageFailure: "accountSwitcherLocalStorageFailure",
    accountSwitcherVpcLogin: "accountSwitcherVpcLogin",
    accountSwitcherVpcSignup: "accountSwitcherVpcSignup",
    platformAuthenticatorSupport: "platformAuthenticatorSupport",
    passkeyLogin: "passkeyLogin",
    hba: "hba",
    resetPasswordPage: "resetPasswordPage",
    passkeyCreationSource: "passkeyCreationSource",
    passwordDeactivationSource: "passwordDeactivationSource",
    kisaU14Signup: "kisaU14Signup",
    platformRestrictedPage: "platformRestrictedPage",
    // The OAuth consent dialog at www.roblox.com/authorize. Distinct from loginPage because the
    // account switcher there resumes an in-progress OAuth request rather than starting a session.
    authorizePage: "authorizePage",
    lrLoginForm: "lrLoginForm",
    lrSignupForm: "lrSignupForm",
    silentPasskeyUpgradeWebLogin: "handleSilentPasskeyUpgradeWebLogin",
    silentPasskeyUpgradeWebSignup: "handleSilentPasskeyUpgradeWebSignup",
    silentPasskeyUpgradeWebLoginImmediate: "handleSilentPasskeyUpgradeWebLoginImmediate",
    silentPasskeyUpgradeWebLoginDelayed: "handleSilentPasskeyUpgradeWebLoginDelayed",
    silentPasskeyUpgradeWebSignupDelayed: "handleSilentPasskeyUpgradeWebSignupDelayed",
    passkeyRegistration: "passkeyRegistration",
    addAuthMethodPage: "addAuthMethodPage",
    passkeyCeremony: "passkeyCeremony",
  },
  verifiedParentalConsentContext: {
    chargeback: {
      finishParentalSignup: "finishParentalSignup",
      homepage: "homepage",
    },
    savePaymentMethods: {
      finishParentalSignup: "finishParentalSignupDevsubs",
      homepage: "homepageDevsubs",
    },
    changeBirthdayContext: {
      finishParentalSignup: "finishParentalSignupAgeChange",
      homepage: "homepageAgeChange",
    },
    linkToChild: {
      finishParentalSignup: "finishParentalSignupLinking",
      homepage: "homePageLinking",
    },
    updateUserSetting: {
      finishParentalSignup: "finishParentalSignupSettings",
      homepage: "homePageSettings",
    },
  },
  aType: {
    buttonClick: "buttonClick",
    click: "click",
    offFocus: "offFocus",
    focus: "focus",
    shown: "shown",
    dismissed: "dismissed",
  },
  field: {
    loginOtherDevice: "loginOtherDevice",
    loginOTP: "loginOTP",
    OTP: "otp",
    loginSubmitButtonName: "loginSubmit",
    password: "password",
    username: "username",
    signupSubmitButtonName: "signupSubmit",
    appButtonClickName: "AppLink",
    showPassword: "showPassword",
    hidePassword: "hidePassword",
    birthdayDay: "birthdayDay",
    birthdayMonth: "birthdayMonth",
    birthdayYear: "birthdayYear",
    signupUsername: "signupUsername",
    signupPassword: "signupPassword",
    signupEmail: "signupEmail",
    parentEmail: "parentEmail",
    genderMale: "genderMale",
    genderFemale: "genderFemale",
    email: "email",
    code: "code",
    otpCode: "OTPcode",
    errorMessage: "errorMessage",
    resendErrorMessage: "resendErrorMessage",
    accountSelection: "accountSelection",
    checked: "checked",
    unchecked: "unchecked",
    usernameValid: "usernameValid",
    revertAccountSubmitButtonName: "revertAccountSubmit",
    recoveryPasskey: "passkey",
    recoveryPassword: "password",
    birthday: "birthday",
    accountSwitcher: "accountSwitcher",
    logoutPopup: "logoutPopup",
    hasAuthIntent: "hasAuthIntent",
    tosCheckbox: "tosCheckbox",
    exitSignupConfirmation: "exitSignupConfirmation",
    // How the OS passkey prompt was raised; dismissal rates differ between them.
    autoPrompt: "autoPrompt",
    deliberateRetry: "deliberateRetry",
    general: "general",
  },
  btn: {
    cancel: "cancel",
    sendCode: "sendCode",
    resendCode: "resendCode",
    resend: "resend",
    login: "login",
    logoutAll: "logoutAll",
    signup: "signup",
    continue: "continue",
    changeEmail: "changeEmail",
    select: "select",
    // Opens an account switcher, as opposed to `switch`, which picks an account inside one. Both
    // spellings are already in production: `switchAccount` from the roblox.com nav menu and
    // `switch` from the legacy account-switcher modal.
    switchAccount: "switchAccount",
    back: "back",
    parentalConsentCheckbox: "pc_checkbox",
    termsOfServiceCheckbox: "tos_checkbox",
    privacyPolicyCheckbox: "pp_checkbox",
    submitRevertAccount: "submitRevertAccount",
    dismiss: "dismiss",
    switch: "switch",
    addAccount: "addAccount",
    primaryButton: "primaryButton",
    secondaryButton: "secondaryButton",
    usernameSuggestion: "usernameSuggestion",
    koreaConsentAllCheckbox: "koreaConsentAll",
    koreaTosAndPrivacyPolicyCheckbox: "koreaToS1",
    koreaThirdPartyPersonalInfoCheckbox: "koreaToS2",
    koreaTransferPersonalInfoCheckbox: "koreaToS3",
    koreaPersonalInfoCheckbox: "koreaToS4",
    koreaOptionalPersonalInfoCheckbox: "koreaToS5Optional",
    koreaAgreeTermsOfService: "koreaAgreeToS",
    logoutPopupLogout: "logoutPopupLogout",
    addPasskeyInlineCTA: "addPasskeyInlineCTA",
    addPasskeyModal: "addPasskeyModal",
    skipPasskey: "skipPasskey",
    logout: "logout",
    xdl: "xdl",
    forgotCredentials: "forgotCredentials",
    createAccount: "createAccount",
    termsOfServiceLink: "tos_link",
    privacyPolicyLink: "pp_link",
    signIn: "signIn",
    lrSignInButton: "lrSignInButton",
    signupSubmit: "signupSubmit",
    genderMale: "genderMale",
    genderFemale: "genderFemale",
    showPassword: "showPassword",
    hidePassword: "hidePassword",
    exitSignupConfirmYes: "exitSignupConfirmYes",
    exitSignupConfirmCancel: "exitSignupConfirmCancel",
    passkey: "passkey",
    password: "password",
  },
  input: {
    redacted: "[Redacted]",
  },
  origin: {
    webVerifiedSignup: "WebVerifiedSignup",
    signup: "signup",
    login: "login",
    // Signup V2 arm on the form pageload. No legacy value: that arm renders the
    // pre-existing form, which emits no origin. Identify it via IXP exposure.
    signUpV2Arm: {
      passwordFirst: "passwordFirst",
      passkeyFirst: "passkeyFirst",
      foundationControl: "foundationControl",
    },
  },
  text: {
    finishCreatingYourAccount: "Create Your Roblox Account",
    signup: "Sign Up",
    createAccount: "Create Account",
    logout: "Log Out",
  },
  clientErrorTypes: {
    pageLoadFailed: "pageLoadFailed",
    userInfoFetchFailed: "userInfoFetchFailed",
    localStorageSetFailure: "localStorageSetFailure",
    localStorageGetFailure: "localStorageGetFailure",
    localStorageRemoveFailure: "localStorageRemoveFailure",
    logoutAllAccountSwitcherAccounts: "logoutAllAccountSwitcherAccounts",
  },
  state: {
    skipVPC: "skipVPC",
    launchParentSignUpOtp: "launchParentSignUpOtp",
    passkeyUpselling: {
      passkeyRegistrationSuccess: "passkeyRegistrationSuccess",
      passkeyRegistrationFailure: "passkeyRegistrationFailure",
      passkeyOsDialogue: "passkeyOsDialogue",
      passkeyUpsellModal: "passkeyUpsellModal",
      passkeyUpsellShown: "passkeyUpsellShown",
      passkeyNotSupported: "passkeyNotSupported",
      passkeyUpsellFilteredByInAppTraffic: "passkeyUpsellFilteredByInAppTraffic",
      // Fired when a duplicate handleSetupPasskey() invocation is short-circuited
      // by the in-flight guard in useRecoveryActions. A non-zero rate confirms
      // the dedup is doing real work (and quantifies how often the underlying
      // race-condition pattern actually occurs in production).
      passkeyRegistrationDuplicateBlocked: "passkeyRegistrationDuplicateBlocked",
      // Fired when the auto-OS-dialog useEffect re-runs for a recoverySessionId
      // it has already fired for, and the per-component fire-once-per-session
      // ref short-circuits it.
      passkeyAutoOsDialogueDeduped: "passkeyAutoOsDialogueDeduped",
      filteredByNoPasskeySupport: "filteredByNoPasskeySupport",
      filteredByNoSilentUpgradeSupport: "filteredByNoSilentUpgradeSupport",
      unclearedWebSessionFlag: "unclearedWebSessionFlag",
    },
    passkeyCreation: {
      finishRegistration: "finishRegistration",
      accountRecovery: "accountRecovery",
      accountSettings: "accountSettings",
      enhancedProtectionProgram: "enhancedProtectionProgram",
    },
    passwordDeactivation: {
      deactivationSuccess: "deactivationSuccess",
      accountRecovery: "accountRecovery",
    },
    accountRecoveryPage: {
      recoveryPageShown: "recoveryPageShown",
      recoveryPathChosen: "recoveryPathChosen",
      // Fired once per user-initiated password-reset submit. The per-arm submit
      // denominator for the abandon-vs-error split.
      passwordResetSubmitted: "passwordResetSubmitted",
      // Fired (via authMsgShown) when the resetPassword API returns an error,
      // carrying the raw backend code in `errorcode` so error-vs-abandon is
      // measurable per arm.
      passwordResetFailure: "passwordResetFailure",
      // resetPassword returned a non-error response; flow is carried in `origin`.
      passwordResetSucceeded: "passwordResetSucceeded",
      // Continue clicked on RecoverySuccess; flow is carried in `origin`.
      recoverySuccessContinueClicked: "recoverySuccessContinueClicked",
      // Fired (via authMsgShown) when a 2SV challenge during password reset
      // does not complete (abandoned or errored). Reason is carried in `field`
      // (see recovery2svIncompleteReason) to keep a 2SV bug separable from
      // user abandonment.
      passwordReset2svIncomplete: "passwordReset2svIncomplete",
    },
    accountSwitcher: {
      switchSuccess: "success",
      invalidSession: "invalidSession",
      requestFailed: "requestFailed",
    },
    signUpV2: {
      // Why the user reached AddAuthMethodPage.
      addAuthMethodEntry: {
        dismissed: "dismissed",
        unsupported: "unsupported",
        error: "error",
        autoPromptSuppressed: "autoPromptSuppressed",
      },
      authMethodChosen: "authMethodChosen",
      // Step reached when the page was hidden. The `abandoned:` prefix keeps
      // these separable from real errors on the shared authClientError type.
      abandoned: {
        awaitingCeremony: "abandoned:awaitingCeremony",
        awaitingChoice: "abandoned:awaitingChoice",
        formIncomplete: "abandoned:formIncomplete",
      },
    },
    // Mirrors `classifySignupError`'s outcome types verbatim so there is no
    // second vocabulary to keep in sync.
    signupError: {
      captcha: "captcha",
      field: "field",
      identityVerification: "identityVerification",
      general: "general",
      ageRestriction: "ageRestriction",
      accountSwitcher: "accountSwitcher",
      passkeyRegistrationFailed: "passkeyRegistrationFailed",
      abandonedChallenge: "abandonedChallenge",
      unknown: "unknown",
      // Rate limiting arrives as `unknown` carrying no error code, so the detail
      // has to ride here to stay separable.
      unknownTooManyAttempts: "unknown:tooManyAttempts",
    },
    focused: "focused",
    unfocused: "unfocused",
    selected: "selected",
    unselected: "unselected",
  },
  // Which step of the account-recovery passkey registration ceremony failed.
  // Carried in `origin` on the passkeyRegistrationFailure authMsgShown event
  // so the single failure bucket can be split by cause. `field` carries the
  // detail: the WebAuthn DOMException name (e.g. NotAllowedError,
  // InvalidStateError) for osCeremony, or the raw backend error code for
  // start/finish.
  passkeyRegistrationErrorSource: {
    // startPreAuthPasskeyRegistration (backend) failed.
    start: "start",
    // navigator.credentials.create (OS WebAuthn prompt) failed or returned null.
    osCeremony: "osCeremony",
    // finishARPreAuthPasskeyRegistration (backend) failed.
    finish: "finish",
    // Unexpected error not attributable to a specific step.
    unknown: "unknown",
  },
  // Identifies which recovery UI arm emitted a reset event. Carried in `origin`
  // so the funnel is cut per arm.
  recoveryResetFlow: {
    control: "control",
    passkeyFirst: "passkeyFirst",
    passwordFirst: "passwordFirst",
    passkeyAutoLogin: "passkeyAutoLogin",
  },
  // Why a 2SV challenge during password reset did not complete, carried on the
  // passwordReset2svIncomplete event. One event so the common "abandoned" case
  // and the rare error cases share a denominator but stay separable.
  recovery2svIncompleteReason: {
    // User closed/dismissed the challenge modal.
    abandoned: "abandoned",
    // Challenge invalidated with a non-session-expired (unknown) error.
    invalidated: "invalidated",
    // AccountIntegrityChallengeService failed to render the challenge.
    renderFailed: "renderFailed",
    // Backend 2SV error was missing a challengeId (or userId was unavailable).
    missingChallengeId: "missingChallengeId",
  },
  // Signup V2 submit mode. Cannot go in `state`, which Control already uses for
  // `hasAuthIntent` on the same ctx/btn pair.
  ctype: {
    passkeyCeremony: "passkeyCeremony",
    password: "password",
    autoPromptSuppressed: "autoPromptSuppressed",
  },
  passkeyRegistrationSource: {
    signup: "signup",
  },
  // `state` values for the schematized PasskeyRegistrationEvent emitted from the
  // signup surface. The `signupPreauth*` values mirror the outcomes of the
  // pre-authenticated passkey ceremony (see `usePasskeyRegistration`)
  passkeyRegistrationState: {
    signupPreauthCredentialCreated: "SignupPreauthCredentialCreated",
    signupPreauthDismissed: "SignupPreauthDismissed",
    signupPreauthUnsupported: "SignupPreauthUnsupported",
    signupPreauthError: "SignupPreauthError",
    signupBindSuccess: "SignupBindSuccess",
    signupBindFailed: "SignupBindFailed",
  },
} as const;

export default EVENT_CONSTANTS;
