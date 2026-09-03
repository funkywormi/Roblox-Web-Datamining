import groupListModule from "../groupListModule";

const groupsListItem = {
    templateUrl: "groups-list-item",
    bindings: {
        "group": "<"
    },
    controller: "groupsListItemController"
};

groupListModule.component("groupsListItem", groupsListItem);

export default groupsListItem;