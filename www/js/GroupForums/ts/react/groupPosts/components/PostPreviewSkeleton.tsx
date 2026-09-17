import React from 'react';
import UserDisplaySkeleton from '../../groupForums/components/skeletons/UserDisplaySkeleton';

const PostPreviewSkeleton = (): JSX.Element => {
  return (
    <div className='group-posts-preview-skeleton'>
      <UserDisplaySkeleton />
      <div className='group-posts-preview-title-skeleton group-forums-skeleton' />
      <div className='group-posts-preview-content-skeleton group-forums-skeleton' />
      <div className='group-posts-preview-content-skeleton group-forums-skeleton' />
      <div className='group-posts-preview-content-skeleton group-forums-skeleton' />
      <div className='group-posts-preview-metadata-section-skeleton'>
        <div className='group-posts-preview-metadata-replies-section-skeleton'>
          <div className='group-posts-preview-icon-skeleton group-forums-skeleton' />
          <div className='group-posts-preview-replies-count-skeleton group-forums-skeleton' />
        </div>
        <div className='group-posts-preview-metadata-reaction-section-skeleton'>
          <div className='group-posts-preview-icon-skeleton group-forums-skeleton' />
          <div className='group-posts-preview-icon-skeleton group-forums-skeleton' />
          <div className='group-posts-preview-icon-skeleton group-forums-skeleton' />
          <div className='group-posts-preview-reaction-count-skeleton group-forums-skeleton' />
        </div>
      </div>
    </div>
  );
};

export default PostPreviewSkeleton;
