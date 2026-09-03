import configureGroupModule from '../../configureGroupModule';

function configureGroupAffiliateRequestCardController(thumbnailConstants, configureGroupAffiliatesService, systemFeedbackService) {
    "ngInject";

    var ctrl = this;

    ctrl.acceptRequest = function (relatedGroupId) {
        ctrl.cardActive = true;
        configureGroupAffiliatesService.acceptAffiliateRequest(ctrl.groupId, ctrl.relationshipType, relatedGroupId).then(function () {
            ctrl.reloadCurrentPage();
        }, function (error) {
            ctrl.errorResponse(error);
        });
    };

    ctrl.declineRequest = function (relatedGroupId) {
        ctrl.cardActive = true;
        configureGroupAffiliatesService.declineAffiliateRequest(ctrl.groupId, ctrl.relationshipType, relatedGroupId).then(function () {
            ctrl.reloadCurrentPage();
        }, function (error) {
            ctrl.errorResponse(error);
        });
    };

    ctrl.errorResponse = function (errors) {
        ctrl.cardActive = false;
        var message = "";
        errors.forEach(function (e) {
            message += e.userFacingMessage;
        });
        systemFeedbackService.warning(message);
    };

    var init = function () {
        ctrl.thumbnailTypes = thumbnailConstants.thumbnailTypes;
    };

    ctrl.$onInit = init;
}

configureGroupModule.controller('configureGroupAffiliateRequestCardController', configureGroupAffiliateRequestCardController);

export default configureGroupAffiliateRequestCardController;