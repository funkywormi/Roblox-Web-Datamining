import { useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import CommunityEventStream, {
  CommunityMetric,
  getImpressionId
} from '../../shared/utils/eventStream';

export type AnnouncementLocationTab = 'home' | 'posts' | 'announcements';

export type AnnouncementCreateButton = 'post' | 'save' | 'cancel';
export type AnnouncementOverflowButton = 'edit' | 'delete' | 'report';

export type UseAnnouncementTrackingOptions = {
  groupId: number;
  locationTab?: AnnouncementLocationTab;
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
  trackAnnouncementClicked: (input: { announcementId: string }) => void;
  trackAnnouncementArchiveAnnouncementViewed: (input: { announcementId: string }) => void;
  trackAnnouncementSeeMoreButtonShown: (input: { announcementId: string }) => void;
  trackAnnouncementSeeMoreButtonClick: (input: { announcementId: string }) => void;
};

export const useAnnouncementTracking = ({
  groupId,
  locationTab = 'announcements'
}: UseAnnouncementTrackingOptions): UseAnnouncementTrackingResult => {
  const { pathname } = useLocation();

  const common = useMemo(
    () => ({
      pageRoute: pathname,
      locationTab,
      groupId,
      sessionId: getImpressionId()
    }),
    [pathname, locationTab, groupId]
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

  const trackAnnouncementClicked = useCallback<
    UseAnnouncementTrackingResult['trackAnnouncementClicked']
  >(
    ({ announcementId }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementClicked({
          ...common,
          announcementId
        })
      );
    },
    [common]
  );

  const trackAnnouncementArchiveAnnouncementViewed = useCallback<
    UseAnnouncementTrackingResult['trackAnnouncementArchiveAnnouncementViewed']
  >(
    ({ announcementId }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementArchiveAnnouncementViewed({
          ...common,
          announcementId
        })
      );
    },
    [common]
  );

  const trackAnnouncementSeeMoreButtonShown = useCallback<
    UseAnnouncementTrackingResult['trackAnnouncementSeeMoreButtonShown']
  >(
    ({ announcementId }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementSeeMoreButtonShown({
          ...common,
          announcementId
        })
      );
    },
    [common]
  );

  const trackAnnouncementSeeMoreButtonClick = useCallback<
    UseAnnouncementTrackingResult['trackAnnouncementSeeMoreButtonClick']
  >(
    ({ announcementId }) => {
      CommunityEventStream.sendEvent(
        CommunityMetric.AnnouncementSeeMoreButtonClick({
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
    trackAnnouncementViewed,
    trackAnnouncementClicked,
    trackAnnouncementArchiveAnnouncementViewed,
    trackAnnouncementSeeMoreButtonShown,
    trackAnnouncementSeeMoreButtonClick
  };
};

export default useAnnouncementTracking;
