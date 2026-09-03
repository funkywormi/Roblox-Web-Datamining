import configureGroupModule from '../../configureGroupModule';

const configureGroupEnemiesList = {
    templateUrl: "configure-group-enemies-list",
    bindings: {
        "groupId": "<",
        "relationshipType": "<"
    },
    controller: "configureGroupAffiliatesListController"
};

configureGroupModule.component("configureGroupEnemiesList", configureGroupEnemiesList);

export default configureGroupEnemiesList;
