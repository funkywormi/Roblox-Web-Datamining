import groupPayoutsModule from '../groupPayoutsModule.js';
import { CurrentUser } from 'Roblox';

function groupAddFundsController(
    $uibModal,
    $filter,
    groupPayoutsService,
    groupsService,
    groupPayoutsConstants)
{
    "ngInject";
    var ctrl = this;
    ctrl.userId = CurrentUser.userId;
    ctrl.userName = CurrentUser.name;

    function getErrorMessage(errorCode, params) {
        var key = groupPayoutsConstants.addFundsErrorCodeMessages[errorCode] || "Message.GeneralAddFundsError";
        return $filter('translate')(key, params);
    }

    function loadUserFunds() {
        groupsService.getUserCurrency(ctrl.userId)
            .then(function success(result) {
                ctrl.userBalance = result || ctrl.userBalance;
            })
    }

    function loadLatestFundsTransfer() {
        groupPayoutsService.getAddFundsLatest(ctrl.group.id)
          .then(function success(result) {
              ctrl.transactionDate = result.transactionDate;
              ctrl.rateLimitInDays = result.rateLimitInDays;
              ctrl.addFundsMaxRobux = result.addFundsMaxRobux || ctrl.addFundsMaxRobux;
          })
    }

    ctrl.addFunds = function (robuxAmount) {
        const modalParams = {
            animation: false,
            templateUrl: 'group-add-funds-modal',
            controller: 'groupAddFundsModalController',
            resolve: {
                modalData: {
                    robuxAmount,
                    CurrentUser,
                    group: ctrl.group
                }
            }
        };

        $uibModal.open(modalParams);
    };

    ctrl.inputChanged = function (event, robuxAmount) {
        // We use the /addFunds/ errorCodes here.
        if (robuxAmount > ctrl.addFundsMaxRobux) {
            var robuxFormatted = $filter('number')(ctrl.addFundsMaxRobux);
            ctrl.inputError = getErrorMessage(14, {robux: robuxFormatted});
        } else if (robuxAmount > ctrl.userBalance) {
            ctrl.inputError = getErrorMessage(16);
        } else {
            ctrl.inputError = undefined;
        }
    };

    ctrl.isTransferDisabled = function (robuxAmount) {
        return (typeof ctrl.inputError === 'string') || robuxAmount === null || isNaN(robuxAmount);
    }

    var init = function () {
        // Defaults
        ctrl.inputError = undefined;
        ctrl.addFundsMaxRobux = groupPayoutsConstants.addFundsMaxRobuxDefault;
        ctrl.userBalance = ctrl.addFundsMaxRobux;

        loadUserFunds();
        loadLatestFundsTransfer();
    };

    ctrl.$onInit = init;
}

groupPayoutsModule.controller("groupAddFundsController", groupAddFundsController);
export default groupAddFundsController;
