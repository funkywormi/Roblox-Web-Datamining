import cursorPaginationModule from "../cursorPaginationModule";
/*
    When using this directive make sure the parent $scope has a cursorPaginationService pager indexed by the cursor-pagination attribute value
*/
function cursorPagination(cursorPaginationResource) {
    "ngInject";
    return {
        restrict: "A",
        templateUrl: cursorPaginationResource.templateUrls.cursorPagination,
        link: function ($scope, $element, $attrs) {
            $scope.cursorPaging = $scope[$attrs.cursorPagination];
        }
    };
}

cursorPaginationModule.directive("cursorPagination", cursorPagination);

export default cursorPagination;