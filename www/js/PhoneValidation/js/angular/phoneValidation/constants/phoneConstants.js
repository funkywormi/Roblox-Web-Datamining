import phoneValidationModule from '../phoneValidationModule';

const phoneConstants = {
  templates: {
    verifyPhoneModal: 'verify-phone-modal'
  },
  urls: {
    phonePrefixes: '/phone-number-api/v1/phone-prefix-list',
    allPhonePrefixes: '/phone-number-api/v1/phone-prefix-list?showAllPrefixes=true',
    addPhone: '/v1/phone',
    verifyPhone: '/v1/phone/verify',
    resendCode: '/v1/phone/resend'
  },
  modalTypes: {
    addPhone: 'addPhone',
    verifyPhone: 'verifyPhone'
  },
  minimumPhoneLength: 4,
  underscore: '_',
  phonePrefixCharacter: '+',
  defaultCountryCode: 'US',
  unitedStatesPrefix: {
    name: 'United States',
    localizedName: 'United States',
    code: 'US',
    prefix: 1
  }
};

phoneValidationModule.constant('phoneConstants', phoneConstants);

export default phoneConstants;
