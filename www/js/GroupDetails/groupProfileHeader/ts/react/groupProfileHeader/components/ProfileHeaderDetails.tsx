import React, { useMemo } from 'react';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailBadgeIconSize
} from 'roblox-thumbnails';
import { Link, Skeleton } from '@rbx/ui';
import { urlService } from 'core-utilities';
import { useTranslation } from 'react-utilities';
import { BadgeSizes, VerifiedBadgeIconContainer } from 'roblox-badges';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';

const NAME_SKELETON_HEIGHT = 34;
const NAME_SKELETON_WIDTH = 200;
const OWNER_SKELETON_HEIGHT = 20;
const OWNER_SKELETON_WIDTH = 100;

const ProfileHeaderDetails: React.FC = () => {
  const { translate } = useTranslation();
  const {
    groupId,
    isCommunityProfile,
    communityProfileHeaderData
  } = useGroupProfileHeaderContext();
  const { name, isVerified, ownerUserId, ownerName, ownerIsVerified } =
    communityProfileHeaderData ?? {};

  const userProfileUrl = useMemo(() => {
    if (!ownerUserId) {
      return '';
    }
    return urlService.getAbsoluteUrl(`/users/${ownerUserId}/profile`);
  }, [ownerUserId]);

  return (
    <div className='profile-header-details-container flex gap-medium items-center'>
      <div className='profile-header-details-avatar-container'>
        <Thumbnail2d
          containerClass={`profile-header-details-avatar ${
            isCommunityProfile ? 'radius-medium' : 'radius-circle'
          }`}
          targetId={groupId}
          type={ThumbnailTypes.groupIcon}
          size={ThumbnailBadgeIconSize.size150}
          format={ThumbnailFormat.webp}
        />
      </div>
      <div className='profile-header-details-names-container flex flex-col'>
        {!communityProfileHeaderData && (
          <React.Fragment>
            <Skeleton
              className='profile-header-details-name-skeleton'
              animate
              height={NAME_SKELETON_HEIGHT}
              width={NAME_SKELETON_WIDTH}
            />
            <Skeleton
              className='profile-header-details-owner-skeleton'
              animate
              height={OWNER_SKELETON_HEIGHT}
              width={OWNER_SKELETON_WIDTH}
            />
          </React.Fragment>
        )}
        {name && (
          <span className='profile-header-details-community-name text-heading-large'>
            {name}
            {isVerified && (
              <React.Fragment>
                {' '}
                <VerifiedBadgeIconContainer
                  overrideContainerClass='inline'
                  size={BadgeSizes.TITLE}
                />
              </React.Fragment>
            )}
          </span>
        )}
        {ownerName && (
          <span className='profile-header-details-owner-name text-body-large content-default'>
            {translate('Label.ByOwner')}{' '}
            <Link color='inherit' href={userProfileUrl}>
              {ownerName}
            </Link>
            {ownerIsVerified && (
              <React.Fragment>
                {' '}
                <VerifiedBadgeIconContainer
                  overrideContainerClass='inline'
                  size={BadgeSizes.SUBHEADER}
                />
              </React.Fragment>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileHeaderDetails;
