import groupListModule from "../groupListModule";

const groupsList = {
    templateUrl: "groups-list",
    bindings: {
        "groupList": "<",
        "currentGroup": "<",
        "maxGroups": "<",
        "isLoadingGroups": "<",
        "loadFailure": "<"
    },
    controller: "groupsListController"
};

groupListModule.component("groupsList", groupsList);

export default groupsList;