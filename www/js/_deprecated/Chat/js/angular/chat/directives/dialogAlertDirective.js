import chatModule from '../chatModule';

function dialogAlert(resources) {
  'ngInject';

  return {
    restrict: 'A',
    templateUrl: resources.templates.dialogAlertTemplate
  };
}

chatModule.directive('dialogAlert', dialogAlert);

export default dialogAlert;
