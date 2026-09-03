import React, { useCallback, useEffect, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteLoader from './InfiniteLoader';
import { User, PaginatedResponse, FilterOption } from './types';
import UserItem from './UserItem';
import SectionDisclaimer from './SectionDisclaimer';
import { fetchBatchProfilePlatform } from '../../../networking';
import { Action, Component, ProfileType } from '../../../types';

// Get utilities from window objects
const { useTranslation } = (window as any).ReactUtilities;
const { Loading, useSystemFeedback } = (window as any).ReactStyleGuide;

interface UserListProps<TUser extends User, TFilter extends FilterOption> {
  selectedFilter: TFilter | null;
  open: boolean;
  onCloseModal?: () => void;
  queryFunction: (filter: TFilter | null, cursor?: string) => Promise<PaginatedResponse<TUser>>;
  queryKey: (filter: TFilter | null) => unknown[];
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
  onCtaAction?: (action: Action, userId: number) => void;
  userDisplayNameTrailingLabel?: (user: TUser) => string | null | undefined;
}

const UserList = <TUser extends User, TFilter extends FilterOption>({
  selectedFilter,
  open,
  onCloseModal,
  queryFunction,
  queryKey,
  scrollContainerRef,
  onCtaAction,
  userDisplayNameTrailingLabel
}: UserListProps<TUser, TFilter>): React.ReactElement => {
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();

  // Key for react-query to refetch when filter changes
  const currentQueryKey = queryKey(selectedFilter);

  // Infinite load users with actions
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } = useInfiniteQuery<
    PaginatedResponse<TUser>
  >({
    queryKey: currentQueryKey,
    queryFn: async ({ pageParam: cursor }) => {
      // Fetch users
      const usersResponse = await queryFunction(selectedFilter, cursor);

      // Fetch actions for these users
      const userIds = usersResponse.data.map(user => user.userId.toString());

      if (userIds.length === 0) {
        return usersResponse;
      }

      try {
        const actionsResponse = await fetchBatchProfilePlatform({
          profileType: ProfileType.User,
          profileIds: userIds,
          components: [
            {
              component: Component.Actions,
              excludeContextualActions: true
            }
          ]
        });

        // Merge actions into users, returning a new response object
        const usersWithActions = usersResponse.data.map(user => {
          const profileData = actionsResponse.profiles[user.userId.toString()];
          return { ...user, actions: profileData?.components.Actions?.buttons ?? [] };
        });

        return { ...usersResponse, data: usersWithActions };
      } catch {
        // If actions fetch fails, return users with empty actions
        const usersWithEmptyActions = usersResponse.data.map(user => ({ ...user, actions: [] }));
        return { ...usersResponse, data: usersWithEmptyActions };
      }
    },
    getNextPageParam: lastPage => lastPage.nextPageCursor || undefined,
    enabled: open && (selectedFilter !== null || !selectedFilter)
  });

  useEffect(() => {
    if (isError) {
      systemFeedbackService.warning(translate('Error.UnknownError'));
    }
  }, [isError, systemFeedbackService, translate]);

  const users = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.reduce<TUser[]>((acc, page) => acc.concat(page.data), []);
  }, [data]);

  const handleRetry = useCallback(async () => {
    if (users.length > 0 && hasNextPage) {
      await fetchNextPage();
    } else {
      await refetch();
    }
  }, [users.length, hasNextPage, fetchNextPage, refetch]);

  if (!open) return <></>;

  return (
    <>
      {isLoading && users.length === 0 && <Loading />}
      {!isLoading && users.length === 0 && !isError && (
        <div className="text-center">
          <div className="text-gray margin-top-medium">{translate('Label.NoMembersInRole')}</div>
        </div>
      )}
      {(isLoading || users.length > 0 || isError) && (
        <>
          <ul className="vlist flex flex-col gap-medium">
            {users.map(user => (
              <UserItem<TUser>
                key={user.userId}
                user={user}
                onCloseModal={onCloseModal}
                onCtaAction={onCtaAction}
                userDisplayNameTrailingLabel={userDisplayNameTrailingLabel}
              />
            ))}
          </ul>
          {isError && (
            <SectionDisclaimer
              className="bg-none gap-small"
              iconClassName="icon-status-alert"
              message={translate('Error.ContentReloadingSubtitle')}
              buttonText={translate('Action.TryAgain')}
              onClick={handleRetry}
            />
          )}
          {!isError && (
            <InfiniteLoader onLoadMore={fetchNextPage} viewingThreshold={0.6} scrollContainerRef={scrollContainerRef} />
          )}
          {isFetchingNextPage && <div className="spinner spinner-default spinner-infinite-scroll" />}
        </>
      )}
    </>
  );
};

export default UserList;
