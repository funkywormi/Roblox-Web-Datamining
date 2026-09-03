import React, { useCallback } from 'react';
import { useTranslation } from 'react-utilities';
import { useForumsSearchContext } from '../contexts/ForumsSearchContext';
import { ForumsMode, ForumSearchResultView } from '../types/search';
import { isAllCategories } from '../utils/forumsSearchUrl';
import ForumsSearchResultPost from '../components/ForumsSearchResultPost';
import ForumsSearchResultComment from '../components/ForumsSearchResultComment';
import PostPreviewSkeleton from '../components/skeletons/PostPreviewSkeleton';
import InfiniteLoader from '../../shared/components/InfiniteLoader';
import SectionDisclaimer from '../../shared/components/SectionDisclaimer';
import { logCmntyForumsSearchResultClickedEvent } from '../../shared/utils/logging';
import { SearchSurface } from '../../shared/constants/eventConstants';

const SearchResultsSkeleton = (): JSX.Element => (
  <div className='group-forums-posts-list group-forums-posts-list-skeleton'>
    <PostPreviewSkeleton />
    <PostPreviewSkeleton />
    <PostPreviewSkeleton />
  </div>
);

const SearchResultsList = (): JSX.Element => {
  const { translate } = useTranslation();
  const {
    results,
    isLoading,
    isError,
    retrySearch,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    mode,
    urlState,
    groupId
  } = useForumsSearchContext();

  const logResultClick = useCallback(
    (result: ForumSearchResultView) => {
      logCmntyForumsSearchResultClickedEvent({
        // Off the row, so a click reports the search that produced it.
        searchId: result.searchId,
        groupId,
        surface: SearchSurface.ForumsSearch,
        resultType: result.resultType,
        postId: result.post.id,
        ...(result.comment && { commentId: result.comment.id }),
        positionInList: result.positionInList,
        positionOnPage: result.positionOnPage,
        pageIndex: result.pageIndex
      });
    },
    [groupId]
  );

  // Label rows with their category only when the search can span more than one. Passed to post
  // and comment rows alike so the two never disagree.
  const showCategoryName = mode === ForumsMode.Search && isAllCategories(urlState.categoryId);

  if (isLoading) {
    return <SearchResultsSkeleton />;
  }

  // Before the no-results branch: a search that failed returned nothing, but it did not find
  // nothing, and the retry is the only way back since the query does not retry on its own.
  if (isError) {
    return (
      <SectionDisclaimer
        className='group-forums-posts-list-no-post'
        iconClassName='icon-status-alert'
        heading={translate('Error.LoadCategoryTitle')}
        message={translate('Error.ReloadingSubtitle')}
        buttonText={translate('Action.RetryLoadingPosts')}
        onClick={() => retrySearch()}
      />
    );
  }

  if (!results.length) {
    return (
      <SectionDisclaimer
        className='group-forums-posts-list-no-post'
        iconClassName='icon-regular-magnifying-glass'
        heading={translate('Label.NoSearchResults')}
        message={translate('Label.NoSearchResultsText')}
      />
    );
  }

  return (
    <div className='group-forums-posts-list'>
      <div className='group-forums-post-list-content'>
        {results.map(result =>
          result.contentType === 'Comment' && result.comment ? (
            <ForumsSearchResultComment
              key={`${result.post.id}-${result.comment.id}`}
              post={result.post}
              comment={result.comment}
              highlights={result.highlights}
              categoryName={result.categoryName}
              categoryShortId={result.categoryShortId}
              showCategoryName={showCategoryName}
              onResultClick={() => logResultClick(result)}
            />
          ) : (
            <ForumsSearchResultPost
              key={result.post.id}
              post={result.post}
              highlights={result.highlights}
              categoryName={result.categoryName}
              categoryShortId={result.categoryShortId}
              showCategoryName={showCategoryName}
              onResultClick={() => logResultClick(result)}
            />
          )
        )}
        {hasNextPage && <InfiniteLoader onLoadMore={fetchNextPage} viewingThreshold={1} />}
        {isFetchingNextPage && <div className='spinner spinner-default spinner-infinite-scroll' />}
      </div>
    </div>
  );
};

export default SearchResultsList;
