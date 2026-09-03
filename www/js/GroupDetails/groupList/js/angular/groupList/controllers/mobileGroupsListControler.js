import groupListModule from "../groupListModule";

function mobileGroupsListController() {
    "ngInject";
    var ctrl = this;

    var init = function () {
        if (ctrl.groups.length > 0 && ctrl.groups[0].isPrimary) {
            // pop it off sis
            ctrl.primaryGroup = ctrl.groups[0];
            ctrl.groups = ctrl.groups.slice(1, ctrl.groups.length);
        }
    };

    ctrl.$onInit = init
    ctrl.$onChanges = init
}

groupListModule.controller("mobileGroupsListController", mobileGroupsListController);
export default mobileGroupsListController;
