import { ConfigureGroupV2Service } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupUserCard() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      user: '<',
      actingUser: '<',
      showGroupBanDetails: '<',
      actingUserPermissions: '<'
    },
    link(scope, element) {
      element.ready(() => {
        ConfigureGroupV2Service?.renderGroupUserCard(element[0], {
          group: scope.group,
          user: scope.user,
          actingUser: scope.actingUser,
          showGroupBanDetails: scope.showGroupBanDetails,
          actingUserPermissions: scope.actingUserPermissions
        });
      });
    }
  };
}

configureGroupModule.directive('configureGroupUserCard', configureGroupUserCard);

export default configureGroupUserCard;
