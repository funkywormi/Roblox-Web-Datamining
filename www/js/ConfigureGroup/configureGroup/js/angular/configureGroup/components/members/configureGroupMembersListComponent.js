import configureGroupModule from '../../configureGroupModule';

const configureGroupMembersList = {
    templateUrl: "configure-group-members-list",
    bindings: {
        "group": "<",
        "metadata": "<"
    },
    controller: "configureGroupMembersListController"
};

configureGroupModule.component("configureGroupMembersList", configureGroupMembersList);

export default configureGroupMembersList;
