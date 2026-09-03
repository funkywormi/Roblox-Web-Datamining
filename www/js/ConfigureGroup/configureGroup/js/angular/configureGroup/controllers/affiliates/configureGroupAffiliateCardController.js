import configureGroupModule from '../../configureGroupModule';

function configureGroupAffiliateCardController($log, groupsConstants, configureGroupConstants, thumbnailConstants, modalService, languageResource, configureGroupAffiliatesService, systemFeedbackService) {
    "ngInject";

    var ctrl = this;

    function closePopover() {
        // Click / outsideClick is the best trigger we can come up with for angular
        // bootstrap popover, but what that means is that clicking a menu element that
        // opens a modal leaves the menu open. This sends an outsideClick event to the
        // popover and forces it to close in a safe way, while still leveraging triggers.
        angular.element(document.querySelector('body')).click();
    }

    ctrl.showModal = function (titleText, bodyText, actionButtonId) {
        return modalService.open({
            titleText: titleText,
            bodyText: bodyText,
            actionButtonShow: true,
            actionButtonId: actionButtonId,
            actionButtonText: languageResource.get('Action.Remove'),
            neutralButtonText: languageResource.get(configureGroupConstants.translations.cancelAction)
        });
    };

    ctrl.removeAffiliate = function () {
        closePopover();
        var affiliateString = ctrl.isAlliesPage ? languageResource.get('Description.RemoveAlly') : languageResource.get('Description.RemoveEnemy');
        var affiliateTitle = ctrl.isAlliesPage ? languageResource.get('Heading.RemoveAlly') : languageResource.get('Heading.RemoveEnemy');
        var modal = ctrl.showModal(affiliateTitle, affiliateString, "remove-affiliate-button");

        modal.result.then(function () {
            configureGroupAffiliatesService.deleteGroupRelationship(ctrl.groupId, ctrl.relationshipType, ctrl.affiliateGroup.id)
                .then(function (result) {
                    ctrl.reloadCurrentPage();
                }, function (errors) {
                    systemFeedbackService.warning(languageResource.get("Message.UnableToRemoveAffiliate"));
                    $log.debug("--deleteGroupRelationship-error---");
                });

        });
    };

    var init = function () {
        ctrl.isAlliesPage = ctrl.relationshipType === groupsConstants.relationshipTypes.allies;
        ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    };

    ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupAffiliateCardController', configureGroupAffiliateCardController);

export default configureGroupAffiliateCardController;