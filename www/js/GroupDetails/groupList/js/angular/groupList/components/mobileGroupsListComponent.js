import groupListModule from "../groupListModule";

const mobileGroupsList = {
    templateUrl: "mobile-groups-list",
    bindings: {
        "groups": "<",
        "loadFailure": "<"
    },
    controller: "mobileGroupsListController"
};

groupListModule.component("mobileGroupsList", mobileGroupsList);

export default mobileGroupsList;