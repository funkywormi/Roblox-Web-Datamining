import { GroupPostsService } from 'Roblox';
import groupModule from '../groupModule';

function groupPosts() {
  'ngInject';

  return {
    restrict: 'E',
    scope: {
      group: '<',
      permissions: '<',
      channelsPermissions: '<',
      userId: '<',
      isGroupMember: '<',
      forumsEnabled: '<',
      policies: '<'
    },
    link(scope, element) {
      const renderPosts = () => {
        if (!scope.group?.id || !scope.permissions) {
          return;
        }
        GroupPostsService?.renderGroupPosts(element[0], {
          group: scope.group,
          permissions: scope.permissions,
          channelsPermissions: scope.channelsPermissions,
          userId: scope.userId,
          isGroupMember: scope.isGroupMember,
          forumsEnabled: scope.forumsEnabled,
          policies: scope.policies
        });
      };

      element.ready(renderPosts);

      scope.$on('$destroy', () => {
        GroupPostsService?.unmountGroupPosts?.(element[0]);
      });

      scope.$watch(
        () => ({
          group: scope.group,
          permissions: scope.permissions,
          channelsPermissions: scope.channelsPermissions,
          userId: scope.userId,
          isGroupMember: scope.isGroupMember,
          forumsEnabled: scope.forumsEnabled,
          policies: scope.policies
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
            newVal.forumsEnabled !== oldVal.forumsEnabled ||
            JSON.stringify(newVal.policies) !== JSON.stringify(oldVal.policies)
          ) {
            renderPosts();
          }
        },
        true
      );
    }
  };
}

groupModule.directive('groupPosts', groupPosts);

export default groupPosts;
