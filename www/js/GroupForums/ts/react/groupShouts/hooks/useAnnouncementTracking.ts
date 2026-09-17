import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CommunityEventStream, {
  CommunityMetric,
  getImpressionId
} from '../../shared/utils/eventStream';

const LOCATION_TAB = 'announcements';

export type AnnouncementCreateButton = 'post' | 'save' | 'cancel';
export type AnnouncementOverflowButton = 'edit' | 'delete' | 'report';

export type UseAnnouncementTrackingOptions = {
  groupId: number;
};

export type UseAnnouncementTrackingResult = {
  trackCreatePageShown: (input: { draftId?: string }) => void;
  trackCreatePageButtonClick: (input: {
    buttonClicked: AnnouncementCreateButton;
    isImageAttached: boolean;
  }) => void;
  trackCreatePageBannerShown: (input: { bannerMessageShown: string }) => void;
  trackDeleteBannerShown: (input: { bannerMessageShown: string }) => void;
  trackOverflowMenuButtonClick: (input: {
    announcementId: string;
    buttonClicked: AnnouncementOverflowButton;
  }) => void;
  trackReactionToggled: (input: {
    announcementId: string;
    emoteId: string;
    isReactionAdded: boolean;
  }) => void;
  trackAnnouncementViewed: (input: { announcementId: string }) => void;
};

export const useAnnouncementTracking = ({
  groupId
}: UseAnnouncementTrackingOptions): UseAnnouncementTrackingResult => {
  const { pathname } = useLocation();

  const common = useMemo(
    () => ({
      pageRoute: pathname,
      locationTab: LOCATION_TAB,
      groupId,
      sessionId: getImpressionId()
    }),
    [pathname, groupId]
  );

  const trackCreatePageShown = useCallback<UseAnnouncementTrackingResult['trackCreatePageShown']>(
    ({ draftId }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementCreatePageShown({
          ...common,
          draftId: draftId ?? ''
        })
      );
    },
    [common]
  );

  const trackCreatePageButtonClick = useCallback<
    UseAnnouncementTrackingResult['trackCreatePageButtonClick']
  >(
    ({ buttonClicked, isImageAttached }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementCreatePageButtonClick({
          ...common,
          buttonClicked,
          isImageAttached: isImageAttached ? 1 : 0,
          isFormAttached: 0
        })
      );
    },
    [common]
  );

  const trackCreatePageBannerShown = useCallback<
    UseAnnouncementTrackingResult['trackCreatePageBannerShown']
  >(
    ({ bannerMessageShown }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementCreatePageBannerMessageShown({
          ...common,
          bannerMessageShown
        })
      );
    },
    [common]
  );

  const trackDeleteBannerShown = useCallback<
    UseAnnouncementTrackingResult['trackDeleteBannerShown']
  >(
    ({ bannerMessageShown }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementDeleteBannerMessageShown({
          ...common,
          bannerMessageShown
        })
      );
    },
    [common]
  );

  const trackOverflowMenuButtonClick = useCallback<
    UseAnnouncementTrackingResult['trackOverflowMenuButtonClick']
  >(
    ({ announcementId, buttonClicked }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementOverflowMenuButtonClick({
          ...common,
          announcementId,
          buttonClicked
        })
      );
    },
    [common]
  );

  const trackReactionToggled = useCallback<UseAnnouncementTrackingResult['trackReactionToggled']>(
    ({ announcementId, emoteId, isReactionAdded }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementReactionToggled({
          ...common,
          announcementId,
          reactionEmoteId: emoteId,
          isReactionAdded: isReactionAdded ? 1 : 0
        })
      );
    },
    [common]
  );

  const trackAnnouncementViewed = useCallback<
    UseAnnouncementTrackingResult['trackAnnouncementViewed']
  >(
    ({ announcementId }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementViewed({
          ...common,
          announcementId
        })
      );
    },
    [common]
  );

  return {
    trackCreatePageShown,
    trackCreatePageButtonClick,
    trackCreatePageBannerShown,
    trackDeleteBannerShown,
    trackOverflowMenuButtonClick,
    trackReactionToggled,
    trackAnnouncementViewed
  };
};

export default useAnnouncementTracking;
