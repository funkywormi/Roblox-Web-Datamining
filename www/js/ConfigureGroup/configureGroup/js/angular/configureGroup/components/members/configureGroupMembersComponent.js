import configureGroupModule from '../../configureGroupModule';

const configureGroupMembers = {
    templateUrl: "configure-group-members",
    bindings: {
        "group": "<",
        "metadata": "<"
    },
    controller: "configureGroupMembersController"
};

configureGroupModule.component("configureGroupMembers", configureGroupMembers);

export default configureGroupMembers;
