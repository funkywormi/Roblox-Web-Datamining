import { initRobloxBadgesFrameworkAgnostic } from 'roblox-badges';
import configureGroupModule from '../../configureGroupModule';

function configureGroupMemberRequestCardController(
  thumbnailConstants,
  configureGroupMembersService,
  systemFeedbackService
) {
  'ngInject';

  const ctrl = this;

  ctrl.acceptRequest = function (userId) {
    ctrl.cardActive = true;
    configureGroupMembersService.acceptMemberRequest(ctrl.group.id, userId).then(
      function () {
        ctrl.reloadCurrentPage();
        ctrl.group.memberCount += 1;
      },
      function (error) {
        ctrl.errorResponse(error);
      }
    );
  };

  ctrl.ignoreRequest = function (userId) {
    ctrl.cardActive = true;
    configureGroupMembersService.ignoreMemberRequest(ctrl.group.id, userId).then(
      function () {
        ctrl.reloadCurrentPage();
      },
      function (error) {
        ctrl.errorResponse(error);
      }
    );
  };

  ctrl.errorResponse = function (errors) {
    ctrl.cardActive = false;
    let message = '';
    errors.forEach(function (e) {
      message += `${e.userFacingMessage} \n`;
    });
    systemFeedbackService.warning(message);
  };

  const init = function () {
    ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;

    try {
      initRobloxBadgesFrameworkAgnostic({
        overrideIconClass: 'verified-badge-icon-requester-card'
      });
    } catch (e) {
      // noop
    }
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller(
  'configureGroupMemberRequestCardController',
  configureGroupMemberRequestCardController
);

export default configureGroupMemberRequestCardController;
