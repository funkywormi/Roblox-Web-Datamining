import React, { useCallback, useMemo, useState } from 'react';
import { CurrentUser } from 'Roblox';
import { Button, Dropdown, Menu, MenuItem, MenuSection } from '@rbx/foundation-ui';
import { useSystemFeedback } from 'react-style-guide';
import { useTranslation } from 'react-utilities';
import { InfiniteData, useMutation, useQueryClient } from '@tanstack/react-query';
import { Group, GroupJoinRequest, User } from '../../shared/types';
import { JOIN_REQUESTS_CHANGED_EVENT } from '../../shared/constants/joinRequestsConstants';
import { GetJoinRequestsResponse, SortOrder } from '../types';
import groupMembersService from '../services/groupMembersService';
import useJoinRequestsQuery, {
  useJoinRequestsQueryUpdates,
  getJoinRequestsQueryKey
} from '../hooks/useJoinRequestsQuery';
import SearchableMembersList from '../components/SearchableMembersList';

type RequestsTabProps = {
  group: Group;
};

const FIVE_MINUTE_STALE_TIME_MS = 5 * 60 * 1000;

const dispatchJoinRequestsChanged = (groupId: number) => {
  window.dispatchEvent(new CustomEvent(JOIN_REQUESTS_CHANGED_EVENT, { detail: { groupId } }));
};

