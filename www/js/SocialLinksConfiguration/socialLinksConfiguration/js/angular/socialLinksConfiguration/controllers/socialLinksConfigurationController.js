import socialLinksConfigurationModule from "../socialLinksConfigurationModule";

function socialLinksConfigurationController(socialLinksConstants, socialLinksService, languageResource, systemFeedbackService) {
    "ngInject";
    var ctrl = this;
    var lastTypeTarget = "";

    ctrl.canAddSocialLink = function () {
        return ctrl.socialLinks.length < Number(ctrl.socialLinkLimit);
    };

    ctrl.addSocialLink = function () {
        ctrl.socialLinks.push({
            id: 0,
            title: "",
            url: "",
            type: "",
            target: {
                id: ctrl.targetId,
                type: ctrl.targetType
            }
        });
    };

    ctrl.setFeedback = function (success, resourceKey, resourceParameters) {
        if (ctrl.v2) {
            var feedbackMessage = languageResource.get(resourceKey, resourceParameters);
            if (success) {
                systemFeedbackService.success(feedbackMessage);
            } else {
                systemFeedbackService.warning(feedbackMessage);
            }
        } else {
            ctrl.feedbackSuccess = success;
            ctrl.feedbackMessage = languageResource.get(resourceKey, resourceParameters);
        }
    };

    var init = function () {
        var key = ctrl.targetType + ":" + ctrl.targetId;
        if (lastTypeTarget === key) {
            return;
        }

        ctrl.layout = {
            isLoading: true
        };

        lastTypeTarget = key;
        ctrl.socialLinks = [];
        ctrl.socialLinksMetadata = {};

        const isGamePage = ctrl.targetType === socialLinksConstants.targetTypes.game;

        socialLinksService.getSocialLinks(ctrl.targetType, ctrl.targetId, isGamePage)
            .then(function (socialLinksResponse = {}) {
                ctrl.socialLinks = socialLinksResponse.data || [];
                ctrl.socialLinksVerificationStatus = socialLinksResponse.socialLinksVerificationStatus;

                if (socialLinksResponse.socialLinksMetadata) {
                    ctrl.socialLinksMetadata = socialLinksResponse.socialLinksMetadata;
                }
            })
            .catch(function (errorCode) {
                switch (errorCode) {
                    case socialLinksConstants.errorCodes.internal.featureDisabled:
                        if (ctrl.v2) {
                            ctrl.layout.errorMessage = languageResource.get("Message.SocialLinksEditDisabledError");
                        } else {
                            ctrl.setFeedback(false, "Message.SocialLinksEditDisabledError");
                        }
                        break;
                    default:
                        if (ctrl.v2) {
                            ctrl.layout.errorMessage = languageResource.get("Message.UnknownError");
                        } else {
                            ctrl.setFeedback(false, "Message.UnknownError");
                        }
                        break;
                }
        }).finally(function () {
            ctrl.layout.isLoading = false;
        });
    };

    ctrl.$onInit = init;
    ctrl.$onChanges = init;
};

socialLinksConfigurationModule.controller("socialLinksConfigurationController", socialLinksConfigurationController);
export default socialLinksConfigurationController;