import groupsModule from '../groupsModule';

const errorCodes = {
  invalidCode: 'invalidCode',
  invalidChallenge: 'invalidChallenge',
  invalidConfiguration: 'invalidConfiguration',
  tooManyRequests: 'tooManyRequests',
  featureDisabled: 'featureDisabled'
};

const verificationResources = {
  codeLength: 6,

  actionTypes: {
    robuxSpend: 'RobuxSpend'
  },

  urls: {
    support: '/info/account-safety'
  },

  errorCodes: {
    internal: errorCodes,
    api: {
      1: errorCodes.invalidChallenge,
      5: errorCodes.tooManyRequests,
      7: errorCodes.featureDisabled,
      9: errorCodes.invalidConfiguration,
      10: errorCodes.invalidCode
    }
  },

  events: {
    frictionEventType: 'buttonClick',
    twoStepVerificationCtx: '2svRobuxSpend',
    resendCodeBtn: 'resendCode',
    verifyCodeBtn: 'verifyCode',
    goToSecurityBtn: 'goToSecurity',
    cancelBtn: 'closeSettingsRedirectModal',
    settingsRedirectModalTriggered: 'settingsRedirectModalTriggered',
    codeInputModalTriggered: 'codeInputModalTriggered',
    successfulVerification: 'successfulVerification',
    invalidCodeInput: 'invalidCodeInput'
  }
};

groupsModule.constant('verificationResources', verificationResources);

export default verificationResources;
