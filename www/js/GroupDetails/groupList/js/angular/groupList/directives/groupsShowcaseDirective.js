import groupListModule from '../groupListModule';

function groupsShowcase(groupsListConstants) {
    "ngInject";
    return {
        restrict: "A",
        controller: "groupsListBaseController",
        scope: {
            displayUserId: "="
        },
        templateUrl: groupsListConstants.templates.groupsShowcaseBaseTemplate
    }
};

groupListModule.directive("groupsShowcase", groupsShowcase);

export default groupsShowcase;