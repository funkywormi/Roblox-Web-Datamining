import groupListModule from '../groupListModule';

function groupsListBase(groupsListConstants) {
    "ngInject";
    return {
        restrict: "A",
        scope: true,
        templateUrl: groupsListConstants.templates.groupsListBaseTemplate
    }
};

groupListModule.directive("groupsListBase", groupsListBase);

export default groupsListBase;
