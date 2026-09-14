import { Button } from "@rbx/foundation-ui";

import giftAugust2026Image from "../../images/gift-august-2026.png";

import type { FC, KeyboardEvent, MouseEvent } from "react";

export type RobloxPlusGiftItemUpsellBannerProps = {
  title: string;
  body: string;
  equipText?: string;
  onEquip?: () => void;
  onItemDetailsClick?: () => void;
};

const RobloxPlusGiftItemUpsellBanner: FC<RobloxPlusGiftItemUpsellBannerProps> = ({
  title,
  body,
  equipText,
  onEquip,
  onItemDetailsClick,
}) => {
  const isItemDetailsClickable = onItemDetailsClick != null;

  const onBannerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onItemDetailsClick?.();
    }
  };

  const onEquipClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onEquip?.();
  };

  return (
    <div
      aria-label={isItemDetailsClickable ? title : undefined}
      className={`bg-shift-200 radius-medium padding-medium gap-medium width-full flex items-center ${
        isItemDetailsClickable ? "hover:bg-surface-100 cursor-pointer" : ""
      }`}
      role={isItemDetailsClickable ? "button" : undefined}
      tabIndex={isItemDetailsClickable ? 0 : undefined}
      onClick={onItemDetailsClick}
      onKeyDown={isItemDetailsClickable ? onBannerKeyDown : undefined}
    >
      <div className="radius-medium size-[50px] shrink-0 overflow-hidden">
        <img alt={title} className="size-full object-cover" src={giftAugust2026Image} />
      </div>
      <div className="min-width-0 grow-1 shrink-1 flex basis-0 flex-col justify-center">
        <span className="text-title-medium content-emphasis">{title}</span>
        <span className="text-body-medium content-default">{body}</span>
      </div>
      {equipText != null && onEquip != null && (
        <Button className="shrink-0" size="Medium" variant="Standard" onClick={onEquipClick}>
          {equipText}
        </Button>
      )}
    </div>
  );
};

export default RobloxPlusGiftItemUpsellBanner;
