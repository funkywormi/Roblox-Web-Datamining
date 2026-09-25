import { RefObject, useEffect, useRef } from 'react';
import { elementVisibilityService } from 'core-roblox-utilities';
import { useAnnouncementTracking } from './useAnnouncementTracking';

const useAnnouncementViewExposure = <T extends HTMLElement = HTMLDivElement>(
  groupId: number,
  announcementId: string
): RefObject<T> => {
  const elementRef = useRef<T>(null);
  const hasLoggedExposure = useRef(false);
  const { trackAnnouncementViewed } = useAnnouncementTracking({ groupId });

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return undefined;

    return elementVisibilityService.observeVisibility({ element, threshold: 0.75 }, visible => {
      if (visible && !hasLoggedExposure.current) {
        hasLoggedExposure.current = true;
        trackAnnouncementViewed({ announcementId });
      }
    });
  }, [announcementId, trackAnnouncementViewed]);

  return elementRef;
};

export default useAnnouncementViewExposure;
