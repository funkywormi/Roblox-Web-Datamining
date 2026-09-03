import { ConfigureCommunityTierService } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureCommunityTier() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<'
    },
    link(scope, element) {
      const renderTier = () => {
        if (!ConfigureCommunityTierService || !scope.group) {
          return;
        }

        ConfigureCommunityTierService.renderConfigureCommunityTier(element[0], {
          group: scope.group
        });
      };

      element.ready(renderTier);

      scope.$on('$destroy', () => {
        ConfigureCommunityTierService?.unmountConfigureCommunityTier?.(element[0]);
      });

      scope.$watch(
        () => scope.group?.id,
        (newVal, oldVal) => {
          if (newVal && newVal !== oldVal) {
            renderTier();
          }
        }
      );
    }
  };
}

configureGroupModule.directive('configureCommunityTier', configureCommunityTier);

export default configureCommunityTier;
