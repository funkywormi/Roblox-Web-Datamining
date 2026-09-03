import phoneValidationModule from '../phoneValidationModule';

function phonePrefix(phoneConstants) {
  'ngInject';

  return function(input) {
    return `${input.localizedName} (${phoneConstants.phonePrefixCharacter}${input.prefix})`;
  };
}

phoneValidationModule.filter('phonePrefix', phonePrefix);

export default phonePrefix;
