import groupSearchModule from '../groupSearchModule';

function groupResultsBase(groupResources) {
    "ngInject";
    return {
        restrict: "A",
        scope: true,
        templateUrl: groupResources.templates.GroupResultsBaseTemplate
    }
}
groupSearchModule.directive("groupResultsBase", groupResultsBase);

export default groupResultsBase;