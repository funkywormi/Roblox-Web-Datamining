import { NotificationStreamService } from 'Roblox';
import notificationStreamModule from '../notificationStreamModule';

// Bridge for the React test card, mirrors sendrNotificationDirective. Self-contained
// (Detail is in the notification); React reads notification-data and renders. The card
// owns its clickable-to-clear behavior, so no Angular click wiring is needed.
function testReact() {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element) {
      element.ready(() => {
        NotificationStreamService?.renderTestNotification(element[0]);
      });
    }
  };
}

notificationStreamModule.directive('testReact', testReact);

export default testReact;
