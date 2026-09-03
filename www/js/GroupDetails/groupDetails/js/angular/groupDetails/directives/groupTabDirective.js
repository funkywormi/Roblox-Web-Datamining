import groupModule from '../groupModule';
import { sendTabClickEvent } from '../../../../ts/react/shared/userActivity/groupPageEventStream';

function groupTab(groupResources) {
  'ngInject';

  return {
    restrict: 'A',
    replace: true,
    scope: {
      activeTab: '<',
      tab: '<',
      numTabs: '<'
    },
    templateUrl: groupResources.templates.groupTabTemplate,
    link(scope) {
      // Logged on a real user click (not $stateChangeSuccess) so programmatic
      // redirects between tabs don't emit false events.
      scope.onTabClick = function onTabClick() {
        sendTabClickEvent(scope.tab && scope.tab.state);
      };
    }
  };
}

groupModule.directive('groupTab', groupTab);

export default groupTab;
