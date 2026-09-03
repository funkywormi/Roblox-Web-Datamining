import { InfiniteData, QueryKey, useInfiniteQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import groupAffiliatesService, {
  AffiliateGroup,
  GetAffiliatesResponse,
  RelationshipType
} from '../services/groupAffiliatesService';

interface UseGroupAffiliatesResult {
  affiliates: AffiliateGroup[];
  isLoading: boolean;
  hasError: boolean;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  loadNextPage: () => void;
  loadPrevPage: () => void;
}

export const getAffiliatesQueryKey = (
  groupId: number,
  relationshipType: RelationshipType
): QueryKey => ['groups', groupId, 'affiliates', relationshipType];

const getItemsFromDataPages = (data?: InfiniteData<GetAffiliatesResponse>): AffiliateGroup[] => {
  if (!data?.pages) return [];
  const items: AffiliateGroup[] = [];
  for (const page of data.pages) {
    items.push(...(page.relatedGroups ?? []));
  }
  return items;
};

const useGroupAffiliates = (
  groupId: number,
  relationshipType: RelationshipType
): UseGroupAffiliatesResult => {
  const pageSize = groupAffiliatesService.DEFAULT_PAGE_SIZE;
  const loadSize = groupAffiliatesService.DEFAULT_LOAD_SIZE;
  const [currentPage, setCurrentPage] = useState(0);

  const isMountedRef = useRef(true);
  useEffect(
    () => () => {
      isMountedRef.current = false;
    },
    []
  );

  const {
    data,
    isInitialLoading,
    isError,
    fetchNextPage,
    isFetchingNextPage,
    hasNextPage: hasUnfetchedBatch
  } = useInfiniteQuery({
    queryKey: getAffiliatesQueryKey(groupId, relationshipType),
    queryFn: ({ pageParam = 0 }: { pageParam?: number }) =>
      groupAffiliatesService.getAffiliates({
        groupId,
        relationshipType,
        startRowIndex: pageParam,
        maxRows: loadSize
      }),
    getNextPageParam: lastPage => lastPage.nextRowIndex ?? undefined,
    enabled: Boolean(groupId),
    retry: false
  });

  const loadedAffiliates = useMemo(() => getItemsFromDataPages(data), [data]);
  const totalCount = data?.pages?.[0]?.totalGroupCount ?? 0;
  const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : 0;
  const hasNextPage = currentPage < totalPages - 1;
  const hasPrevPage = currentPage > 0;

  const loadNextPage = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;

    const nextPage = currentPage + 1;
    const neededCount = (nextPage + 1) * pageSize;

    if (neededCount > loadedAffiliates.length && hasUnfetchedBatch) {
      fetchNextPage()
        .then(result => {
          if (isMountedRef.current && !result.isError) setCurrentPage(nextPage);
        })
        .catch(() => undefined);
    } else {
      setCurrentPage(nextPage);
    }
  }, [
    hasNextPage,
    isFetchingNextPage,
    currentPage,
    pageSize,
    loadedAffiliates.length,
    hasUnfetchedBatch,
    fetchNextPage
  ]);

  const loadPrevPage = useCallback(() => {
    setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  }, []);

  const startIndex = currentPage * pageSize;
  const affiliates = loadedAffiliates.slice(startIndex, startIndex + pageSize);

  return {
    affiliates,
    isLoading: isInitialLoading || isFetchingNextPage,
    hasError: isError,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    loadNextPage,
    loadPrevPage
  };
};

export default useGroupAffiliates;
