import React from 'react';
import UserDisplaySkeleton from './UserDisplaySkeleton';

const PostPreviewSkeleton = (): JSX.Element => {
  return (
    <div className='group-forums-post-preview-skeleton'>
      <UserDisplaySkeleton />
      <div className='group-forums-post-preview-title-skeleton group-forums-skeleton' />
      <div className='group-forums-post-preview-content-skeleton group-forums-skeleton' />
      <div className='group-forums-post-preview-content-skeleton group-forums-skeleton' />
      <div className='group-forums-post-preview-content-skeleton group-forums-skeleton' />
      <div className='groups-forums-post-preview-metadata-section-skeleton'>
        <div className='groups-forums-post-preview-metadata-replies-section-skeleton'>
          <div className='group-forums-post-preview-icon-skeleton group-forums-skeleton' />
          <div className='groups-forums-post-preview-replies-count-skeleton group-forums-skeleton' />
        </div>
        <div className='groups-forums-post-preview-metadata-reaction-section-skeleton'>
          <div className='group-forums-post-preview-icon-skeleton group-forums-skeleton' />
          <div className='group-forums-post-preview-icon-skeleton group-forums-skeleton' />
          <div className='group-forums-post-preview-icon-skeleton group-forums-skeleton' />
          <div className='groups-forums-post-preview-reaction-count-skeleton group-forums-skeleton' />
        </div>
      </div>
    </div>
  );
};

export default PostPreviewSkeleton;
