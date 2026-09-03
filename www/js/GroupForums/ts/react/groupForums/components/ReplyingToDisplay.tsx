import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-style-guide';
import { Endpoints } from 'Roblox';
import { Thumbnail2d, ThumbnailAvatarHeadshotSize, ThumbnailTypes } from 'roblox-thumbnails';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import usersService from '../../shared/services/usersService';
import { UserData } from '../../shared/types';
import ReplyingToSkeleton from './skeletons/ReplyingToSkeleton';
import { groupsConfig } from '../translation.config';

export type ReplyingToDisplayProps = {
  userId: number;
} & WithTranslationsProps;

const ReplyingToDisplay = ({ userId, translate }: ReplyingToDisplayProps): JSX.Element | null => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserData | null>(null);

  const fetchUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const userResponse: UserData[] = await usersService.fetchUserInfo(userId);
      if (userResponse.length) {
        setUser(userResponse[0]);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line no-void
    void fetchUser();
  }, [fetchUser]);

  if (isLoading || !user) {
    return <ReplyingToSkeleton />;
  }

  return (
    <div className='group-forums-replying-to-display'>
      <Link
        className='group-forums-replying-to-username-link text-default'
        url={Endpoints.getAbsoluteUrl(`/users/${user.id}/profile`)}>
        <Thumbnail2d
          type={ThumbnailTypes.avatarHeadshot}
          size={ThumbnailAvatarHeadshotSize.size48}
          targetId={user.id}
          containerClass='group-forums-replying-to-thumbnail'
          altName={user.displayName}
        />
      </Link>
      <div className='group-forums-replying-to-text text-default'>
        {translate('Label.ReplyingTo')}
        <span className='replying-to-user-name text-emphasis font-bold'> {user.displayName} </span>
      </div>
    </div>
  );
};

export default withTranslations(ReplyingToDisplay, groupsConfig);
