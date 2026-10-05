import type { FunctionComponent } from 'react';
import React, { useCallback, useMemo, useState } from 'react';
import { V2GroupsGroupIdUsersGetLimitEnum } from '@rbx/client-groups/v2';
import {
  Button,
  Chip,
  Icon,
  IconButton,
  List,
  ListItem,
  ProgressCircle,
  SearchInput,
} from '@rbx/foundation-ui';
import { useTranslation } from '@rbx/intl';
import { ReturnPolicy, Thumbnail2d, ThumbnailTypes } from '@rbx/thumbnails';
import type { GroupUserWithRoles } from '../../clients/groups';
import useDebouncedFunction from '../../hooks/useDebouncedFunction';
import { useSearchGroupMembers } from '../../queries/groupMembersQueries';
import { useGetGroupMembersInfinite } from '../../queries/rolesQueries';

export type GroupMemberPickerListProps = {
  groupId: number;
  existingMemberIds: ReadonlySet<number>;
  selection: ReadonlyMap<number, GroupUserWithRoles>;
  remainingCapacity: number;
  onToggleMember: (member: GroupUserWithRoles) => void;
  showSearchLabel?: boolean;
  listClassName?: string;
};

const SUGGESTION_PAGE_SIZE = V2GroupsGroupIdUsersGetLimitEnum.NUMBER_100;
const MEMBER_SEARCH_DEBOUNCE_MS = 200;

// Allows the leading icon to be many chips and leave a cursor in the input.
const SEARCH_WITH_CHIPS_CLASS_NAME =
  '![height:auto] min-height-1000 wrap padding-y-xsmall [&>div:has(.member-picker-chips)]:fill [&>input]:![width:auto] [&>input]:grow';

