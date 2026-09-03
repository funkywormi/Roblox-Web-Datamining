import React from 'react';
import { Thumbnail2d, ThumbnailTypes, ThumbnailUniverseThumbnailSize } from 'roblox-thumbnails';
import { useTranslation } from 'react-utilities';
import { GroupExperience } from '../types';

const ExperienceTile = ({ experience }: { experience: GroupExperience }): JSX.Element => {
  const { translate } = useTranslation();
  return (
    <a href={experience.gameReferralUrl} key={experience.id} className='group-experience-tile'>
      <div className='width-full aspect-16-9'>
        <Thumbnail2d
          type={ThumbnailTypes.universeThumbnail}
          size={ThumbnailUniverseThumbnailSize.width256}
          targetId={experience.id}
          containerClass='size-full'
          altName={experience.name}
        />
      </div>
      <div className='padding-medium'>
        <span className='block text-title-medium'>{experience.name}</span>
        <div>
          <span className='icon-rating-sm' />
          <span className='text-body-medium'>
            {translate('Label.VotePercent', { percent: experience.votes.votePercentage })}
          </span>
        </div>
      </div>
    </a>
  );
};

export default ExperienceTile;
