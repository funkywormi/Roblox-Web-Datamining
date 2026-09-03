import createGroupModule from "../createGroupModule.js";

function createGroupConfirmationModalController(groupsConstants) {
    "ngInject";
    var ctrl = this;

    var init = function () {
        ctrl.creationPriceHtml = '<div class="icon-robux-container">' + groupsConstants.robuxIconHtml + '<span class="text-robux">' + ctrl.resolve.metadata.cost + '</span></div>';
    };

    ctrl.$onInit = init;
    ctrl.$onChanges = init;
}

createGroupModule.controller("createGroupConfirmationModalController", createGroupConfirmationModalController);
export default createGroupConfirmationModalController;
