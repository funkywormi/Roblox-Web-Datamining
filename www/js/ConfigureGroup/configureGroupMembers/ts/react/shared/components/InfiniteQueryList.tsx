import React, { useMemo } from 'react';
import { useTranslation } from 'react-utilities';
import { Loading } from 'react-style-guide';
import {
  GetNextPageParamFunction,
  InfiniteData,
  QueryFunction,
  QueryKey,
  useInfiniteQuery
} from '@tanstack/react-query';
import VirtualizedList from './VirtualizedList';
import InfiniteLoader from './InfiniteLoader';

interface InfiniteQueryListProps<TApiResponse, TItem> {
  queryKey: QueryKey;
  queryFn: QueryFunction<TApiResponse>;
  getNextPageParam: GetNextPageParamFunction<TApiResponse>;
  getItemsFromDataPages: (data?: InfiniteData<TApiResponse>) => Array<TItem>;

  renderItem: (item: TItem, index: number) => React.ReactNode;
  itemHeight: number;
  bufferSize?: number;
  staleTime?: number;

  className?: string;
  emptyMessage?: string;
  hideResults?: boolean;
}

const InfiniteQueryList = <TApiResponse, TItem>({
  className,
  queryKey,
  queryFn,
  getNextPageParam,
  getItemsFromDataPages,
  renderItem,
  itemHeight,
  bufferSize,
  staleTime,
  emptyMessage,
  hideResults
}: InfiniteQueryListProps<TApiResponse, TItem>): React.ReactElement => {
  const { translate } = useTranslation();

  const { data, hasNextPage, isLoading, isFetching, isError, fetchNextPage } = useInfiniteQuery({
    queryKey,
    queryFn,
    getNextPageParam,
    staleTime
  });

  const mergedData = useMemo(() => getItemsFromDataPages(data), [data, getItemsFromDataPages]);
  const noResults = hideResults || (!isFetching && mergedData.length === 0);

  return (
    <div className={className}>
      {noResults && (
        <div className='padding-large text-center'>{emptyMessage ?? translate('Label.None')}</div>
      )}
      {!isLoading && !noResults && (
        <VirtualizedList
          items={mergedData}
          itemHeight={itemHeight}
          bufferSize={bufferSize}
          renderItem={renderItem}
        />
      )}
      {isError && !isFetching && (
        <div className='padding-large text-center'>{translate('NetworkError')}</div>
      )}
      {isFetching && <Loading />}
      {hasNextPage && !hideResults && (
        <InfiniteLoader onLoadMore={fetchNextPage} viewingThreshold={1} />
      )}
    </div>
  );
};

export default InfiniteQueryList;
