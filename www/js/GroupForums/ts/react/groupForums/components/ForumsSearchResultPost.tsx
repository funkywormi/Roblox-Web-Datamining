import React from 'react';
import { ForumPost } from '../types';
import { SearchHighlights } from '../types/search';
import PostPreview from './PostPreview';

export type ForumsSearchResultPostProps = {
  post: ForumPost;
  highlights?: SearchHighlights;
  categoryName: string;
  categoryShortId: string;
  isCategoryArchived: boolean;
  showCategoryName: boolean;
  onResultClick: () => void;
};

const ForumsSearchResultPost = ({
  post,
  highlights,
  categoryName,
  categoryShortId,
  isCategoryArchived,
  showCategoryName,
  onResultClick
}: ForumsSearchResultPostProps): JSX.Element => (
  <div className='group-forums-search-result-post'>
    <PostPreview
      showPinned={false}
      hasMenu={false}
      post={post}
      categoryName={categoryName}
      categoryShortId={categoryShortId}
      isCategoryArchived={isCategoryArchived}
      showCategoryName={showCategoryName}
      highlightedTitle={highlights?.title}
      highlightedBody={highlights?.body}
      onOpened={onResultClick}
    />
  </div>
);

export default ForumsSearchResultPost;
