import { ConfigureGroupRolesService } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupRolesV2() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      metadata: '<',
      reloadGroupFunds: '='
    },
    link(scope, element) {
      const renderRoles = () => {
        if (!ConfigureGroupRolesService || !scope.group) {
          return;
        }

        ConfigureGroupRolesService.renderConfigureGroupRoles(element[0], {
          group: scope.group,
          metadata: scope.metadata,
          onReloadGroupFunds: scope.reloadGroupFunds
        });
      };

      element.ready(renderRoles);

      scope.$watch(
        () => ({
          group: scope.group,
          metadata: scope.metadata
        }),
        (newVal, oldVal) => {
          if (
            newVal.group &&
            newVal.metadata &&
            JSON.stringify(newVal) !== JSON.stringify(oldVal)
          ) {
            renderRoles();
          }
        },
        true
      );
    }
  };
}

configureGroupModule.directive('configureGroupRolesV2', configureGroupRolesV2);

export default configureGroupRolesV2;
