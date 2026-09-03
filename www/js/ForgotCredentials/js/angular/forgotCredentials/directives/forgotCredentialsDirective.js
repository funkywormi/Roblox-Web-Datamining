import forgotCredentialsModule from '../forgotCredentialsModule';

function forgotCredentials() {
  'ngInject';

  return {
    restrict: 'A',
    replace: false,
    template:
      '<div ng-controller="forgotCredentialsController"><div id="account-recovery"></div></div>'
  };
}

forgotCredentialsModule.directive('forgotCredentials', forgotCredentials);

export default forgotCredentials;
