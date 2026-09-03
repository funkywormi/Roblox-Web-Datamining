import groupPayoutsModule from '../groupPayoutsModule.js';

function groupAddFundsModalController(
    $scope,
    $filter,
    $uibModalInstance,
    modalData,
    groupPayoutsService,
    groupPayoutsConstants,
    systemFeedbackService,
    groupsConstants
){
    "ngInject";

    function getErrorMessageKey(error) {
        var code = error.errors[0].code;
        return groupPayoutsConstants.addFundsErrorCodeMessages[code] || "Message.GeneralAddFundsError";
    }

    $scope.params = modalData;
    $scope.addFunds = function () {
        groupPayoutsService.postAddFunds(modalData.group.id, modalData.robuxAmount)
        .then(function (result) {
            // TODO: move function call to parent and use modalService to prevent full page reload
            location.reload();
        }, function (error) {
            var errorMessage = $filter('translate')(getErrorMessageKey(error))
            systemFeedbackService.warning(errorMessage);
            $uibModalInstance.close();
        });
    };

    var robuxFormattedWithIcon = groupsConstants.robuxIconHtml + $filter('number')(modalData.robuxAmount);
    $scope.robuxWithIcon =  `<span class="add-funds-robux">${robuxFormattedWithIcon}</span>`;

    $scope.close = function () {
        $uibModalInstance.dismiss();
    };
}

groupPayoutsModule.controller("groupAddFundsModalController", groupAddFundsModalController);
export default groupAddFundsModalController;
