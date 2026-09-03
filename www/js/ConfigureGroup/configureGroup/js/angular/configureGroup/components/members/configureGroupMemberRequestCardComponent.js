import configureGroupModule from '../../configureGroupModule';

const configureGroupMemberRequestCard = {
    templateUrl: "configure-group-member-request-card",
    bindings: {
        "group": "<",
        "memberRequest": "<",
        "reloadCurrentPage": "&"
    },
    controller: "configureGroupMemberRequestCardController"
};

configureGroupModule.component("configureGroupMemberRequestCard", configureGroupMemberRequestCard);

export default configureGroupMemberRequestCard;