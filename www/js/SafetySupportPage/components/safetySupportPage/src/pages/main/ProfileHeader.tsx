import { authenticatedUser } from '@rbx/core-scripts/meta/user';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailAvatarHeadshotSize,
  ThumbnailFormat
} from '@rbx/thumbnails';

/**
 * Displays the user's avatar headshot along with their display name
 * and user name if available.
 */
const ProfileHeader: React.FC = () => {
  const user = authenticatedUser();
  const userId = user?.id ?? undefined;
  const username = user?.name;
  const displayName = user?.displayName;

  if (userId === undefined) {
    return null;
  }

  return (
    <div
      className='flex flex-col gap-large items-center width-full max-width-full'
      data-testid='safsup-profile-header'
    >
      <div className='size-1500'>
        <Thumbnail2d
          type={ThumbnailTypes.avatarHeadshot}
          size={ThumbnailAvatarHeadshotSize.size60}
          format={ThumbnailFormat.webp}
          targetId={userId}
          altName={displayName ?? ''}
          containerClass='radius-circle clip'
          includeBackground
        />
      </div>

      <div className='flex flex-col items-center gap-xxsmall width-full min-width-0'>
        {displayName && (
          <span className='width-full text-center text-title-large content-emphasis text-truncate-end'>
            {displayName}
          </span>
        )}
        {username && (
          <span className='width-full text-center text-label-medium content-default text-truncate-end'>
            @{username}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProfileHeader;
