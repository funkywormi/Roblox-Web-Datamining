import { BootstrapWidgets } from 'Roblox';
import groupModule from '../groupModule';

function groupDescriptionController($timeout, $log, groupsService, modalService, languageResource) {
  'ngInject';

  const ctrl = this;

  ctrl.canViewDescription = () => {
    return ctrl.description && ctrl.policies.displayDescription;
  };

  ctrl.showPastGroupNames = () => {
    modalService.open({
      titleText: languageResource.get('Heading.PreviousGroupNames'),
      bodyHtmlUnsafe: ctrl.previousGroupNamesListString,
      neutralButtonShow: false
    });
  };

  function onDescriptionChange() {
    // allow the description to load before truncate and toggle content are called
    $timeout(() => {
      BootstrapWidgets.TruncateContent();
      BootstrapWidgets.ToggleContent();
    });
  }

  function loadPreviousGroupNames() {
    groupsService.getPreviousGroupNames(ctrl.groupId).then(
      response => {
        ctrl.previousGroupNames = response.data;
        ctrl.previousGroupNamesListString = ctrl.previousGroupNames
          .map(elem => {
            return elem.name;
          })
          .join('\r\n')
          .escapeHTML();
        ctrl.previousGroupNamesCsvString = ctrl.previousGroupNames
          .map(elem => {
            return elem.name;
          })
          .join(', ');
      },
      () => {
        $log.debug('--loadPreviousGroupNames-error---');
        ctrl.layout.loadError = true;
      }
    );
  }

  function init() {
    ctrl.layout = {};
    ctrl.previousGroupNames = [];
    ctrl.previousGroupNamesListString = '';
    ctrl.previousGroupNamesCsvString = '';
    loadPreviousGroupNames();
  }

  ctrl.$onInit = init;
  ctrl.$onChanges = onDescriptionChange;
}

groupModule.controller('groupDescriptionController', groupDescriptionController);
export default groupDescriptionController;
