import configureGroupModule from '../configureGroupModule';

const configureGroupRoles = {
    templateUrl: "configure-group-roles",
    bindings: {
        "group": "<",
        "metadata": "<",
        "reloadGroupFunds": "=",
        "policies": "<"
    },
    controller: "configureGroupRolesController"
};

configureGroupModule.component("configureGroupRoles", configureGroupRoles);
export default configureGroupRoles;
