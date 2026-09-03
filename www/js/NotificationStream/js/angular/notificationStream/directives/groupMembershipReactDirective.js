import { NotificationStreamService } from 'Roblox';
import notificationStreamModule from '../notificationStreamModule';

// Bridge for the React groupMembership card, mirrors sendrNotificationDirective.
// Click + unread <li> state stay Angular-owned; this only mounts the content.
function groupMembershipReact() {
  'ngInject';

  return {
    restrict: 'A',
    link(scope, element) {
      element.ready(() => {
        NotificationStreamService?.renderGroupMembershipNotification(element[0]);
      });
    }
  };
}

notificationStreamModule.directive('groupMembershipReact', groupMembershipReact);

export default groupMembershipReact;
