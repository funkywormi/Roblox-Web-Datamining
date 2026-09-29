import { RefCallback, useCallback } from 'react';
import { useAnnouncementTracking } from './useAnnouncementTracking';
import useVisibilityExposure from './useVisibilityExposure';

const useAnnouncementSeeMoreExposure = (
  groupId: number,
  announcementId: string | undefined,
  enabled: boolean
): RefCallback<HTMLAnchorElement> => {
  const { trackAnnouncementSeeMoreButtonShown } = useAnnouncementTracking({
    groupId,
    locationTab: 'home'
  });
  const trackExposure = useCallback(() => {
    if (announcementId) {
      trackAnnouncementSeeMoreButtonShown({ announcementId });
    }
  }, [announcementId, trackAnnouncementSeeMoreButtonShown]);

  return useVisibilityExposure<HTMLAnchorElement>(
    enabled && Boolean(announcementId),
    announcementId ?? '',
    trackExposure
  );
};

export default useAnnouncementSeeMoreExposure;
