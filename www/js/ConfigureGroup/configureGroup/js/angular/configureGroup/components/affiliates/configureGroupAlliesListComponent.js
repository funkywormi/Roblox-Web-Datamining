import configureGroupModule from '../../configureGroupModule';

const configureGroupAlliesList = {
    templateUrl: "configure-group-allies-list",
    bindings: {
        "groupId": "<",
        "relationshipType": "<"
    },
    controller: "configureGroupAffiliatesListController"
};

configureGroupModule.component("configureGroupAlliesList", configureGroupAlliesList);

export default configureGroupAlliesList;
