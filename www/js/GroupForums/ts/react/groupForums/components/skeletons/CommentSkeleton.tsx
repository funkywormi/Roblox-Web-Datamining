import React from 'react';
import UserDisplaySkeleton from './UserDisplaySkeleton';

const CommentSkeleton = (): JSX.Element => {
  return (
    <div className='group-forums-comment-skeleton'>
      <UserDisplaySkeleton />
      <div className='group-forums-comment-content-skeleton group-forums-skeleton' />
      <div className='group-forums-comment-content-skeleton group-forums-skeleton' />
      <div className='group-forums-comment-content-skeleton group-forums-skeleton' />
      <div className='groups-forums-comment-metadata-section-skeleton'>
        <div className='groups-forums-comment-metadata-reaction-section-skeleton'>
          <div className='group-forums-comment-icon-skeleton group-forums-skeleton' />
          <div className='groups-forums-comment-reaction-skeleton group-forums-skeleton' />
          <div className='groups-forums-comment-reaction-skeleton group-forums-skeleton' />
          <div className='groups-forums-comment-reaction-skeleton group-forums-skeleton' />
          <div className='group-forums-comment-icon-skeleton group-forums-skeleton' />
        </div>
        <div className='groups-forums-comment-metadata-reply-section-skeleton'>
          <div className='groups-forums-comment-reply-skeleton group-forums-skeleton' />
        </div>
      </div>
    </div>
  );
};

export default CommentSkeleton;
