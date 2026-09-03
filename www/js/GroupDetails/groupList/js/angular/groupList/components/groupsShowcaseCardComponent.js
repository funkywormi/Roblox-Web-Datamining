import groupListModule from '../groupListModule';

const groupsShowcaseCard = {
    templateUrl: "groups-showcase-card",
    bindings: {
        group: '<'
    },
    controller: "groupsListItemController"
};

groupListModule.component("groupsShowcaseCard", groupsShowcaseCard);
export default groupsShowcaseCard;
