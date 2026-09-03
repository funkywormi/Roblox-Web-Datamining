import React from 'react';
import Presence from 'roblox-presence';
import {
  Thumbnail2d,
  ThumbnailTypes,
  ThumbnailFormat,
  ThumbnailBadgeIconSize
} from 'roblox-thumbnails';

const AvatarHeadshot = ({
  profileUserId,
  presenceUrl,
  trustedConnection
}: {
  profileUserId: number;
  presenceUrl?: string;
  trustedConnection?: boolean;
}): JSX.Element => {
  const containerClass = trustedConnection ? 'trusted-connection-avatar-headshot' : '';

  return (
    <div className='avatar avatar-headshot-lg card-plain profile-avatar-image'>
      <span className='avatar-card-link avatar-image-link'>
        <Thumbnail2d
          containerClass={`avatar-card-image profile-avatar-thumb ${containerClass}`}
          targetId={profileUserId}
          format={ThumbnailFormat.webp}
          type={ThumbnailTypes.avatarHeadshot}
          size={ThumbnailBadgeIconSize.size150}
        />
      </span>
      <a className='avatar-status' href={presenceUrl}>
        <Presence.PresenceStatusIcon className='profile-avatar-status' userId={profileUserId} />
      </a>
    </div>
  );
};

AvatarHeadshot.defaultProps = {
  presenceUrl: ''
};

export default AvatarHeadshot;
