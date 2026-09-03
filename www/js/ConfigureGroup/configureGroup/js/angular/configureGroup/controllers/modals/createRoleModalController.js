import configureGroupModule from '../../configureGroupModule';
import { CurrentUser } from "Roblox";

function createRoleModalController($scope, $uibModalInstance, $log, $filter, modalData, configureGroupRolesService, groupsService, groupsConstants) {
    "ngInject";
    $scope.params = modalData;

    $scope.createRole = function () {
        $scope.layout.errorMessage = null;
        $scope.layout.isLoading = true;
        configureGroupRolesService.createRole($scope.params.groupId, $scope.newRole.name, $scope.newRole.description, $scope.newRole.rank, $scope.layout.isUsingGroupFunds).then(function (result) {
            $scope.params.addRole(result);
            $uibModalInstance.close();
        }, function (err) {
            $log.debug("--createRole-error---");
            var error = err.errors ? err.errors[0] : {};
            $scope.layout.errorMessage = error.message;
            $scope.layout.isLoading = false;
        });
    };

    var updateRemainingFunds = (funds, cost) => {
        $scope.layout.remainingFunds = funds - cost;
        $scope.layout.remainingFundsHtml = groupsConstants.robuxIconHtml + $filter('number')($scope.layout.remainingFunds);
    }

    var loadGroupCurrency = function (groupId) {
        groupsService.getGroupCurrency(groupId).then(function (robux) {
            $scope.layout.groupFunds = robux;
        }, function (data) {
            $log.debug("--loadGroupCurrency-error---");
        });
    };

    var loadUserCurrency = function (userId) {
        groupsService.getUserCurrency(userId).then(function (robux) {
            $scope.layout.userFunds = robux;
            updateRemainingFunds(robux, $scope.params.metadata.roleConfiguration.cost);
        }, function (data) {
            $log.debug("--loadUserCurrency-error---");
        });
    };

    $scope.toggleIsUsingGroupFunds = function () {
        $scope.layout.isUsingGroupFunds = !$scope.layout.isUsingGroupFunds;
        updateRemainingFunds($scope.layout.isUsingGroupFunds ? $scope.layout.groupFunds : $scope.layout.userFunds, $scope.params.metadata.roleConfiguration.cost);
    };

    $scope.close = function () {
        $uibModalInstance.dismiss();
    };

    $scope.init = function () {
        const roleCost = $scope.params.metadata.roleConfiguration.cost;
        $scope.layout = {
            isUsingGroupFunds: false,
            isFreeRoleCreation: !roleCost, // 0 or null or undefined
            // Lowest is reserved for guest
            newRoleMinRank: $scope.params.metadata.roleConfiguration.minRank + 1,
            // Highest is reserved for owner
            newRoleMaxRank: $scope.params.metadata.roleConfiguration.maxRank - 1
        };

        loadGroupCurrency($scope.params.groupId);
        loadUserCurrency(CurrentUser.userId);
    };

    $scope.init();
};

configureGroupModule.controller("createRoleModalController", createRoleModalController);
export default createRoleModalController;
