import { useInfiniteQuery, UseInfiniteQueryResult } from '@tanstack/react-query';
import announcementsService from '../services/announcementsService';
import { AnnouncementModel, AnnouncementsPageResponse } from '../types';
import queryKeys from '../utils/queryKeys';

export const ANNOUNCEMENTS_PER_PAGE = 10;

const useAnnouncementArchiveQuery = (
  groupId: number
): UseInfiniteQueryResult<AnnouncementsPageResponse<AnnouncementModel>, Error> =>
  useInfiniteQuery<AnnouncementsPageResponse<AnnouncementModel>, Error>({
    queryKey: queryKeys.getAnnouncementArchiveKey(groupId),
    queryFn: ({ pageParam }) => {
      const cursor = pageParam as string | undefined;
      return announcementsService.getAnnouncements(groupId, {
        cursor,
        limit: ANNOUNCEMENTS_PER_PAGE
      });
    },
    getNextPageParam: (page: AnnouncementsPageResponse<AnnouncementModel>) =>
      page.nextPageCursor || undefined,
    refetchOnMount: true,
    staleTime: 5000
  });

export default useAnnouncementArchiveQuery;
