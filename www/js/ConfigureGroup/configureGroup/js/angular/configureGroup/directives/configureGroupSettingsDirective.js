import { ConfigureGroupSettingsService } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupSettings() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      metadata: '<'
    },
    link(scope, element) {
      const renderSettings = () => {
        if (!ConfigureGroupSettingsService || !scope.group) {
          return;
        }

        ConfigureGroupSettingsService.renderConfigureGroupSettings(element[0], {
          group: scope.group,
          metadata: scope.metadata
        });
      };

      element.ready(renderSettings);

      // Re-render when the group or metadata changes
      scope.$watch(
        () => ({
          group: scope.group.id,
          metadata: scope.metadata
        }),
        (newVal, oldVal) => {
          if (
            newVal.group &&
            newVal.metadata &&
            JSON.stringify(newVal) !== JSON.stringify(oldVal)
          ) {
            renderSettings();
          }
        },
        true
      );
    }
  };
}

configureGroupModule.directive('configureGroupSettings', configureGroupSettings);

export default configureGroupSettings;
