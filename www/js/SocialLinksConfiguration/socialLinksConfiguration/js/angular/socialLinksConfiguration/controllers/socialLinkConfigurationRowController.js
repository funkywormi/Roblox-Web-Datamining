import socialLinksConfigurationModule from "../socialLinksConfigurationModule";

function socialLinkConfigurationRowController(socialLinksConstants, socialLinksService, languageResource) {
    "ngInject";
    var ctrl = this;
    var whitespaceRegex = /^\s*$/;
    ctrl.saveInProgress = false;

    var { amazon, ...socialMediaTypesWithoutAmazon } = socialLinksConstants.socialMediaTypes;
    var { Amazon, ...socialMediaNamesWithoutAmazon } = socialLinksConstants.socialMediaNames;

    ctrl.resetOriginals = function () {
        ctrl.originalUrl = ctrl.socialLink.url;
        ctrl.originalTitle = ctrl.socialLink.title;
        ctrl.originalType = ctrl.socialLink.type;
    };

    ctrl.removeFromList = function () {
        var socialLinkIndex = ctrl.socialLinks.indexOf(ctrl.socialLink);
        if (socialLinkIndex >= 0) {
            ctrl.socialLinks.splice(socialLinkIndex, 1);

            // If we haven't actually saved it yet there's no reason to tell them it was removed
            // it will visually disappear. That's enough.
            if (ctrl.socialLink.id) {
                ctrl.setFeedback()(true, socialLinksConstants.translations.socialLinkRemoved);
            }
        }
    };

    ctrl.getTypeFromUrl = function (url) {
        for (var n = 0; n < ctrl.availableSocialMediaTypes.length; n++) {
            var type = ctrl.availableSocialMediaTypes[n];
            var urlRegex = socialLinksConstants.urlRegexes[type];
            if (urlRegex.test(url)) {
                return socialLinksConstants.socialMediaTypes[type];
            }
        }

        return null;
    };

    ctrl.save = function () {
        ctrl.saveInProgress = true;

        socialLinksService.saveSocialLink(ctrl.socialLink).then(function () {
            ctrl.resetOriginals();
            var feedbackTitle = ctrl.isAmazonLink() ? 'Your Amazon store link' : ctrl.socialLink.title;

            ctrl.setFeedback()(true, socialLinksConstants.translations.socialLinkSaved, {
                title: feedbackTitle,
            });

            ctrl.saveInProgress = false;
        }).catch(function (errorCode) {
            switch (errorCode) {
                case socialLinksConstants.errorCodes.internal.socialLinkRemoved:
                    ctrl.setFeedback()(false, socialLinksConstants.translations.socialLinkInvalidError);
                    break;
                case socialLinksConstants.errorCodes.internal.featureDisabled:
                    ctrl.setFeedback()(false, socialLinksConstants.translations.socialLinksEditDisabledError);
                    break;
                case socialLinksConstants.errorCodes.internal.unauthorized:
                    ctrl.setFeedback()(false, socialLinksConstants.translations.unauthorizedError);
                    break;
                case socialLinksConstants.errorCodes.internal.invalidTitle:
                    ctrl.titleErrorMessage = languageResource.get(socialLinksConstants.translations.titleModeratedError);
                    break;
                case socialLinksConstants.errorCodes.internal.noGroupPermission:
                    ctrl.urlErrorMessage = languageResource.get(socialLinksConstants.translations.noGroupPermission);
                    break;
                default:
                    ctrl.setFeedback()(false, socialLinksConstants.translations.unknownError);
                    break;
            }

            ctrl.saveInProgress = false;
        });
    };

    ctrl.remove = function () {
        if (ctrl.socialLink.id) {
            ctrl.saveInProgress = true;

            socialLinksService.deleteSocialLink(ctrl.socialLink).then(function () {
                ctrl.removeFromList();
            }).catch(function (errorCode) {
                switch (errorCode) {
                    case socialLinksConstants.errorCodes.internal.socialLinkRemoved:
                        ctrl.removeFromList();
                        return;
                    case socialLinksConstants.errorCodes.internal.featureDisabled:
                        ctrl.setFeedback()(false, socialLinksConstants.translations.socialLinksEditDisabledError);
                        break;
                    case socialLinksConstants.errorCodes.internal.unauthorized:
                        ctrl.setFeedback()(false, socialLinksConstants.translations.unauthorizedError);
                        break;
                    default:
                        ctrl.setFeedback()(false, socialLinksConstants.translations.unknownError);
                        break;
                }

                ctrl.saveInProgress = false;
            });
        } else {
            ctrl.removeFromList();
        }
    };

    ctrl.canSave = function () {
        var isAmazonLink = ctrl.isAmazonLink();

        if (ctrl.socialLink.url === ctrl.originalUrl
            && ctrl.socialLink.type === ctrl.originalType
            && (!isAmazonLink && ctrl.socialLink.title === ctrl.originalTitle)) {
            return false;
        }

        if (whitespaceRegex.test(ctrl.socialLink.url) || (!isAmazonLink && whitespaceRegex.test(ctrl.socialLink.title))) {
            return false;
        }

        var type = ctrl.getTypeFromUrl(ctrl.socialLink.url);
        if (!type || type !== ctrl.socialLink.type) {
            return false;
        }

        return !ctrl.saveInProgress;
    };

    ctrl.canDelete = function () {
        return !ctrl.saveInProgress;
    };

    ctrl.updateType = function (type) {
        ctrl.socialLink.type = type;
        ctrl.typeChanged();
    }

    ctrl.typeChanged = function () {
        for (var n = 0; n < ctrl.socialLinks.length; n++) {
            if (ctrl.socialLinks[n] !== ctrl.socialLink && ctrl.socialLinks[n].type === ctrl.socialLink.type) {
                ctrl.urlErrorMessage = languageResource.get(socialLinksConstants.translations.socialLinkTypeLimitError, {
                    socialMediaType: socialLinksConstants.socialMediaNames[ctrl.socialLink.type]
                });

                return;
            }
        }

        var expectedType = ctrl.getTypeFromUrl(ctrl.socialLink.url);

        if (ctrl.socialLink.type === expectedType) {
            ctrl.urlErrorMessage = "";
        } else {
            ctrl.urlErrorMessage = languageResource.get(socialLinksConstants.translations.urlSocialMediaTypeMismatchError);
        }
    };

    ctrl.urlChanged = function (event) {
        // The value of the url itself is not updating as expected in android webviews
        // The event target value is reliable
        if (event) {
            ctrl.socialLink.url = event.target.value;
        }

        if (whitespaceRegex.test(ctrl.socialLink.url)) {
            ctrl.urlErrorMessage = languageResource.get(socialLinksConstants.translations.urlEmptyError);
            return;
        }

        var type = ctrl.getTypeFromUrl(ctrl.socialLink.url);

        if (type) {
            ctrl.socialLink.type = type;
            ctrl.typeChanged();
        } else {
            ctrl.urlErrorMessage = languageResource.get(socialLinksConstants.translations.urlSocialMediaTypeMismatchError);
        }
    };

    ctrl.titleChanged = function (event) {
        if (ctrl.isAmazonLink()) {
            return;
        }

        // The value of the url itself is not updating as expected in android webviews
        // The event target value is reliable
        if (event) {
            ctrl.socialLink.title = event.target.value;
        }

        if (whitespaceRegex.test(ctrl.socialLink.title)) {
            ctrl.titleErrorMessage = languageResource.get(socialLinksConstants.translations.titleEmptyError);
        } else {
            ctrl.titleErrorMessage = "";
        }
    };

    ctrl.isAmazonLink = function () {
       if (ctrl.socialLink.type === socialLinksConstants.socialMediaTypes.amazon) {
           return true;
       }

       return false;
    };

    ctrl.setSocialLinkOptions = function () {
        const { AmazonStoreLinksEnabledForUser: amazonStoreLinksEnabledForUser } = ctrl.socialLinksMetadata || {};

        if (amazonStoreLinksEnabledForUser) {
            ctrl.socialMediaTypes = socialLinksConstants.socialMediaTypes;
            ctrl.availableSocialMediaTypes = socialLinksConstants.availableSocialMediaTypes[ctrl.socialLink.target.type];
            ctrl.socialMediaNames = socialLinksConstants.socialMediaNames;
        } else {
            ctrl.socialMediaTypes = socialMediaTypesWithoutAmazon;
            ctrl.socialMediaNames = socialMediaNamesWithoutAmazon;
            // 'amazon' is from the socialLinksConstants.availableSocialMediaTypes.game array (all lowercase names).
            ctrl.availableSocialMediaTypes = socialLinksConstants.availableSocialMediaTypes[ctrl.socialLink.target.type].filter(type => type !== 'amazon');
        }

    }

    var init = function () {
        ctrl.layout = socialLinksConstants.layout;

        ctrl.setSocialLinkOptions();

        ctrl.resetOriginals();
    };

    ctrl.$onInit = init;

    // The metadata request can return after this is initialized and the component needs to be updated accordingly.
    ctrl.$onChanges = ctrl.setSocialLinkOptions;
};

socialLinksConfigurationModule.controller("socialLinkConfigurationRowController", socialLinkConfigurationRowController);
export default socialLinkConfigurationRowController;
