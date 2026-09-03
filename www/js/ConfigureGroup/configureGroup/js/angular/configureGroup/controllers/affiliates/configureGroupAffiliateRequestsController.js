import configureGroupModule from '../../configureGroupModule';

function configureGroupAffiliateRequestsController($scope, $filter, configureGroupConstants, cursorPaginationService, $q, $log, configureGroupAffiliatesService, systemFeedbackService, languageResource) {
    "ngInject";

    var ctrl = this;

    $scope.affiliateRequestsPager = cursorPaginationService.createPager({
        cursorName: "startRowIndex",
        limitName: "maxRows",
        firstPageCursor: "0",

        pageSize: configureGroupConstants.pageSize,
        loadPageSize: configureGroupConstants.loadPageSize,

        getCacheKeyParameters: function () {
            return {
                groupId: ctrl.groupId,
                groupRelationshipType: ctrl.relationshipType
            };
        },

        getRequestUrl: function () {
            return $filter("formatString")(configureGroupConstants.urls.groupRelationshipsRequestsUrl, {
                groupId: ctrl.groupId,
                groupRelationshipType: ctrl.relationshipType
            });
        },

        getNextPageCursorFromResponse: function (response) {
            if (!response.nextRowIndex || response.totalGroupCount <= response.nextRowIndex) {
                return null;
            }

            return response.nextRowIndex.toString();
        },

        getDataListFromResponse: function (response) {
            return $q(function (resolve, reject) {
                resolve(response.relatedGroups);
            });
        },

        loadSuccess: function (groups) {
            groups.forEach(function (group) {
                group.url = $filter("seoUrl")("groups", group.id, group.name);
            });
            ctrl.affiliateRequests = groups;
            ctrl.layout.isLoading = false;
            ctrl.loadAffiliateRequestsError = false;
        },

        loadError: function (errors) {
            ctrl.affiliateRequests = [];
            ctrl.layout.isLoading = false;
            ctrl.loadAffiliateRequestsError = true;
            $log.debug(" ------ getGroupRelationships error -------");
        }
    });

    ctrl.acceptAllRequests = function () {
        var groupIds = ctrl.affiliateRequests.map(request => request.id);
        configureGroupAffiliatesService.acceptAffiliateRequests(ctrl.groupId, ctrl.relationshipType, groupIds).then(function (result) {
            $scope.affiliateRequestsPager.removeCurrentPage();
        }, function (errors) {
            systemFeedbackService.warning(languageResource.get("Message.UnableToAcceptAllRequests"));
        });
    };

    ctrl.declineAllRequests = function () {
        var groupIds = ctrl.affiliateRequests.map(request => request.id);
        configureGroupAffiliatesService.ignoreAffiliateRequests(ctrl.groupId, ctrl.relationshipType, groupIds).then(function (result) {
            $scope.affiliateRequestsPager.removeCurrentPage();
        }, function (errors) {
            systemFeedbackService.warning(languageResource.get("Message.UnableToDeclineAllRequests"));
        });
    };

    var init = function () {
        ctrl.layout = {
            isLoading: true
        };
        $scope.affiliateRequestsPager.loadFirstPage();
    };

    ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupAffiliateRequestsController', configureGroupAffiliateRequestsController);

export default configureGroupAffiliateRequestsController;
