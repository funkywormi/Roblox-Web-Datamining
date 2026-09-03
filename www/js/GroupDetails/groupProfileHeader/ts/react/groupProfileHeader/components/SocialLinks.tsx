import React, { ReactElement, useMemo } from 'react';
import { SocialLinks } from '@rbx/profile-platform';
import { useGroupProfileHeaderContext } from '../context/GroupProfileHeaderContext';
import SocialLink from './SocialLink';

type SocialLinksProps = {
  socialLinks: SocialLinks;
};

const SOCIAL_LINK_ICONS: Partial<Record<keyof SocialLinks, string>> = {
  facebook: 'icon-regular-facebook',
  x: 'icon-regular-twitter',
  youtube: 'icon-regular-youtube',
  twitch: 'icon-regular-twitch',
  guilded: 'icon-regular-guilded',
  discord: 'icon-regular-discord'
};

const SocialLinks: React.FC<SocialLinksProps> = ({ socialLinks }) => {
  const { groupId } = useGroupProfileHeaderContext();

  const socialLinkComponents = useMemo(() => {
    const components: [ReactElement, string][] = [];

    Object.keys(socialLinks).forEach(key => {
      const socialLinkType = key as keyof SocialLinks;
      const socialLinkInfo = socialLinks[socialLinkType];
      if (!socialLinkInfo) {
        return;
      }

      const socialLinkIcon = (
        <span
          role='presentation'
          className={`icon size-400 ${SOCIAL_LINK_ICONS[socialLinkType] ?? ''}`}
        />
      );

      components.push([
        <SocialLink
          groupId={groupId}
          socialLinkType={socialLinkType}
          url={socialLinkInfo.url}
          title={socialLinkInfo.title}
          icon={socialLinkIcon}
        />,
        key
      ]);
    });

    return components;
  }, [socialLinks, groupId]);

  return (
    <div className='flex flex-row flex-wrap gap-small'>
      {socialLinkComponents.map(([component, key]) => (
        <React.Fragment key={key}>{component}</React.Fragment>
      ))}
    </div>
  );
};

export default SocialLinks;
