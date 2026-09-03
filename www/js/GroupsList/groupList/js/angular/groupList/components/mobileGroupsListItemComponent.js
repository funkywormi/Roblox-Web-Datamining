import groupListModule from "../groupListModule";

const mobileGroupsListItem = {
    templateUrl: "mobile-groups-list-item",
    bindings: {
        "group": "<"
    },
    controller: "groupsListItemController"
};

groupListModule.component("mobileGroupsListItem", mobileGroupsListItem);

export default mobileGroupsListItem;