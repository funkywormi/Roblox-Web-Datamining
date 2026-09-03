import { GroupForumsService } from 'Roblox';
import groupModule from '../groupModule';

function groupForumsDiscovery() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      groupId: '<',
      permissions: '<',
      channelsPermissions: '<',
      isGroupMember: '<',
      isEnabled: '<'
    },
    link(scope, element) {
      const renderForumsDiscovery = () => {
        // Don't render until we have both group and permissions
        if (!scope.groupId || !scope.permissions) {
          return;
        }
        GroupForumsService?.renderGroupForumsDiscovery(element[0], {
          groupId: scope.groupId,
          permissions: scope.permissions,
          channelsPermissions: scope.channelsPermissions,
          isGroupMember: scope.isGroupMember,
          isEnabled: scope.isEnabled
        });
      };

      element.ready(renderForumsDiscovery);

      scope.$on('$destroy', () => {
        GroupForumsService?.unmountGroupForums?.(element[0]);
      });

      scope.$watch(
        () => ({
          groupId: scope.groupId,
          permissions: scope.permissions,
          channelsPermissions: scope.channelsPermissions,
          isGroupMember: scope.isGroupMember,
          isEnabled: scope.isEnabled
        }),
        (newVal, oldVal) => {
          // Don't rerender until we have both group and permissions
          if (!newVal.groupId || !newVal.permissions) {
            return;
          }

          // Only rerender if the group id or permissions have changed
          if (
            newVal.groupId !== oldVal.groupId ||
            newVal.isEnabled !== oldVal.isEnabled ||
            JSON.stringify(newVal.permissions) !== JSON.stringify(oldVal.permissions) ||
            JSON.stringify(newVal.channelsPermissions) !==
              JSON.stringify(oldVal.channelsPermissions) ||
            newVal.isGroupMember !== oldVal.isGroupMember
          ) {
            renderForumsDiscovery();
          }
        },
        true
      );
    }
  };
}

groupModule.directive('groupForumsDiscovery', groupForumsDiscovery);

export default groupForumsDiscovery;
