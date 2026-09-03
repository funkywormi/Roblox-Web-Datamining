import { GroupAnnouncementsService } from 'Roblox';
import groupModule from '../groupModule';

function groupAnnouncements() {
  'ngInject';

  return {
    restrict: 'A',
    scope: {
      group: '<',
      communityInfo: '<',
      isOwner: '<',
      joinGroup: '<',
      allowedToJoinGroup: '<',
      policies: '<',
      metadata: '<',
      canCreateAnnouncements: '<',
      onAnnouncementLoaded: '<',
      announcementsData: '<',
      refreshAnnouncements: '<'
    },
    link(scope, element, attrs) {
      let deepLinkConfig = null;
      let initialDataSettled = false;

      const renderAnnouncements = () => {
        const hash = window.location.hash;
        const hashQueryStart = hash.indexOf('?');
        const params = new URLSearchParams(hashQueryStart >= 0 ? hash.slice(hashQueryStart) : '');
        const shouldCompose =
          params.get('compose') === 'announcement' && scope.canCreateAnnouncements;

        if (shouldCompose && !deepLinkConfig) {
          deepLinkConfig = { pathname: '/create-announcement' };
          params.delete('compose');
          const remainingParams = params.toString();
          const cleanHash = hash.slice(0, hashQueryStart >= 0 ? hashQueryStart : hash.length)
            + (remainingParams ? '?' + remainingParams : '');
          window.history.replaceState(null, '', window.location.pathname + window.location.search + cleanHash);
        }

        // Clear deep-link after initial async data has settled so that later
        // watcher-triggered remounts don't snap the user back to the composer.
        if (initialDataSettled && deepLinkConfig) {
          deepLinkConfig = null;
        }
        if (!initialDataSettled && scope.announcementsData !== undefined) {
          initialDataSettled = true;
        }

        GroupAnnouncementsService?.renderGroupAnnouncementsSection(element[0], {
          group: scope.group,
          isOwner: scope.isOwner,
          joinGroup: scope.joinGroup,
          allowedToJoinGroup: scope.allowedToJoinGroup,
          policies: scope.policies,
          metadata: scope.metadata,
          canCreateAnnouncements: scope.canCreateAnnouncements,
          onAnnouncementLoaded: () => {
            return scope.onAnnouncementLoaded();
          },
          announcementsData: scope.announcementsData,
          refreshAnnouncements: () => scope.refreshAnnouncements?.(),
          ...(deepLinkConfig && {
            initialRouteConfig: deepLinkConfig,
            scrollOnMount: true
          })
        });
      };

      element.ready(renderAnnouncements);

      [
        'communityInfo',
        'isOwner',
        'announcement',
        'canCreateAnnouncements',
        'announcementsData'
      ].forEach(prop => {
        scope.$watch(
          prop,
          (newVal, oldVal) => {
            if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
              renderAnnouncements();
            }
          },
          true
        );
      });
    }
  };
}

groupModule.directive('groupAnnouncements', groupAnnouncements);

export default groupAnnouncements;
