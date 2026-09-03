import configureGroupModule from '../../configureGroupModule';
import {
  fetchTranslations
} from 'roblox-badges';
import { CurrentUser, Endpoints } from "Roblox";

function changeNameModalController(
    $scope,
    $uibModalInstance,
    $log,
    $filter,
    $window,
    modalData,
    configureGroupService,
    groupsService,
    groupsConstants,
    modalService,
    languageResource
) {
    "ngInject";
    $scope.params = modalData;
    const nameChangeCost = $scope.params.metadata.groupNameChangeConfiguration.cost;

    var showVerifiedEmailRequiredModal = function () {
        const verifiedEmailRequiredModal = modalService.open({
            titleText: languageResource.get('Header.VerifiedEmailRequired'),
            bodyText: languageResource.get('Description.VerifiedEmailRequired'),
            actionButtonShow: true,
            actionButtonText: languageResource.get('Action.GoToSettings'),
            neutralButtonText: languageResource.get('Action.Cancel')
        });

        verifiedEmailRequiredModal.result.then(function () {
            // Navigate to Account Settings
            $window.location.href = Endpoints.getAbsoluteUrl("/my/account");
        });
    };

    $scope.changeName = function () {
        $scope.layout.errorMessage = null;
        $scope.layout.isLoading = true;
        configureGroupService.changeName($scope.params.groupId, $scope.layout.name).then(function (result) {
            // TODO https://jira.rbx.com/browse/GRPS-385 update this to just refresh the name and cooldown data
            location.reload();
            $uibModalInstance.close();
        }, function (data) {
            $log.debug("--changeName-error---");
            if (data.errors && data.errors.length > 0) {
                const error = data.errors[0];
                switch (error.code) {
                    case groupsConstants.errorCodes.internal.verifiedEmailRequired:
                        $uibModalInstance.dismiss();
                        showVerifiedEmailRequiredModal();
                        return;
                    case groupsConstants.errorCodes.internal.nameModerated:
                        $scope.layout.name = error.fieldData;
                    default:
                        $scope.layout.errorMessage = error.userFacingMessage;
                        $scope.layout.isLoading = false;
                        break;
                }
            } else {
                $scope.layout.errorMessage = languageResource.get(groupsConstants.translations.defaultError);
                $scope.layout.isLoading = false;
            }
        });
    };

    $scope.toggleAreTermsAccepted = function () {
        $scope.layout.areTermsAccepted = !$scope.layout.areTermsAccepted;
    };

    var loadUserCurrency = function (userId) {
        groupsService.getUserCurrency(userId).then(function (robux) {
            $scope.layout.userFunds = robux;
            $scope.layout.remainingFunds = robux - nameChangeCost;
            $scope.layout.remainingFundsHtml = groupsConstants.robuxIconHtml + $filter('number')($scope.layout.remainingFunds);
        }, function (data) {
            $log.debug("--loadUserCurrency-error---");
        });
    };

    $scope.close = function () {
        $uibModalInstance.dismiss();
    };

    $scope.init = function () {
        $scope.layout = {
            groupNameChangeCostHtml: groupsConstants.robuxIconHtml + nameChangeCost,
            areTermsAccepted: false,
            showVerifiedBadgeForGroup: false,
            verifiedBadgeChangeGroupNameListItemText: fetchTranslations().translatedVerifiedBadgeGroupNameChangeText,
        };

        loadUserCurrency(CurrentUser.userId);

        groupsService
          .getGroup($scope.params.groupId)
          .then(data => {
            const { hasVerifiedBadge } = data;

            $scope.layout.showVerifiedBadgeForGroup = hasVerifiedBadge;
          })
          .catch(() => {
            $scope.layout.showVerifiedBadgeForGroup = false;
          });
        };

    $scope.init();
};

configureGroupModule.controller("changeNameModalController", changeNameModalController);
export default changeNameModalController;
