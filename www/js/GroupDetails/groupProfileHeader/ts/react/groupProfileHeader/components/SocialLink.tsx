import { EventStream } from 'Roblox';
import React, { ReactElement, useCallback } from 'react';
import { SocialLinks } from '@rbx/profile-platform';
import { Button } from '@rbx/ui';

export type SocialLinkProps = {
  groupId: number;
  socialLinkType: keyof SocialLinks;
  url: string;
  title: string;
  icon: ReactElement;
};

const SocialLink: React.FC<SocialLinkProps> = ({ groupId, socialLinkType, url, title, icon }) => {
  const handleClick = useCallback(() => {
    const eventPayload = {
      assignmentId: groupId,
      assignmentType: 'group',
      socialLinkType,
      socialLinkUrl: url,
      socialLinkDisplayType: 'badge'
    };

    EventStream.SendEventWithTarget(
      'socialLinkClickEvent',
      'group',
      eventPayload,
      EventStream.TargetTypes.WWW
    );
  }, [groupId, socialLinkType, url]);

  return (
    <a href={url} target='_blank' rel='noreferrer noopener' title={title} onClick={handleClick}>
      <Button
        tabIndex={-1}
        variant='text'
        size='small'
        color='secondary'
        className='social-link-btn'>
        <div className='flex items-center gap-xsmall'>
          {icon && <span className='social-link-icon flex content-emphasis'>{icon}</span>}
          <span className='text-caption-medium content-emphasis'>{title}</span>
        </div>
      </Button>
    </a>
  );
};

export default SocialLink;
