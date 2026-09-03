import React from 'react';
import UserDisplaySkeleton from './skeletons/UserDisplaySkeleton';

const PostSkeleton = (): JSX.Element => {
  return (
    <div className='group-forums-post-skeleton'>
      <UserDisplaySkeleton />
      <div className='group-forums-post-title-skeleton group-forums-skeleton' />
      <div className='group-forums-post-content-skeleton group-forums-skeleton' />
      <div className='group-forums-post-content-skeleton group-forums-skeleton' />
      <div className='group-forums-post-content-skeleton group-forums-skeleton' />
      <div className='groups-forums-post-metadata-section-skeleton'>
        <div className='groups-forums-post-metadata-reaction-section-skeleton'>
          <div className='group-forums-post-icon-skeleton group-forums-skeleton' />
          <div className='groups-forums-post-reaction-skeleton group-forums-skeleton' />
          <div className='groups-forums-post-reaction-skeleton group-forums-skeleton' />
          <div className='groups-forums-post-reaction-skeleton group-forums-skeleton' />
          <div className='group-forums-post-icon-skeleton group-forums-skeleton' />
        </div>
        <div className='groups-forums-post-metadata-reply-section-skeleton'>
          <div className='groups-forums-post-reply-skeleton group-forums-skeleton' />
        </div>
      </div>
    </div>
  );
};

export default PostSkeleton;
