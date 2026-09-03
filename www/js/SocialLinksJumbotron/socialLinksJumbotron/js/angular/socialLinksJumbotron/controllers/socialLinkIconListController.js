import socialLinksJumbotronModule from "../socialLinksJumbotronModule";

function socialLinkIconListController(socialLinksConstants, socialLinksService) {
    "ngInject";
    var ctrl = this;

    var init = function () {
        ctrl.socialLinks = [];
        ctrl.socialLinkDisplayTypes = socialLinksConstants.socialLinkDisplayTypes;

        socialLinksService.getSocialLinks(ctrl.targetType, ctrl.targetId, false).then(function (socialLinksResponse) {
            const socialLinksData = socialLinksResponse.data || [];
            ctrl.socialLinks = socialLinksData.filter(function (socialLink) {
                var availableIconType = socialLinksConstants.availableIconTypes.indexOf(socialLink.type);
                return availableIconType >= 0;
            });
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

socialLinksJumbotronModule.controller("socialLinkIconListController", socialLinkIconListController);
export default socialLinkIconListController;