import React, { ReactElement, useMemo } from "react";
import { SocialLinks, About } from "@rbx/profile-platform";
import { useTranslation } from "@rbx/core-scripts/react";
import { Icon } from "@rbx/foundation-ui";
import type { TTailwindIconClass } from "@rbx/foundation-tailwind/classes";
import SocialLink from "./SocialLink";
import SectionHeader from "./SectionHeader";
import { SectionKeys } from "../../../constants/enums";

const SOCIAL_LINK_ICONS: Partial<Record<keyof SocialLinks, TTailwindIconClass>> = {
  facebook: "icon-regular-facebook",
  x: "icon-regular-twitter",
  youtube: "icon-regular-youtube",
  twitch: "icon-regular-twitch",
  guilded: "icon-regular-guilded",
  discord: "icon-regular-discord",
};

const SocialLinksContainer: React.FC<About> = ({ socialLinks }) => {
  const { translate } = useTranslation();
  const socialLinkComponents = useMemo(() => {
    const components: ReactElement[] = [];

    if (!socialLinks) {
      return components;
    }

    Object.keys(socialLinks).forEach(key => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
      const socialLinkType = key as keyof SocialLinks;
      const socialLinkInfo = socialLinks[socialLinkType];
      const socialLinkIconName = SOCIAL_LINK_ICONS[socialLinkType];
      if (!socialLinkInfo || !socialLinkIconName) {
        return;
      }

      const socialLinkIcon = <Icon name={socialLinkIconName} size="Small" />;

      components.push(
        <SocialLink
          key={key}
          url={socialLinkInfo.url}
          title={socialLinkInfo.target}
          icon={socialLinkIcon}
        />,
      );
    });

    return components;
  }, [socialLinks]);

  return (
    <div key={SectionKeys.SocialLinks} className="gap-small flex flex-col">
      <SectionHeader>{translate("Heading.SocialLinks")}</SectionHeader>
      {socialLinkComponents.length > 0 ? (
        <div className="gap-small flex flex-row">{socialLinkComponents}</div>
      ) : (
        <div className="text-body-medium">{translate("Label.NoSocialLink")}</div>
      )}
    </div>
  );
};

export default SocialLinksContainer;
