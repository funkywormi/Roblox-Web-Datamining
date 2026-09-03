import { ConfigureGroupService } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupInformation() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      metadata: '<'
    },
    link(scope, element) {
      const renderInformation = () => {
        if (!ConfigureGroupService || !scope.group) {
          return;
        }

        ConfigureGroupService.renderConfigureGroupInformation(element[0], {
          group: scope.group,
          metadata: scope.metadata
        });
      };

      element.ready(renderInformation);

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
            renderInformation();
          }
        },
        true
      );
    }
  };
}

configureGroupModule.directive('configureGroupInformation', configureGroupInformation);

export default configureGroupInformation;
