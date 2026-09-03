import configureGroupModule from '../../configureGroupModule';

const configureGroupAffiliateCard = {
    templateUrl: "configure-group-affiliate-card",
    bindings: {
        "groupId": "<",
        "affiliateGroup": "<",
        "relationshipType": "<",
        "reloadCurrentPage": "&"
    },
    controller: "configureGroupAffiliateCardController"
};

configureGroupModule.component("configureGroupAffiliateCard", configureGroupAffiliateCard);

export default configureGroupAffiliateCard;