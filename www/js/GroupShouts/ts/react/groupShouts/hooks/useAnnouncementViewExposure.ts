import { RefCallback, useCallback } from 'react';
import { AnnouncementLocationTab, useAnnouncementTracking } from './useAnnouncementTracking';
import useVisibilityExposure from './useVisibilityExposure';

export type AnnouncementViewEvent = 'announcement' | 'archiveAnnouncement';

const useAnnouncementViewExposure = <T extends HTMLElement = HTMLDivElement>(
  groupId: number,
  announcementId: string,
  locationTab: AnnouncementLocationTab = 'home',
  viewEvent: AnnouncementViewEvent = 'announcement'
): RefCallback<T> => {
  const {
    trackAnnouncementViewed,
    trackAnnouncementArchiveAnnouncementViewed
  } = useAnnouncementTracking({ groupId, locationTab });
  const trackExposure = useCallback(
    () =>
      viewEvent === 'archiveAnnouncement'
        ? trackAnnouncementArchiveAnnouncementViewed({ announcementId })
        : trackAnnouncementViewed({ announcementId }),
    [announcementId, trackAnnouncementArchiveAnnouncementViewed, trackAnnouncementViewed, viewEvent]
  );

  return useVisibilityExposure<T>(true, announcementId, trackExposure);
};

export default useAnnouncementViewExposure;
