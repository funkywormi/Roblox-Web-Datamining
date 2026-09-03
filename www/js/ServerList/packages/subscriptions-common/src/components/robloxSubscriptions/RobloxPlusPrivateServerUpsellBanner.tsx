import { Button, Icon } from "@rbx/foundation-ui";

import type { FC } from "react";

type RobloxPlusPrivateServerUpsellBannerProps = {
  onOpenSheet?: () => void;
  subscribeText: string;
  upsellText: string;
};

const RobloxPlusPrivateServerUpsellBanner: FC<RobloxPlusPrivateServerUpsellBannerProps> = ({
  upsellText,
  subscribeText,
  onOpenSheet,
}) => (
  <div className="gap-small stroke-standard stroke-default radius-medium padding-y-xsmall padding-x-medium text-body-medium width-full clip flex items-center justify-between">
    <div className="gap-small grow-1 min-width-0 flex items-center">
      <Icon name="icon-regular-roblox-plus" size="Medium" />
      <span className="content-default">{upsellText}</span>
    </div>
    <Button className="shrink-0" size="Small" variant="Link" onClick={onOpenSheet}>
      {subscribeText}
    </Button>
  </div>
);

export default RobloxPlusPrivateServerUpsellBanner;
