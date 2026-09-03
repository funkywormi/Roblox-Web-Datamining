import { EnvironmentUrls } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupInformationController(
  $log,
  $uibModal,
  groupsService,
  modalService,
  languageResource
) {
  'ngInject';

  const ctrl = this;

  ctrl.getCreatorHubGroupOwnerUrl = () => {
    if (!ctrl.group || !ctrl.group.id) {
      return '#';
    }
    return `https://create.${EnvironmentUrls.domain}/dashboard/group/profile?activeTab=GroupProfileTab&groupId=${ctrl.group.id}`;
  };

  ctrl.showChangeGroupNameModal = async () => {
    try {
      const response = await groupsService.getPreviousGroupNames(ctrl.group.id);
      if (response.data && response.data.length > 0) {
        const { cooldownInDays } = ctrl.metadata.groupNameChangeConfiguration;
        const nameChange = response.data[0];
        const today = new Date();
        const mostRecentChange = new Date(nameChange.created);
        const numMillisecondsSinceChange = today - mostRecentChange;
        const numDaysSinceChange = numMillisecondsSinceChange / (1000 * 60 * 60 * 24);

        if (numDaysSinceChange < cooldownInDays) {
          modalService.open({
            titleText: languageResource.get('Heading.UnableToChangeName'),
            bodyHtmlUnsafe: languageResource.get('Description.ChangeNameCooldown', {
              lineBreak: '</br></br>',
              numDays: cooldownInDays - Math.floor(numDaysSinceChange)
            }),
            actionButtonShow: true,
            actionButtonText: languageResource.get('Action.OK'),
            neutralButtonShow: false,
            resolve: {
              modalData: {
                groupId: ctrl.group.id
              }
            }
          });
          return;
        }
      }
    } catch (e) {
      $log.debug('--loadPreviousGroupNames-error---');
      // Let the user go through the process if the call to previous names fails
    }

    const modalParams = {
      animation: false,
      templateUrl: 'change-name-modal',
      controller: 'changeNameModalController',
      resolve: {
        modalData: {
          groupId: ctrl.group.id,
          groupName: ctrl.group.name,
          metadata: ctrl.metadata
        }
      }
    };

    $uibModal.open(modalParams);
  };

  const init = () => {};

  ctrl.$onInit = init;
}

configureGroupModule.controller(
  'configureGroupInformationController',
  configureGroupInformationController
);
export default configureGroupInformationController;
