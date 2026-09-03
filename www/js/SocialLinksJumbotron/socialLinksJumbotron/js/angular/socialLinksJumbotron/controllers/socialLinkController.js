import socialLinksJumbotronModule from "../socialLinksJumbotronModule";
import { EventStream } from 'Roblox';

function socialLinkController(socialLinksConstants, modalService, $window, languageResource) {
    "ngInject";
    var ctrl = this;

    ctrl.socialMediaTypes = socialLinksConstants.socialMediaTypes;

    ctrl.socialLinkClick = function () {
        var eventPayload = {
            assignmentId: ctrl.target.id,
            assignmentType: ctrl.target.type,
            socialLinkType: ctrl.type,
            socialLinkUrl: ctrl.url,
            socialLinkDisplayType: ctrl.displayType
        };

        if (EventStream && EventStream.SendEvent) {
            EventStream.SendEvent(socialLinksConstants.eventSteamEventNames.click, ctrl.target.type, eventPayload);
        }
    };

    ctrl.socialLinkOffPlatformClick = function () {
        var moveOffsiteModal = modalService.open({
          titleText: languageResource.get(socialLinksConstants.translations.socialLinkoffPlatformModalTitle),
          bodyText: languageResource.get(socialLinksConstants.translations.socialLinkoffPlatformModalBody, { lineBreak: '\n\n'}),
          actionButtonShow: true,
          actionButtonText: languageResource.get(socialLinksConstants.translations.socialLinkoffPlatformModalContinueButtonText),
          neutralButtonText: languageResource.get(socialLinksConstants.translations.socialLinkoffPlatformModalCancelButtonText),
          actionButtonClass: 'btn-primary-md',
        });

        moveOffsiteModal.result.then(function () {
             ctrl.socialLinkClick();
             $window.open(ctrl.url, "_blank");
        }, angular.noop);
    };
};

socialLinksJumbotronModule.controller("socialLinkController", socialLinkController);
export default socialLinkController;