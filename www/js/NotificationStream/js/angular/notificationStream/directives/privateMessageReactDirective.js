import { NotificationStreamService } from 'Roblox';
import notificationStreamModule from '../notificationStreamModule';

// Bridge for the React privateMessage card, mirrors sendrNotificationDirective.
// Click + unread <li> state stay Angular-owned; this only mounts the content.
function privateMessageReact() {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element) {
      element.ready(() => {
        NotificationStreamService?.renderPrivateMessageNotification(element[0]);
      });
    }
  };
}

notificationStreamModule.directive('privateMessageReact', privateMessageReact);

export default privateMessageReact;
