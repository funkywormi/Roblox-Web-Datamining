import premiumModule from "../premiumModule";

function premiumConstantsService($log, languageResource) {
    "ngInject";

    var lang = languageResource;
    return {
        links: {
            robuxHelper: lang.get("Link.RobuxHelp")
        },
        errorMessages: {
            noData: lang.get("Message.NoDataError"),
            general: lang.get("Message.GeneralError")
        },
        modalParams: {
            switchPlan: function (price, renewalDate, cssClass) {
                return {
                    titleText: lang.get("Heading.SwitchPlanModal"),
                    bodyText: lang.get("Message.SwitchPlanBody", { price: price, renewalDate: renewalDate }),
                    actionButtonShow: true,
                    actionButtonText: lang.get("Label.Confirm"),
                    neutralButtonText: lang.get("Label.Cancel"),
                    cssClass: cssClass
                }
            },
            alreadyCancelled: function (expiredDate) {
                return {
                    titleText: lang.get("Heading.SubscriptionUnavailable"),
                    bodyText: lang.get("Message.SubscriptionUnavailableModal", { expiredDate: expiredDate }),
                    actionButtonShow: false
                }
            },
            serverError: {
                titleText: lang.get("Heading.ServerError"),
                bodyText: lang.get("Message.ServerError"),
                actionButtonShow: false
            },
            generalError: {
                titleText: lang.get("Heading.GeneralError"),
                bodyText: lang.get("Message.GeneralError"),
                actionButtonShow: false
            }
        }
    };
}

premiumModule
    .factory("premiumConstantsService", premiumConstantsService);

export default premiumConstantsService;