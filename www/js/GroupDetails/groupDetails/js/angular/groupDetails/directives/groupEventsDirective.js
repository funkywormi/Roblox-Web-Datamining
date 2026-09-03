import { GroupEventsService } from 'Roblox';
import groupModule from '../groupModule';

function groupEvents() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      onlyShowFeaturedEvent: '<',
      group: '<',
      canSetFeaturedEvent: '<'
    },
    link(scope, element) {
      const renderEvents = () => {
        GroupEventsService?.renderGroupEventsSection(element[0], {
          onlyShowFeaturedEvent: scope.onlyShowFeaturedEvent,
          group: scope.group,
          canSetFeaturedEvent: scope.canSetFeaturedEvent
        });
      };

      element.ready(renderEvents);

      ['group'].forEach(prop => {
        scope.$watch(
          prop,
          (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              renderEvents();
            }
          },
          true
        );
      });
    }
  };
}

groupModule.directive('groupEvents', groupEvents);

export default groupEvents;
