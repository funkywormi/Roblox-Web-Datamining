import React, { ReactElement } from "react";
import { Button } from "@rbx/foundation-ui";

export type SocialLinkProps = {
  url: string;
  title: string;
  icon: ReactElement;
};

const SocialLink: React.FC<SocialLinkProps> = ({ url, title, icon }) => (
  <Button
    as="a"
    href={url}
    target="_blank"
    rel="noreferrer noopener"
    size="Small"
    variant="ActionUtility"
  >
    <div className="items-center gap-xsmall flex">
      <span className="social-link-icon content-emphasis flex">{icon}</span>
      <span className="content-emphasis text-caption-medium">{title}</span>
    </div>
  </Button>
);

export default SocialLink;
