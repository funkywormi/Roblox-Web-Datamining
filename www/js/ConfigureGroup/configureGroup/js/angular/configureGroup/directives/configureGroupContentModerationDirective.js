import { GroupContentModerationService } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupContentModeration() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      permissions: '<'
    },
    link(scope, element) {
      element.ready(() => {
        GroupContentModerationService?.renderGroupContentModerationSection(element[0], {
          group: scope.group,
          permissions: scope.permissions
        });
      });
    }
  };
}

configureGroupModule.directive('configureGroupContentModeration', configureGroupContentModeration);

export default configureGroupContentModeration;
