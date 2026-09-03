import configureGroupModule from '../configureGroupModule';

const auditLog = {
    templateUrl: "audit-log",
    bindings: {
        "groupId": "<"
    },
    controller: "auditLogController"
};

configureGroupModule.component("auditLog", auditLog);

export default auditLog;