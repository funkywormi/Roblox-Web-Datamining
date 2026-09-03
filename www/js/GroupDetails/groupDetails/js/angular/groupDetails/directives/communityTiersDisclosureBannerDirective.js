import { GroupProfileHeaderService } from 'Roblox';
import groupModule from '../groupModule';

function communityTiersDisclosureBanner() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      groupId: '<',
      isGroupMember: '<',
      isCommunityPage: '<'
    },
    link(scope, element) {
      const renderBanner = () => {
        if (!scope.groupId) {
          return;
        }

        GroupProfileHeaderService?.renderCommunityTiersDisclosureBanner(element[0], {
          groupId: scope.groupId,
          isGroupMember: scope.isGroupMember,
          isCommunityPage: scope.isCommunityPage
        });
      };

      element.ready(renderBanner);

      scope.$watch(
        () => ({
          groupId: scope.groupId,
          isGroupMember: scope.isGroupMember,
          isCommunityPage: scope.isCommunityPage
        }),
        (newVal, oldVal) => {
          if (!newVal.groupId) {
            return;
          }

          if (
            newVal.groupId !== oldVal.groupId ||
            newVal.isGroupMember !== oldVal.isGroupMember ||
            newVal.isCommunityPage !== oldVal.isCommunityPage
          ) {
            renderBanner();
          }
        },
        true
      );
    }
  };
}

groupModule.directive('communityTiersDisclosureBanner', communityTiersDisclosureBanner);

export default communityTiersDisclosureBanner;
