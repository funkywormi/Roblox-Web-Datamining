import { EnvironmentUrls } from 'Roblox';

const announcementsRoute = '/announcements';

export default {
  announcementsRoute,
  announcementCreateRoute: `${announcementsRoute}/create`,
  announcementRoute: `${announcementsRoute}/:announcementId`,
  announcementEditRoute: `${announcementsRoute}/:announcementId/edit`,
  getAnnouncementRoute(announcementId: string): string {
    return `${announcementsRoute}/${announcementId}`;
  },
  getAnnouncementUrl(groupId: number, announcementId: string): string {
    return `${EnvironmentUrls.websiteUrl}/communities/${groupId}#!${announcementsRoute}/${announcementId}`;
  },
  getAnnouncementEditRoute(announcementId: string): string {
    return `${announcementsRoute}/${announcementId}/edit`;
  }
};
