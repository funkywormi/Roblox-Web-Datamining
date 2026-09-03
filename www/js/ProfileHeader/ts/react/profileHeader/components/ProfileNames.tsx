import React from 'react';
import { BadgeSizes, VerifiedBadgeIconContainer } from 'roblox-badges';
import { Typography, PremiumIcon } from '@rbx/ui';
import useProfileHeaderContext from '../hooks/useProfileHeaderContext';

const ProfileNames = ({ profileUserId }: { profileUserId: number }): JSX.Element => {
  const { state } = useProfileHeaderContext();
  let badgeIcon;
  if (state.hasVerifiedBadge) {
    badgeIcon = (
      <span data-testid='verified-badge'>
        <VerifiedBadgeIconContainer
          overrideImgClass='profile-verified-badge-icon'
          size={BadgeSizes.TITLE}
          titleText={profileUserId.toString()}
        />
      </span>
    );
  } else if (state.hasPremiumMembership) {
    badgeIcon = (
      <PremiumIcon data-testid='premium-badge' className='profile-header-premium-badge' />
    );
  }

  const formatUsername = (username: string | null | undefined) => {
    return username ? `@${username}` : '';
  };

  return (
    <div className='profile-header-names'>
      <span className='profile-header-title-container'>
        <Typography variant='h1'>{state.names.combinedName}</Typography>
        {badgeIcon}
      </span>
      <Typography variant='body1' color='secondary' className='profile-header-username'>
        {formatUsername(state.names.username)}
      </Typography>
    </div>
  );
};

export default ProfileNames;
