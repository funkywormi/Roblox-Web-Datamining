import configureGroupModule from '../../configureGroupModule';

const configureGroupAllies = {
    templateUrl: "configure-group-allies",
    bindings: {
        "group": "<",
        "relationshipType": "<"
    }
};

configureGroupModule.component("configureGroupAllies", configureGroupAllies);

export default configureGroupAllies;
