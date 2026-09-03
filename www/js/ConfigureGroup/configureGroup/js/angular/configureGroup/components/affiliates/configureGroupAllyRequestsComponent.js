import configureGroupModule from '../../configureGroupModule';

const configureGroupAllyRequests = {
    templateUrl: "configure-group-ally-requests",
    bindings: {
        "groupId": "<",
        "relationshipType": "<"
    },
    controller: "configureGroupAffiliateRequestsController"
};

configureGroupModule.component("configureGroupAllyRequests", configureGroupAllyRequests);

export default configureGroupAllyRequests;
