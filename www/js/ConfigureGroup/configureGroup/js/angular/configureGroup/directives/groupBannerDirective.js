import { ConfigureGroupV2Service } from 'Roblox';
import configureGroupModule from '../configureGroupModule';

function groupBanner() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      title: '<',
      content: '<',
      buttonText: '<',
      onClickButton: '<',
      isDismissedLocalStorageKey: '<'
    },
    link(scope, element) {
      element.ready(() => {
        ConfigureGroupV2Service?.renderGroupBanner(element[0], {
          title: scope.title,
          content: scope.content,
          buttonText: scope.buttonText,
          onClickButton: scope.onClickButton,
          isDismissedLocalStorageKey: scope.isDismissedLocalStorageKey
        });
      });
    }
  };
}

configureGroupModule.directive('groupBanner', groupBanner);

export default groupBanner;
