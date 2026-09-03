import { GroupForumsService } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function configureGroupForums() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      permissions: '<',
      channelsPermissions: '<',
      policies: '<',
      metadata: '<'
    },
    link(scope, element) {
      const renderForumsConfig = () => {
        if (!GroupForumsService || !scope.group) {
          return;
        }

        GroupForumsService.renderGroupForumsConfigSection(element[0], {
          group: scope.group,
          permissions: scope.permissions,
          channelsPermissions: scope.channelsPermissions,
          displayPermissionsConfig: scope.policies?.displayForumCategoryPermissionsConfiguration,
          metadata: scope.metadata
        });
      };

      element.ready(renderForumsConfig);

      scope.$on('$destroy', () => {
        GroupForumsService?.unmountGroupForums?.(element[0]);
      });

      // `policies` loads asynchronously, so the element.ready render alone can capture
      // `displayPermissionsConfig: undefined` and hide the role-config carrot for the
      // session; re-render once data arrives (mirrors configureGroupMembersV2).
      // permissions/channelsPermissions are subtrees of `group`, so watching `group` covers them.
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
            JSON.stringify(newVal) !== JSON.stringify(oldVal)
          ) {
            renderForumsConfig();
          }
        },
        true
      );
    }
  };
}

configureGroupModule.directive('configureGroupForums', configureGroupForums);

export default configureGroupForums;
