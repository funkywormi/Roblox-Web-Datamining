import { GroupProfileHeaderService } from 'Roblox';
import groupModule from '../groupModule';

function groupReactProfileHeader() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      groupId: '<',
      isCommunityProfile: '<',
      rolesData: '<',
      userRole: '<',
      permissions: '<',
      communityProfileHeaderData: '<',
      actionsData: '<',
      aboutData: '<',
      policies: '<',
      canViewMembers: '<',
      joinGroup: '&',
      cancelJoinRequest: '&',
      showLeaveGroupOrChangeOwnerModal: '&',
      makePrimary: '&',
      removePrimary: '&',
      showReportAbuseModal: '&',
      showChangeOwnerModal: '&',
      claimOwnership: '&'
    },
    link(scope, element) {
      const renderProfileHeader = () => {
        GroupProfileHeaderService?.renderGroupProfileHeaderSection(element[0], {
          groupId: scope.groupId,
          isCommunityProfile: scope.isCommunityProfile,
          rolesData: scope.rolesData,
          userRole: scope.userRole,
          permissions: scope.permissions,
          communityProfileHeaderData: scope.communityProfileHeaderData,
          actionsData: scope.actionsData,
          aboutData: scope.aboutData,
          isGroupVerificationRequiredToJoin: scope.policies?.isGroupVerificationRequiredToJoin,
          isGracefulDegradationEnabled: scope.policies?.isGracefulDegradationEnabled,
          canViewMembers: scope.canViewMembers,
          joinGroup: scope.joinGroup,
          cancelJoinRequest: scope.cancelJoinRequest,
          showLeaveGroupOrChangeOwnerModal: scope.showLeaveGroupOrChangeOwnerModal,
          makePrimary: scope.makePrimary,
          removePrimary: scope.removePrimary,
          showReportAbuseModal: scope.showReportAbuseModal,
          showChangeOwnerModal: scope.showChangeOwnerModal,
          claimOwnership: scope.claimOwnership
        });
      };

      element.ready(renderProfileHeader);

      [
        'groupId',
        'rolesData',
        'userRole',
        'isCommunityProfile',
        'permissions',
        'communityProfileHeaderData',
        'actionsData',
        'aboutData',
        'policies',
        'canViewMembers'
      ].forEach(prop => {
        scope.$watch(
          prop,
          (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              renderProfileHeader();
            }
          },
          true
        );
      });
    }
  };
}

groupModule.directive('groupReactProfileHeader', groupReactProfileHeader);

export default groupReactProfileHeader;
