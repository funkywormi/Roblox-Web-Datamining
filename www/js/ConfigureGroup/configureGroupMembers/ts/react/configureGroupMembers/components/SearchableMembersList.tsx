import React, { useCallback, useState } from 'react';
import { Divider } from '@rbx/foundation-ui';
import {
  GetNextPageParamFunction,
  InfiniteData,
  QueryFunction,
  QueryKey
} from '@tanstack/react-query';
import { useTranslation } from 'react-utilities';
import { Loading } from 'react-style-guide';
import InfiniteQueryList from '../../shared/components/InfiniteQueryList';
import MemberInfoDisplay, { OverflowAction } from './MemberInfoDisplay';
import { AssignedRole, User } from '../../shared/types';
import SearchInput from '../../shared/components/SearchInput';
import useUsernameLookup from '../hooks/useUsernameLookup';
import { SearchableMembersListAdditionalQueryParams } from '../types';

interface SearchableMembersListProps<TApiResponse, TItem> {
  useQuery: (
    params: any
  ) => {
    queryKey: QueryKey;
    queryFn: QueryFunction<TApiResponse>;
    getNextPageParam: GetNextPageParamFunction<TApiResponse>;
    getItemsFromDataPages: (data?: InfiniteData<TApiResponse>) => TItem[];
    getUserFromItem: (item: TItem) => User;
    getRolesFromItem?: (item: TItem) => Array<AssignedRole>;
  };

  groupId: number;

  renderContent: (item: TItem, index: number) => React.ReactNode;
  overflowActions?: Array<OverflowAction>;
  customControls?: React.ReactNode;
  onSearchActiveChange?: (isActive: boolean) => void;

  className?: string;
  emptyMessage?: string;
  searchPlaceholder?: string;
  additionalQueryParams?: SearchableMembersListAdditionalQueryParams;
  staleTime?: number;
}

const MEMBER_ROW_HEIGHT = 80;
const VIRTUALIZED_LIST_BUFFER_SIZE = 50; // use a large buffer size to reduce thumbnail reloading

const SearchableMembersList = <TApiResponse, TItem>({
  className,
  groupId,
  useQuery,
  renderContent,
  overflowActions,
  searchPlaceholder,
  customControls,
  onSearchActiveChange,
  emptyMessage,
  additionalQueryParams,
  staleTime
}: SearchableMembersListProps<TApiResponse, TItem>): React.ReactElement => {
  const { translate } = useTranslation();
  const [userSearchString, setUserSearchString] = useState('');

  const updateSearchString = useCallback(
    (value: string) => {
      setUserSearchString(value);
      onSearchActiveChange?.(value.length > 0);
    },
    [onSearchActiveChange]
  );

  const {
    user: searchUser,
    isLoading: isLoadingSearchUser,
    isError: isErrorSearchUser,
    isNotFound: searchUserIsNotFound
  } = useUsernameLookup(userSearchString);

  const {
    queryKey,
    queryFn,
    getNextPageParam,
    getItemsFromDataPages,
    getUserFromItem,
    getRolesFromItem
  } = useQuery({
    groupId,
    filteredUserId: searchUser?.id,
    ...additionalQueryParams
  });

  const renderItem = useCallback(
    (item: TItem, index: number) => {
      const user = getUserFromItem(item);
      const content = renderContent(item, index);
      return (
        <div className='width-full' key={user.userId}>
          <MemberInfoDisplay
            user={user}
            groupId={groupId}
            content={content}
            overflowActions={overflowActions}
            memberRoles={getRolesFromItem?.(item)}
          />
          <Divider />
        </div>
      );
    },
    [getUserFromItem, getRolesFromItem, groupId, renderContent, overflowActions]
  );

  const displayedEmptyMessage = userSearchString
    ? translate('Label.NoResults', { searchTerm: userSearchString })
    : emptyMessage;

  return (
    <div className={className}>
      <div className='margin-bottom-small group-mobile-spacing flex gap-small'>
        <div className='grow-2'>
          <SearchInput
            size='Medium'
            placeholder={searchPlaceholder ?? translate('Label.Search')}
            onSubmit={updateSearchString}
            onClear={() => updateSearchString('')}
          />
        </div>
        {customControls}
      </div>
      <div className='margin-bottom-small padding-x-large text-label-medium'>
        {translate('Heading.Members')}
      </div>
      <Divider />
      {isLoadingSearchUser && <Loading />}
      {isErrorSearchUser && (
        <div className='padding-large text-center'>{translate('NetworkError')}</div>
      )}
      {!isLoadingSearchUser && !isErrorSearchUser && (
        <InfiniteQueryList
          className={className}
          queryKey={queryKey}
          queryFn={queryFn}
          getNextPageParam={getNextPageParam}
          getItemsFromDataPages={getItemsFromDataPages}
          renderItem={renderItem}
          itemHeight={MEMBER_ROW_HEIGHT}
          bufferSize={VIRTUALIZED_LIST_BUFFER_SIZE}
          staleTime={staleTime}
          emptyMessage={displayedEmptyMessage}
          hideResults={searchUserIsNotFound}
        />
      )}
    </div>
  );
};

export default SearchableMembersList;
