import { ConfigureGroupAnalyticsService } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupAnalytics() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      metadata: '<'
    },
    link(scope, element) {
      const renderAnalytics = () => {
        if (!ConfigureGroupAnalyticsService || !scope.group) {
          return;
        }

        ConfigureGroupAnalyticsService.renderConfigureGroupAnalytics(element[0], {
          group: scope.group,
          metadata: scope.metadata
        });
      };

      element.ready(renderAnalytics);

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
            renderAnalytics();
          }
        },
        true
      );
    }
  };
}

configureGroupModule.directive('configureGroupAnalytics', configureGroupAnalytics);

export default configureGroupAnalytics;