const GroupMemberPickerList: FunctionComponent<GroupMemberPickerListProps> = ({
  groupId,
  existingMemberIds,
  selection,
  remainingCapacity,
  onToggleMember,
  showSearchLabel = true,
  listClassName,
}) => {
  const { translate } = useTranslation();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [updateDebouncedQuery, clearDebouncedQuery] = useDebouncedFunction(
    setDebouncedQuery,
    MEMBER_SEARCH_DEBOUNCE_MS,
  );
  const hasQuery = query.trim().length > 0;

  const setSearchQuery = useCallback(
    (value: string) => {
      setQuery(value);
      if (value.trim().length === 0) {
        clearDebouncedQuery();
        setDebouncedQuery('');
        return;
      }
      updateDebouncedQuery(value);
    },
    [clearDebouncedQuery, updateDebouncedQuery],
  );

  const { data: searchResults, isFetching: isSearching } = useSearchGroupMembers(
    groupId,
    debouncedQuery,
  );
  const {
    data: memberPages,
    isLoading: isLoadingDefault,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useGetGroupMembersInfinite(String(groupId), SUGGESTION_PAGE_SIZE, !hasQuery);

  const preloadedMembers = useMemo(() => {
    const seen = new Set<number>();
    const members: GroupUserWithRoles[] = [];
    for (const page of memberPages?.pages ?? []) {
      for (const member of page.data ?? []) {
        const userId = member.user?.userId;
        if (userId == null || seen.has(userId)) {
          continue;
        }
        seen.add(userId);
        members.push(member);
      }
    }
    return members;
  }, [memberPages]);

  const results = useMemo(() => {
    const members = hasQuery ? (searchResults?.data ?? []) : preloadedMembers;
    return members.filter((member) => {
      const userId = member.user?.userId;
      return userId != null && !existingMemberIds.has(userId) && !selection.has(userId);
    });
  }, [hasQuery, searchResults, preloadedMembers, existingMemberIds, selection]);
  const isWaitingToSearch = hasQuery && query !== debouncedQuery;
  const isLoading = hasQuery ? isWaitingToSearch || isSearching : isLoadingDefault;
  const isAtLimit = selection.size >= remainingCapacity;
  const selectedMembers = useMemo(() => Array.from(selection.values()), [selection]);

  const handleClear = useCallback(() => {
    if (hasQuery) {
      setSearchQuery('');
      return;
    }
    for (const member of selectedMembers) {
      onToggleMember(member);
    }
  }, [hasQuery, onToggleMember, selectedMembers, setSearchQuery]);

  return (
    <div className='gap-medium flex flex-col'>
      <SearchInput
        size='Medium'
        variant='Contrast'
        shape='Rounded'
        label={showSearchLabel ? translate('SearchBar.SearchGroupMembers') : undefined}
        aria-label={translate('SearchBar.SearchGroupMembers')}
        placeholder={selectedMembers.length === 0 ? translate('SearchBar.AddMembers') : ''}
        value={query}
        onChange={(event) => setSearchQuery(event.target.value)}
        error={isAtLimit ? translate('Error.EarlyTesterLimit') : undefined}
        inputContainerClassName={
          selectedMembers.length > 0 ? SEARCH_WITH_CHIPS_CLASS_NAME : undefined
        }
        leadingIconNode={
          selectedMembers.length > 0 ? (
            <span className='member-picker-chips gap-xsmall items-center flex flex-row wrap width-full'>
              <Icon name='icon-regular-magnifying-glass' size='Medium' />
              {selectedMembers.map((member) => {
                const userId = member.user?.userId;
                const name = member.user?.displayName ?? member.user?.username ?? '';
                if (userId == null) {
                  return null;
                }
                return (
                  <Chip
                    key={userId}
                    text={name}
                    size='Small'
                    variant='Standard'
                    isChecked={false}
                    trailingIconNode={<Icon name='icon-regular-x' size='XSmall' />}
                    aria-label={translate('Action.Remove')}
                    onCheckedChange={() => onToggleMember(member)}
                  />
                );
              })}
            </span>
          ) : undefined
        }
        trailingIconNode={
          selectedMembers.length > 0 || hasQuery ? (
            <IconButton
              icon='icon-regular-x'
              ariaLabel={translate('Action.Cancel')}
              size='Small'
              variant='Utility'
              onClick={handleClear}
            />
          ) : undefined
        }
      />
      <div
        className={`flex flex-col${isLoading ? ' min-height-[240px]' : ''}${
          listClassName ? ` ${listClassName}` : ''
        }`}>
        {isLoading && (
          <div className='flex justify-center padding-medium'>
            <ProgressCircle
              variant='Indeterminate'
              size='Medium'
              ariaLabel={translate('Label.Loading')}
            />
          </div>
        )}
        {!isLoading && results.length === 0 && (hasQuery || selectedMembers.length === 0) && (
          <span className='content-muted text-body-medium padding-small'>
            {translate('Label.NoMembersFound')}
          </span>
        )}
        {!isLoading && (
          <List className='flex flex-col'>
            {results.map((result) => {
              const userId = result.user?.userId;
              if (userId == null) {
                return null;
              }
              return (
                <ListItem
                  key={userId}
                  isContained
                  size='Small'
                  divider='None'
                  title={result.user?.displayName ?? result.user?.username}
                  metadata={result.user?.username ? `@${result.user.username}` : undefined}
                  leading={
                    <span className='flex shrink-0 radius-circle size-800 clip'>
                      <Thumbnail2d
                        targetId={userId}
                        type={ThumbnailTypes.avatarHeadshot}
                        alt={translate('Label.AvatarThumbnail')}
                        returnPolicy={ReturnPolicy.PlaceHolder}
                        includeBackground={false}
                      />
                    </span>
                  }
                  onSelect={
                    isAtLimit
                      ? undefined
                      : () => {
                          onToggleMember(result);
                          setSearchQuery('');
                        }
                  }
                  className={`radius-medium padding-x-small [&_.padding-y-large]:padding-y-medium${
                    isAtLimit ? ' opacity-[0.5] cursor-not-allowed' : ''
                  }`}
                />
              );
            })}
          </List>
        )}
        {!hasQuery && hasNextPage && (
          <Button
            variant='Standard'
            size='Medium'
            isLoading={isFetchingNextPage}
            onClick={() => {
              void fetchNextPage();
            }}>
            {translate('Button.LoadMore')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default GroupMemberPickerList;
