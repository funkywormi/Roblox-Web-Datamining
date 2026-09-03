// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- ambient `*.gif` module declaration temporarily required for type checks in downstream consumers.
/// <reference path="../../assets.d.ts" />
import giftSpinGif from "../../images/gift-spin.gif";

import type { FC } from "react";

export type RobloxPlusGiftItemUpsellBannerProps = {
  title: string;
  body: string;
  imageAssetId: number;
};

const RobloxPlusGiftItemUpsellBanner: FC<RobloxPlusGiftItemUpsellBannerProps> = ({
  title,
  body,
}) => (
  <div className="bg-shift-200 radius-medium padding-medium gap-medium width-full flex items-center">
    <div className="radius-medium size-[50px] shrink-0 overflow-hidden">
      <img alt={title} className="size-full object-cover" src={giftSpinGif} />
    </div>
    <div className="min-width-0 grow-1 shrink-1 flex basis-0 flex-col justify-center">
      <span className="text-title-medium content-emphasis">{title}</span>
      <span className="text-body-medium content-default">{body}</span>
    </div>
  </div>
);

export default RobloxPlusGiftItemUpsellBanner;
