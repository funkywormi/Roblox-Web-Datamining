import groupModule from '../groupModule';

const groupAnnouncements = {
  templateUrl: 'group-announcements',
  bindings: {
    group: '<',
    communityInfo: '<',
    isOwner: '<',
    announcement: '<',
    joinGroup: '<',
    allowedToJoinGroup: '<',
    policies: '<',
    metadata: '<',
    canCreateAnnouncements: '<',
    canViewAnnouncements: '<',
    onAnnouncementLoaded: '<',
    announcementsData: '<',
    refreshAnnouncements: '<'
  },
  controller: 'groupAnnouncementsController'
};

groupModule.component('groupAnnouncements', groupAnnouncements);
export default groupAnnouncements;
