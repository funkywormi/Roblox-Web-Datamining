const announcementsRoute = '/announcements';

export default {
  announcementsRoute,
  announcementCreateRoute: `${announcementsRoute}/create`,
  announcementRoute: `${announcementsRoute}/:announcementId`,
  announcementEditRoute: `${announcementsRoute}/:announcementId/edit`,
  getAnnouncementRoute(announcementId: string): string {
    return `${announcementsRoute}/${announcementId}`;
  },
  getAnnouncementEditRoute(announcementId: string): string {
    return `${announcementsRoute}/${announcementId}/edit`;
  }
};
