import configureGroupModule from '../../configureGroupModule';

function configureGroupMemberRequestsController(
  $scope,
  configureGroupConstants,
  configureGroupMembersService,
  groupsService,
  $filter,
  cursorPaginationService,
  systemFeedbackService,
  configureGroupUtilityService,
  keyCode
) {
  'ngInject';

  const ctrl = this;

  ctrl.getUserRequest = function (username) {
    ctrl.layout.isLoading = true;
    ctrl.requests = [];
    if (username) {
      groupsService.getUserIdsFromUsernames([username]).then(
        function (users) {
          if (users.length > 0) {
            const userId = users[0].id;
            configureGroupMembersService
              .getMemberRequest(ctrl.group.id, userId)
              .then(
                function (request) {
                  if (request?.requester) {
                    const currentRequest = request;
                    currentRequest.requester = configureGroupUtilityService.getNameForDisplay(
                      request.requester
                    );
                    ctrl.requests = [currentRequest];
                  }
                },
                function (error) {
                  ctrl.errorResponse(error);
                }
              )
              .finally(function () {
                ctrl.layout.isLoading = false;
              });
          } else {
            ctrl.layout.isLoading = false;
          }
        },
        function (error) {
          ctrl.errorResponse(error);
          ctrl.layout.isLoading = false;
        }
      );
    } else {
      $scope.memberRequestsPager.loadFirstPage();
    }
  };

  ctrl.acceptAllRequests = function () {
    const userIds = ctrl.requests.map(request => request.requester.userId);
    configureGroupMembersService.acceptMemberRequests(ctrl.group.id, userIds).then(
      function (result) {
        $scope.memberRequestsPager.removeCurrentPage();
        ctrl.group.memberCount += userIds.length;
      },
      function (errors) {
        systemFeedbackService.warning('Unable to accept all requests. Please try again.');
      }
    );
  };

  ctrl.declineAllRequests = function () {
    const userIds = ctrl.requests.map(request => request.requester.userId);
    configureGroupMembersService.ignoreMemberRequests(ctrl.group.id, userIds).then(
      function (result) {
        $scope.memberRequestsPager.removeCurrentPage();
      },
      function (errors) {
        systemFeedbackService.warning('Unable to decline all requests. Please try again.');
      }
    );
  };

  $scope.memberRequestsPager = cursorPaginationService.createPager({
    pageSize: configureGroupConstants.pageSize,
    loadPageSize: configureGroupConstants.loadPageSize,

    getCacheKeyParameters(params) {
      return {
        groupId: params.groupId
      };
    },

    getRequestUrl() {
      return $filter('formatString')(configureGroupConstants.urls.groupMemberRequestsUrl, {
        groupId: ctrl.group.id
      });
    },

    loadSuccess(requests) {
      requests.forEach(request => {
        const currentRequester = request.requester;
        if (currentRequester) {
          request.requester = configureGroupUtilityService.getNameForDisplay(currentRequester);
        }
      });
      ctrl.requests = requests;
      ctrl.layout.isLoading = false;
    },

    loadError(error) {
      ctrl.errorResponse(error);
      ctrl.layout.isLoading = false;
    }
  });

  ctrl.errorResponse = function (errors) {
    let message = '';
    errors.forEach(function (e) {
      message += e.userFacingMessage;
    });
    systemFeedbackService.warning(message);
  };

  const init = function () {
    ctrl.layout = {
      isLoading: true
    };
    ctrl.keyCodes = keyCode;
    ctrl.keyword = '';
    $scope.memberRequestsPager.loadFirstPage();
  };

  ctrl.$onInit = init;
}

configureGroupModule.controller(
  'configureGroupMemberRequestsController',
  configureGroupMemberRequestsController
);
export default configureGroupMemberRequestsController;
