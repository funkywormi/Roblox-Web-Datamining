import configureGroupModule from '../../configureGroupModule';

const configureGroupAffiliateRequestCard = {
    templateUrl: "configure-group-affiliate-request-card",
    bindings: {
        "allyRequest": "<",
        "groupId": "<",
        "relationshipType": "<",
        "reloadCurrentPage": "&"
    },
    controller: "configureGroupAffiliateRequestCardController"
};

configureGroupModule.component("configureGroupAffiliateRequestCard", configureGroupAffiliateRequestCard);

export default configureGroupAffiliateRequestCard;