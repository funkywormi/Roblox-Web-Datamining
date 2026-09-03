import configureGroupModule from "../configureGroupModule";

function configureGroupMenuController($scope) {
    "ngInject";

    var ctrl = this;

    $scope.$on('ngRepeatFinished', function (event) {
        ctrl.resetVerticalMenu = true;
    });

    var init = function () {
        ctrl.resetVerticalMenu = false;
    };

    ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupMenuController', configureGroupMenuController);
export default configureGroupMenuController;