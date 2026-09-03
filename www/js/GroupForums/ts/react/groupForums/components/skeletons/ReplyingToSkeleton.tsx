import React from 'react';

const ReplyingToSkeleton = (): JSX.Element | null => {
  return (
    <div className='group-forums-replying-to-skeleton'>
      <div className='group-forums-replying-to-avatar-skeleton group-forums-skeleton' />
      <div className='group-forums-replying-to-name-skeleton group-forums-skeleton' />
    </div>
  );
};

export default ReplyingToSkeleton;
