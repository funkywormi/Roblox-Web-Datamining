import { Button } from 'react-style-guide';
import { Thumbnail2d, ThumbnailTypes } from 'roblox-thumbnails';
import { Thumbnail3d } from 'roblox-thumbnail-3d';
import React, { useState } from 'react';
import currentWearingService from '../services/currentWearingService';
import currentWearingContants from '../constants/currentWearingContants';

const CurrentAvatar = (): JSX.Element => {
  const [mode, setMode] = useState<string>(currentWearingService.getAvatarMode());

  return (
    <div className='col-sm-6 section-content profile-avatar-left'>
      <div className='thumbnail-holder'>
        {mode === currentWearingContants.avatarMode.twoD ? (
          <Thumbnail2d
            targetId={currentWearingService.getUserId()}
            type={ThumbnailTypes.avatar}
            size={currentWearingContants.avatarThumbnailSize}
            containerClass='thumbnail-span'
          />
        ) : (
          <Thumbnail3d targetId={currentWearingService.getUserId()} />
        )}

        <Button
          className='enable-three-dee btn-control'
          variant={Button.variants.control}
          size={Button.sizes.large}
          width={Button.widths.default}
          onClick={() => {
            if (mode === currentWearingContants.avatarMode.twoD) {
              setMode(currentWearingContants.avatarMode.threeD);
              currentWearingService.setAvatarMode(currentWearingContants.avatarMode.threeD);
            } else {
              setMode(currentWearingContants.avatarMode.twoD);
              currentWearingService.setAvatarMode(currentWearingContants.avatarMode.twoD);
            }
          }}>
          {mode === currentWearingContants.avatarMode.twoD
            ? currentWearingContants.avatarMode.threeD
            : currentWearingContants.avatarMode.twoD}
        </Button>
      </div>
    </div>
  );
};

export default CurrentAvatar;
