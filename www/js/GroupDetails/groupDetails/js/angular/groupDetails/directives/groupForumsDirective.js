import { GroupForumsService } from 'Roblox';
import groupModule from '../groupModule';

function groupForums() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      permissions: '<',
      channelsPermissions: '<',
      userId: '<',
      isGroupMember: '<',
      isEnabled: '<'
    },
    link(scope, element) {
      const renderForums = () => {
        if (!scope.group?.id || !scope.permissions) {
          return;
        }
        GroupForumsService?.renderGroupForums(element[0], {
          group: scope.group,
          permissions: scope.permissions,
          channelsPermissions: scope.channelsPermissions,
          userId: scope.userId,
          isGroupMember: scope.isGroupMember,
          isEnabled: scope.isEnabled
        });
      };

      element.ready(renderForums);

      scope.$on('$destroy', () => {
        GroupForumsService?.unmountGroupForums?.(element[0]);
      });

      scope.$watch(
        () => ({
          group: scope.group,
          permissions: scope.permissions,
          channelsPermissions: scope.channelsPermissions,
          userId: scope.userId,
          isGroupMember: scope.isGroupMember,
          isEnabled: scope.isEnabled
        }),
        (newVal, oldVal) => {
          // Don't rerender until we have both group and permissions
          if (!newVal.group?.id || !newVal.permissions) {
            return;
          }

          // Only rerender if the group id or permissions have changed
          if (
            newVal.group.id !== oldVal.group.id ||
            JSON.stringify(newVal.permissions) !== JSON.stringify(oldVal.permissions) ||
            JSON.stringify(newVal.channelsPermissions) !==
              JSON.stringify(oldVal.channelsPermissions) ||
            newVal.userId !== oldVal.userId ||
            newVal.isGroupMember !== oldVal.isGroupMember ||
            newVal.isEnabled !== oldVal.isEnabled
          ) {
            renderForums();
          }
        },
        true
      );
    }
  };
}

groupModule.directive('groupForums', groupForums);

export default groupForums;
