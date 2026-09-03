/**
 * Constants for event stream events in auth webapp.
 */
const EVENT_CONSTANTS = {
  schematizedEventTypes: {
    authFormInteraction: 'authFormInteraction',
    authButtonClick: 'authButtonClick',
    authMsgShown: 'authMsgShown',
    authPageLoad: 'authPageload',
    authModalShown: 'authModalShown',
    authClientError: 'authClientError',
    usernameSuggestionShown: 'usernameSuggestionShown'
  },
  eventName: {
    loginOtherDevice: 'loginOtherDevice',
    formValidation: 'formValidation',
    authPageLoad: 'authPageload',
    authFormInteraction: 'authFormInteraction',
    authButtonClick: 'authButtonClick',
    authModalShown: 'authModalShown',
    saiCreated: 'saiCreated',
    saiMissing: 'saiMissing',
    signupUsernameKeystrokes: 'accountIntegrityKeystrokeEvents',
    // NOTE (jcountryman, 08/23/24): This event tracks if the affiliate link API
    // call was successful
    qualifiedSignup: 'qualifiedSignup'
  },
  context: {
    loginPage: 'loginPage',
    loginForm: 'LoginForm',
    schematizedLoginForm: 'loginForm',
    lrLoginForm: 'lrLoginForm',
    landingPage: 'Multiverse',
    signupForm: 'MultiverseSignupForm',
    schematizedSignupForm: 'signupForm',
    lrSignupForm: 'lrSignupForm',
    sendOTP: 'sendOTP',
    schematizedSendOTP: 'sendOtp',
    enterOTP: 'enterOTP',
    schematizedEnterOTP: 'enterOtp',
    validateOTP: 'validateOTP',
    disambiguationOTP: 'disambiguationOTP',
    disambiguationEmail: 'disambiguationEmail',
    disambiguationPhone: 'disambiguationPhone',
    disambigOTP: 'disambigOtp',
    revertAccount: 'revertAccount',
    accountSwitcherConfirmation: 'accountSwitcherConfirmation',
    accountSwitcherModal: 'accountSwitcherModal',
    accountSwitcherLimitError: 'accountSwitcherLimitError',
    accountSwitcherLogin: 'accountSwitcherLogin',
    accountSwitcherSignup: 'accountSwitcherSignup',
    accountSwitcherBackendRequestFailure: 'accountSwitcherBackendRequestFailure',
    accountSwitcherLocalStorageFailure: 'accountSwitcherLocalStorageFailure',
    accountSwitcherVpcLogin: 'accountSwitcherVpcLogin',
    accountSwitcherVpcSignup: 'accountSwitcherVpcSignup',
    platformAuthenticatorSupport: 'platformAuthenticatorSupport',
    passkeyLogin: 'passkeyLogin',
    silentPasskeyUpgradeWebLogin: 'handleSilentPasskeyUpgradeWebLogin',
    silentPasskeyUpgradeWebLoginImmediate: 'handleSilentPasskeyUpgradeWebLoginImmediate',
    silentPasskeyUpgradeWebLoginDelayed: 'handleSilentPasskeyUpgradeWebLoginDelayed',
    silentPasskeyUpgradeWebSignupDelayed: 'handleSilentPasskeyUpgradeWebSignupDelayed',
    hba: 'hba',
    resetPasswordPage: 'resetPasswordPage'
  },
  verifiedParentalConsentContext: {
    chargeback: {
      finishParentalSignup: 'finishParentalSignup',
      homepage: 'homepage'
    },
    savePaymentMethods: {
      finishParentalSignup: 'finishParentalSignupDevsubs',
      homepage: 'homepageDevsubs'
    },
    changeBirthdayContext: {
      finishParentalSignup: 'finishParentalSignupAgeChange',
      homepage: 'homepageAgeChange'
    },
    linkToChild: {
      finishParentalSignup: 'finishParentalSignupLinking',
      homepage: 'homePageLinking'
    },
    updateUserSetting: {
      finishParentalSignup: 'finishParentalSignupSettings',
      homepage: 'homePageSettings'
    }
  },
  aType: {
    buttonClick: 'buttonClick',
    click: 'click',
    offFocus: 'offFocus',
    focus: 'focus',
    shown: 'shown',
    dismissed: 'dismissed'
  },
  field: {
    loginOtherDevice: 'loginOtherDevice',
    loginOTP: 'loginOTP',
    OTP: 'otp',
    loginSubmitButtonName: 'loginSubmit',
    password: 'password',
    username: 'username',
    signupSubmitButtonName: 'signupSubmit',
    appButtonClickName: 'AppLink',
    showPassword: 'showPassword',
    hidePassword: 'hidePassword',
    birthdayDay: 'birthdayDay',
    birthdayMonth: 'birthdayMonth',
    birthdayYear: 'birthdayYear',
    signupUsername: 'signupUsername',
    signupPassword: 'signupPassword',
    signupEmail: 'signupEmail',
    parentEmail: 'parentEmail',
    genderMale: 'genderMale',
    genderFemale: 'genderFemale',
    email: 'email',
    code: 'code',
    otpCode: 'OTPcode',
    errorMessage: 'errorMessage',
    resendErrorMessage: 'resendErrorMessage',
    accountSelection: 'accountSelection',
    checked: 'checked',
    unchecked: 'unchecked',
    usernameValid: 'usernameValid',
    revertAccountSubmitButtonName: 'revertAccountSubmit',
    birthday: 'birthday',
    accountSwitcher: 'accountSwitcher',
    logoutPopup: 'logoutPopup',
    hasAuthIntent: 'hasAuthIntent',
    tosCheckbox: 'tosCheckbox',
    exitSignupConfirmation: 'exitSignupConfirmation'
  },
  btn: {
    cancel: 'cancel',
    sendCode: 'sendCode',
    resendCode: 'resendCode',
    resend: 'resend',
    login: 'login',
    xdl: 'xdl',
    forgotCredentials: 'forgotCredentials',
    createAccount: 'createAccount',
    logoutAll: 'logoutAll',
    signup: 'signup',
    continue: 'continue',
    changeEmail: 'changeEmail',
    select: 'select',
    parentalConsentCheckbox: 'pc_checkbox',
    termsOfServiceCheckbox: 'tos_checkbox',
    privacyPolicyCheckbox: 'pp_checkbox',
    termsOfServiceLink: 'tos_link',
    privacyPolicyLink: 'pp_link',
    submitRevertAccount: 'submitRevertAccount',
    dismiss: 'dismiss',
    switch: 'switch',
    addAccount: 'addAccount',
    primaryButton: 'primaryButton',
    secondaryButton: 'secondaryButton',
    usernameSuggestion: 'usernameSuggestion',
    signIn: 'signIn',
    lrSignInButton: 'lrSignInButton',
    signupSubmit: 'signupSubmit',
    genderMale: 'genderMale',
    genderFemale: 'genderFemale',
    showPassword: 'showPassword',
    hidePassword: 'hidePassword',
    koreaConsentAllCheckbox: 'koreaConsentAll',
    koreaTosAndPrivacyPolicyCheckbox: 'koreaToS1',
    koreaThirdPartyPersonalInfoCheckbox: 'koreaToS2',
    koreaTransferPersonalInfoCheckbox: 'koreaToS3',
    koreaPersonalInfoCheckbox: 'koreaToS4',
    koreaOptionalPersonalInfoCheckbox: 'koreaToS5Optional',
    koreaAgreeTermsOfService: 'koreaAgreeToS',
    logoutPopupLogout: 'logoutPopupLogout',
    addPasskeyInlineCTA: 'addPasskeyInlineCTA',
    addPasskeyModal: 'addPasskeyModal',
    skipPasskey: 'skipPasskey',
    exitSignupConfirmYes: 'exitSignupConfirmYes',
    exitSignupConfirmCancel: 'exitSignupConfirmCancel'
  },
  input: {
    redacted: '[Redacted]'
  },
  origin: {
    webVerifiedSignup: 'WebVerifiedSignup',
    signup: 'signup',
    login: 'login'
  },
  text: {
    finishCreatingYourAccount: 'Create Your Roblox Account',
    signup: 'Sign Up',
    createAccount: 'Create Account',
    logout: 'Log Out'
  },
  clientErrorTypes: {
    pageLoadFailed: 'pageLoadFailed',
    userInfoFetchFailed: 'userInfoFetchFailed',
    localStorageSetFailure: 'localStorageSetFailure',
    localStorageGetFailure: 'localStorageGetFailure',
    localStorageRemoveFailure: 'localStorageRemoveFailure',
    logoutAllAccountSwitcherAccounts: 'logoutAllAccountSwitcherAccounts'
  },
  state: {
    focused: 'focused',
    unfocused: 'unfocused',
    selected: 'selected',
    unselected: 'unselected',
    passkeyUpselling: {
      passkeyRegistrationSuccess: 'passkeyRegistrationSuccess',
      passkeyRegistrationFailure: 'passkeyRegistrationFailure',
      passkeyOsDialogue: 'passkeyOsDialogue',
      passkeyUpsellModal: 'passkeyUpsellModal',
      passkeyUpsellShown: 'passkeyUpsellShown',
      passkeyNotSupported: 'passkeyNotSupported',
      passkeyUpsellFilteredByInAppTraffic: 'passkeyUpsellFilteredByInAppTraffic',
      filteredByNoPasskeySupport: 'filteredByNoPasskeySupport',
      filteredByNoSilentUpgradeSupport: 'filteredByNoSilentUpgradeSupport',
      unclearedWebSessionFlag: 'unclearedWebSessionFlag'
    }
  }
} as const;

export default EVENT_CONSTANTS;