const RequestsTab: React.FC<RequestsTabProps> = ({ group }) => {
  const { id: groupId } = group;
  const { translate } = useTranslation();
  const { systemFeedbackService } = useSystemFeedback();
  const queryClient = useQueryClient();

  const { removeJoinRequest } = useJoinRequestsQueryUpdates({ groupId });

  const [sortOrder, setSortOrder] = useState<SortOrder>('Desc');
  const [isSearchActive, setIsSearchActive] = useState(false);
  const additionalQueryParams = useMemo(() => ({ sortOrder }), [sortOrder]);

  const getFirstPageUserIds = (): Array<number> => {
    const data = queryClient.getQueryData<InfiniteData<GetJoinRequestsResponse>>(
      getJoinRequestsQueryKey(groupId, { sortOrder })
    );
    return data?.pages?.[0]?.data.map(r => r.requester.userId) ?? [];
  };

  const acceptBatchMutation = useMutation({
    mutationFn: (userIds: Array<number>) =>
      groupMembersService.acceptBatchJoinRequests({ groupId, userIds }),
    onSuccess: () => {
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries({ queryKey: getJoinRequestsQueryKey(groupId) });
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      dispatchJoinRequestsChanged(groupId);
      systemFeedbackService.success(translate('Message.AcceptAllSuccess'));
    },
    onError: () => systemFeedbackService.warning(translate('NetworkError'))
  });

  const declineBatchMutation = useMutation({
    mutationFn: (userIds: Array<number>) =>
      groupMembersService.declineBatchJoinRequests({ groupId, userIds }),
    onSuccess: () => {
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries({ queryKey: getJoinRequestsQueryKey(groupId) });
      dispatchJoinRequestsChanged(groupId);
      systemFeedbackService.success(translate('Message.DeclineAllSuccess'));
    },
    onError: () => systemFeedbackService.warning(translate('NetworkError'))
  });

  const acceptSingleMutation = useMutation({
    mutationFn: ({ userId }: User) => groupMembersService.acceptJoinRequest({ groupId, userId }),
    onSuccess: (_data, { userId, displayName }) => {
      removeJoinRequest(userId);
      // eslint-disable-next-line no-void
      void queryClient.invalidateQueries({ queryKey: ['group-members', groupId] });
      dispatchJoinRequestsChanged(groupId);
      systemFeedbackService.success(
        translate('Message.AcceptJoinRequest', {
          actor: CurrentUser.displayName,
          user: displayName
        })
      );
    },
    onError: () => systemFeedbackService.warning(translate('NetworkError'))
  });

  const declineSingleMutation = useMutation({
    mutationFn: ({ userId }: User) => groupMembersService.declineJoinRequest({ groupId, userId }),
    onSuccess: (_data, { userId, displayName }) => {
      removeJoinRequest(userId);
      dispatchJoinRequestsChanged(groupId);
      systemFeedbackService.success(
        translate('Message.DeclineJoinRequest', {
          actor: CurrentUser.displayName,
          user: displayName
        })
      );
    },
    onError: () => systemFeedbackService.warning(translate('NetworkError'))
  });

  const isBulkActing = acceptBatchMutation.isLoading || declineBatchMutation.isLoading;
  const isBulkDisabled = isBulkActing || isSearchActive;
  const isSingleActing = acceptSingleMutation.isLoading || declineSingleMutation.isLoading;

  const onAcceptAllClicked = () => {
    if (isBulkActing) return;
    const userIds = getFirstPageUserIds();
    if (userIds.length > 0) {
      acceptBatchMutation.mutate(userIds);
    }
  };

  const onDeclineAllClicked = () => {
    if (isBulkActing) return;
    const userIds = getFirstPageUserIds();
    if (userIds.length > 0) {
      declineBatchMutation.mutate(userIds);
    }
  };

  const renderMemberInfoContent = useCallback(
    (joinRequest: GroupJoinRequest, _index: number) => {
      const { requester } = joinRequest;
      const isDisabled = isSingleActing || isBulkActing;
      return (
        <div className='flex gap-small justify-end items-center grow-1'>
          <Button
            className='padding-x-xxlarge member-info-display-request-button'
            onClick={() => acceptSingleMutation.mutate(requester)}
            size='Small'
            variant='Emphasis'
            isDisabled={isDisabled}>
            {translate('Action.Accept')}
          </Button>
          <Button
            className='padding-x-xxlarge member-info-display-request-button'
            onClick={() => declineSingleMutation.mutate(requester)}
            size='Small'
            variant='Standard'
            isDisabled={isDisabled}>
            {translate('Action.Decline')}
          </Button>
        </div>
      );
    },
    [isSingleActing, isBulkActing, acceptSingleMutation, declineSingleMutation, translate]
  );

  const onSortOrderChanged = useCallback((value: string) => {
    setSortOrder(value as SortOrder);
  }, []);

  const sortDropdown = (
    <Dropdown
      className='grow-1'
      size='Medium'
      placeholder=''
      value={sortOrder}
      onValueChange={onSortOrderChanged}>
      <Menu>
        <MenuSection>
          <MenuItem value='Desc' title={translate('Label.NewestToOldest')} />
          <MenuItem value='Asc' title={translate('Label.OldestToNewest')} />
        </MenuSection>
      </Menu>
    </Dropdown>
  );

  return (
    <div className='width-full'>
      <div className='flex justify-end gap-small margin-bottom-small group-mobile-spacing'>
        <Button
          className='padding-x-xxlarge'
          onClick={onAcceptAllClicked}
          size='Small'
          variant='Emphasis'
          isDisabled={isBulkDisabled}>
          {translate('Action.AcceptAll')}
        </Button>
        <Button
          className='padding-x-xxlarge'
          onClick={onDeclineAllClicked}
          size='Small'
          variant='Standard'
          isDisabled={isBulkDisabled}>
          {translate('Action.DeclineAll')}
        </Button>
      </div>
      <SearchableMembersList
        className='width-full'
        groupId={groupId}
        useQuery={useJoinRequestsQuery}
        renderContent={renderMemberInfoContent}
        customControls={sortDropdown}
        onSearchActiveChange={setIsSearchActive}
        searchPlaceholder={translate('Label.SearchUsers')}
        emptyMessage={translate('Message.NoPendingRequests')}
        additionalQueryParams={additionalQueryParams}
        staleTime={FIVE_MINUTE_STALE_TIME_MS}
      />
    </div>
  );
};

export default RequestsTab;
