import configureGroupModule from '../../configureGroupModule';

function configureGroupAffiliatesListController($scope, $filter, configureGroupConstants, cursorPaginationService, $q, $log, $uibModal, groupsConstants) {
    "ngInject";

    var ctrl = this;

    ctrl.showAffiliateRequestModal = function () {
        var modalParams = {
            animation: false,
            templateUrl: "send-affiliate-request-modal",
            controller: "sendAffiliateRequestModalController",
            resolve: {
                modalData: {
                    currentGroupId: ctrl.groupId,
                    relationshipType: ctrl.relationshipType,
                    loadFirstPage: function () {
                        $scope.affiliatesPager.loadFirstPage();
                    }
                }
            }
        };

        $uibModal.open(modalParams);
    };

    $scope.affiliatesPager = cursorPaginationService.createPager({
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
            return $filter("formatString")(groupsConstants.urls.getGroupRelationships, {
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
            ctrl.affiliates = groups;
            ctrl.layout.isLoading = false;
        },

        loadError: function (errors) {
            ctrl.affiliates = [];
            ctrl.layout.isLoading = false;
            ctrl.loadAffiliatesError = true;
            $log.debug(" ------ getGroupRelationships error -------");
        }
    });

    var init = function () {
        ctrl.layout = {
            isLoading: true
        };
        $scope.affiliatesPager.loadFirstPage();
    };

    ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupAffiliatesListController', configureGroupAffiliatesListController);

export default configureGroupAffiliatesListController;