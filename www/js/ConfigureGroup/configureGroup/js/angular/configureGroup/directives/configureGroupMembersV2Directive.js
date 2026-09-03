import { ConfigureGroupMembersService } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupMembersV2() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      policies: '<',
      metadata: '<'
    },
    link(scope, element) {
      const renderMembers = () => {
        if (!ConfigureGroupMembersService || !scope.group) {
          return;
        }

        ConfigureGroupMembersService.renderConfigureGroupMembers(element[0], {
          group: scope.group,
          policies: scope.policies,
          metadata: scope.metadata
        });
      };

      element.ready(renderMembers);

      scope.$watch(
        () => ({
          group: scope.group,
          policies: scope.policies,
          metadata: scope.metadata
        }),
        (newVal, oldVal) => {
          if (
            newVal.group &&
            newVal.policies &&
            newVal.metadata &&
            JSON.stringify(newVal) !== JSON.stringify(oldVal)
          ) {
            renderMembers();
          }
        },
        true
      );
    }
  };
}

configureGroupModule.directive('configureGroupMembersV2', configureGroupMembersV2);

export default configureGroupMembersV2;
