import configureGroupModule from '../../configureGroupModule';

const configureGroupEnemies = {
    templateUrl: "configure-group-enemies",
    bindings: {
        "group": "<",
        "relationshipType": "<"
    }
};

configureGroupModule.component("configureGroupEnemies", configureGroupEnemies);

export default configureGroupEnemies;
