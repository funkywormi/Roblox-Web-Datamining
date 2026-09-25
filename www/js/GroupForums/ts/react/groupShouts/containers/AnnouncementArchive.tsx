import React, { ReactNode, useCallback } from 'react';
import { InfiniteData, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import { useHistory } from 'react-router-dom';
import { Loading, useSystemFeedback } from 'react-style-guide';
import { Button } from '@rbx/foundation-ui';
import { useTranslation } from 'react-utilities';
import announcementsService from '../services/announcementsService';
import { AnnouncementModel, AnnouncementsPageResponse } from '../types';
import InfiniteLoader from '../../shared/components/InfiniteLoader';
import announcementRoutes from '../constants/announcementRoutes';
import AnnouncementArchiveCard from '../components/AnnouncementArchiveCard';
import PostPreviewSkeleton from '../../groupPosts/components/PostPreviewSkeleton';
import SectionDisclaimer from '../../shared/components/SectionDisclaimer';
import { logGroupForumsClickEvent } from '../../shared/utils/logging';
import { useAnnouncementTracking } from '../hooks/useAnnouncementTracking';
import NativeFooter from '../../shared/components/NativeFooter';
import updateReaction from '../../shared/utils/reactionUtils';

const ANNOUNCEMENTS_PER_PAGE = 10;

type AnnouncementArchiveProps = {
  groupId: number;
  canCreateAnnouncements: boolean;
  navigation: ReactNode;
};

const AnnouncementArchive = ({
  groupId,
  canCreateAnnouncements,
  navigation
}: AnnouncementArchiveProps): JSX.Element => {
  const history = useHistory();
  const queryClient = useQueryClient();
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();
  const { trackReactionToggled } = useAnnouncementTracking({ groupId });
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch
  } = useInfiniteQuery<AnnouncementsPageResponse<AnnouncementModel>, Error>({
    queryKey: ['announcement-archive', groupId],
    queryFn: ({ pageParam }) => {
      const cursor = pageParam as string | undefined;
      return announcementsService.getAnnouncements(groupId, {
        cursor,
        limit: ANNOUNCEMENTS_PER_PAGE
      });
    },
    getNextPageParam: (page: AnnouncementsPageResponse<AnnouncementModel>) =>
      page.nextPageCursor || undefined
  });

  const announcements = (data?.pages ?? []).reduce<AnnouncementModel[]>(
    (items, page) => items.concat(page.data),
    []
  );
  const hasPaginationError = Boolean(error && data && hasNextPage);
  const createAnnouncement = useCallback(() => {
    history.push(announcementRoutes.announcementCreateRoute);
  }, [history]);
  const trackAnnouncementOpen = useCallback(
    (announcementId: string) => {
      logGroupForumsClickEvent({
        groupId,
        clickTargetType: 'openAnnouncement',
        clickTargetId: announcementId
      });
    },
    [groupId]
  );
  const openAnnouncement = useCallback(
    (announcementId: string) => {
      trackAnnouncementOpen(announcementId);
      history.push(announcementRoutes.getAnnouncementRoute(announcementId));
    },
    [history, trackAnnouncementOpen]
  );
  const editAnnouncement = useCallback(
    (announcement: AnnouncementModel) => {
      history.push(announcementRoutes.getAnnouncementEditRoute(announcement.id), {
        announcement
      });
    },
    [history]
  );
  const deleteAnnouncement = useCallback(
    async (announcement: AnnouncementModel) => {
      try {
        await announcementsService.deleteAnnouncement(groupId, announcement.id);
        systemFeedbackService.success(translate('Message.AnnouncementDeleteSuccess'));
        await refetch();
      } catch {
        systemFeedbackService.warning(translate('Message.AnnouncementDeleteFail'));
      }
    },
    [groupId, refetch, systemFeedbackService, translate]
  );
  const toggleReaction = useCallback(
    async (
      announcement: AnnouncementModel,
      emoteId: string,
      togglingOn: boolean
    ): Promise<boolean> => {
      try {
        if (togglingOn) {
          await announcementsService.addReaction(
            groupId,
            announcement.id,
            announcement.messageId,
            emoteId
          );
        } else {
          await announcementsService.removeReaction(
            groupId,
            announcement.id,
            announcement.messageId,
            emoteId
          );
        }
        logGroupForumsClickEvent({
          groupId,
          clickTargetType: togglingOn ? 'shoutReactionAdded' : 'shoutReactionRemoved',
          clickTargetId: announcement.id
        });
        trackReactionToggled({
          announcementId: announcement.id,
          emoteId,
          isReactionAdded: togglingOn
        });
        queryClient.setQueryData<InfiniteData<AnnouncementsPageResponse<AnnouncementModel>>>(
          ['announcement-archive', groupId],
          archiveData => {
            if (!archiveData) {
              return archiveData;
            }

            return {
              ...archiveData,
              pages: archiveData.pages.map(page => ({
                ...page,
                data: page.data.map(item => {
                  if (item.id !== announcement.id) {
                    return item;
                  }

                  return {
                    ...item,
                    reactions: updateReaction(item.reactions, emoteId, togglingOn)
                  };
                })
              }))
            };
          }
        );
        return true;
      } catch {
        return false;
      }
    },
    [groupId, queryClient, trackReactionToggled]
  );
  const loadNextPage = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      // eslint-disable-next-line no-void
      void fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  if (error && !data) {
    return (
      <SectionDisclaimer
        iconClassName='icon-status-alert'
        heading={translate('NetworkError')}
        message={translate('Error.ReloadingSubtitle')}
        buttonText={translate('Action.Retry')}
        onClick={() => refetch()}
      />
    );
  }

  return (
    <div className='group-announcement-archive'>
      <div className='group-posts-destinations-container'>{navigation}</div>
      <div className='group-posts-section-header'>
        <div className='group-posts-section-header-title'>
          <h2 className='group-posts-section-heading'>{translate('Heading.Announcements')}</h2>
        </div>
        {canCreateAnnouncements && (
          <Button
            type='button'
            variant='Emphasis'
            size='Medium'
            className='group-posts-create-button'
            onClick={createAnnouncement}>
            {translate('Action.CreatePost')}
          </Button>
        )}
      </div>
      {!isLoading && announcements.length === 0 && (
        <SectionDisclaimer
          iconClassName='chat-side-icon'
          message={translate('Label.NoAnnouncements')}
        />
      )}
      {isLoading ? (
        <div className='group-posts-list group-posts-list-skeleton'>
          <PostPreviewSkeleton />
          <PostPreviewSkeleton />
          <PostPreviewSkeleton />
        </div>
      ) : (
        <div className='group-announcement-archive-list group-posts-list'>
          {announcements.map(announcement => (
            <AnnouncementArchiveCard
              key={announcement.id}
              announcement={announcement}
              groupId={groupId}
              canCreateAnnouncements={canCreateAnnouncements}
              onDelete={deleteAnnouncement}
              onEdit={editAnnouncement}
              onModifiedOpen={trackAnnouncementOpen}
              onOpen={openAnnouncement}
              onToggleReaction={toggleReaction}
            />
          ))}
        </div>
      )}
      {canCreateAnnouncements && (
        <NativeFooter fixed>
          <div className='groups-native-footer-container'>
            <Button
              type='button'
              variant='Emphasis'
              size='Medium'
              className='group-posts-create-button'
              onClick={createAnnouncement}>
              {translate('Action.CreatePost')}
            </Button>
          </div>
        </NativeFooter>
      )}
      {isFetchingNextPage && <Loading />}
      {hasPaginationError && (
        <div className='group-announcement-archive-pagination-error'>
          <Button type='button' variant='Standard' size='Small' onClick={loadNextPage}>
            {translate('Action.Retry')}
          </Button>
        </div>
      )}
      {hasNextPage && !hasPaginationError && (
        <InfiniteLoader onLoadMore={loadNextPage} viewingThreshold={0.5} />
      )}
    </div>
  );
};

export default AnnouncementArchive;
