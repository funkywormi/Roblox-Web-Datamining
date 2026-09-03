import angular from 'angular';
import chatModule from '../chatModule';

function selectFriendsResize(chatUtility, $log) {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element, attrs) {
      const heightOfHeader = scope.chatLibrary.layout.topBarHeight;
      scope.$watch(
        function () {
          return element.innerHeight();
        },
        function (newValue, oldValue) {
          if (newValue && newValue !== oldValue) {
            const dialogElm = `#${scope.dialogData.layoutId} .dialog-container`;
            const scrollbarElm = `#${scope.dialogData.layoutId} ${scope.friendsScrollbarElm}`;
            const dialogObj = angular.element(dialogElm);
            const scrollbarObj = angular.element(scrollbarElm);
            let heightOfDialog;
            let heightOfScrollbar;
            let valueExcludedFromHeight =
              heightOfHeader + scope.chatLibrary.layout.detailsActionHeight + newValue;
            if (scope.dialogData.dialogType === chatUtility.dialogType.NEWGROUPCHAT) {
              valueExcludedFromHeight += scope.chatLibrary.layout.detailsInputHeight;
            }
            heightOfDialog = dialogObj.height();
            heightOfScrollbar = heightOfDialog - valueExcludedFromHeight;

            scrollbarObj.css('height', heightOfScrollbar);
            scrollbarObj.mCustomScrollbar('update');
          }
        },
        true
      );
    }
  };
}

chatModule.directive('selectFriendsResize', selectFriendsResize);

export default selectFriendsResize;
