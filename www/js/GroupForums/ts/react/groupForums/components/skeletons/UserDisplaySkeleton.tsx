import React from 'react';

const UserDisplaySkeleton = (): JSX.Element | null => {
  return (
    <div className='group-forums-user-display-skeleton'>
      <div className='group-forums-user-display-avatar-skeleton group-forums-skeleton' />
      <div className='user-display-with-time-skeleton group-forums-skeleton' />
    </div>
  );
};

export default UserDisplaySkeleton;
