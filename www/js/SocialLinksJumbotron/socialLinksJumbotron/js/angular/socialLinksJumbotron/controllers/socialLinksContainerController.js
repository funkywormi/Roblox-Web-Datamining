import socialLinksJumbotronModule from "../socialLinksJumbotronModule";

function socialLinksContainerController(socialLinksConstants, socialLinksService) {
    "ngInject";
    var ctrl = this;
    var lastTypeTarget = "";

    var init = function () {
        var key = ctrl.targetType + ":" + ctrl.targetId;
        if (lastTypeTarget === key) {
            return;
        }

        lastTypeTarget = key;
        ctrl.socialLinks = [];
        ctrl.socialLinkDisplayTypes = socialLinksConstants.socialLinkDisplayTypes;

        socialLinksService.getSocialLinks(ctrl.targetType, ctrl.targetId, false).then(function (socialLinksResponse = {}) {
            ctrl.socialLinks = socialLinksResponse.data || [];
        }).catch(function (errorCode) {
            switch (errorCode) {
                case socialLinksConstants.errorCodes.internal.featureDisabled:
                case socialLinksConstants.errorCodes.internal.invalidViewer:
                    // Do nothing, just display no social links if the authenticated user
                    // is under 13 or the social links feature is disabled.
                    break;
                default:
                    // TODO: Handle failure case for loading social links... SOC-5018
                    break;
            }
        });
    };

    ctrl.$onInit = init;
    ctrl.$onChanges = init;
};

socialLinksJumbotronModule.controller("socialLinksContainerController", socialLinksContainerController);
export default socialLinksContainerController;