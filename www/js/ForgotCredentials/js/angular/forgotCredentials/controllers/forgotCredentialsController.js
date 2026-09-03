import { AccountRecovery } from 'Roblox';
import forgotCredentialsModule from '../forgotCredentialsModule.js';

function forgotCredentialsController($scope) {
  'ngInject';

  $scope.init = function () {
    AccountRecovery.renderComponent('account-recovery');
  };

  $scope.init();
}

forgotCredentialsModule.controller('forgotCredentialsController', forgotCredentialsController);

export default forgotCredentialsController;
