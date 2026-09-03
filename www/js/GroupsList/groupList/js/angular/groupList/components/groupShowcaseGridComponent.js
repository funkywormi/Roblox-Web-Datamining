import groupListModule from '../groupListModule';

const groupsShowcaseGrid = {
    templateUrl: "groups-showcase-grid",
    bindings: {
        groupsCache: '<'
    },
    controller: "groupsShowcaseGridController"
};

groupListModule.component("groupsShowcaseGrid", groupsShowcaseGrid);
export default groupsShowcaseGrid;
