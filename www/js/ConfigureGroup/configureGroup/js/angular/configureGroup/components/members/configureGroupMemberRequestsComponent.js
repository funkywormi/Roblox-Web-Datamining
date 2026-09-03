import configureGroupModule from '../../configureGroupModule';

const configureGroupMemberRequests = {
    templateUrl: "configure-group-member-requests",
    bindings: {
        "group": "<"
    },
    controller: "configureGroupMemberRequestsController"
};

configureGroupModule.component("configureGroupMemberRequests", configureGroupMemberRequests);

export default configureGroupMemberRequests;
