import chatModule from '../chatModule';

function conversationInviteDialog(resources) {
  'ngInject';

  return {
    restrict: 'A',
    scope: true,
    controller: 'conversationInviteDialogController',
    templateUrl: resources.templates.conversationInviteDialogTemplate
  };
}

chatModule.directive('conversationInviteDialog', conversationInviteDialog);

export default conversationInviteDialog;
