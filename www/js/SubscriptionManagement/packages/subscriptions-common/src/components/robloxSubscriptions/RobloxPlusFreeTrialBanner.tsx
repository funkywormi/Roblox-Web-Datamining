import { Icon } from "@rbx/foundation-ui";

import type { FC } from "react";

export type RobloxPlusFreeTrialBannerProps = {
  title: string;
  body: string;
};

const RobloxPlusFreeTrialBanner: FC<RobloxPlusFreeTrialBannerProps> = ({ title, body }) => (
  <div className="bg-shift-200 radius-medium padding-medium gap-medium width-full flex items-center">
    <div className="radius-medium size-[50px] shrink-0 flex items-center justify-center">
      <Icon className="!size-900" name="icon-regular-roblox-plus" />
    </div>
    <div className="min-width-0 grow-1 shrink-1 flex basis-0 flex-col justify-center">
      <span className="text-title-medium content-emphasis">{title}</span>
      <span className="text-body-medium content-default">{body}</span>
    </div>
  </div>
);

export default RobloxPlusFreeTrialBanner;
