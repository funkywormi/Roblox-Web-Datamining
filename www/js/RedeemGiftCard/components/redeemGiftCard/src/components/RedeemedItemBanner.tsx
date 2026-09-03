import { Button, IconButton } from "@rbx/foundation-ui";
import React, { useMemo } from "react";
import { TranslateFunction } from "@rbx/core-scripts/react";
import { Thumbnail } from "@rbx/payments/thumbnails";
import { avatarPageUrl, eventTypes } from "../constants/redeemGiftCardConstants";
import sendRedeemGiftCardEvent from "../utils/events";

type RedeemedItemBannerProps = {
  itemName: string;
  itemId: number;
  itemType?: string;
  translate: TranslateFunction;
  onDismiss: () => void;
};

function RedeemedItemBanner({
  itemName,
  itemId,
  itemType,
  translate,
  onDismiss,
}: RedeemedItemBannerProps): JSX.Element {
  const thumbnailType = useMemo(() => {
    if (itemType === "Bundle") {
      return "BundleThumbnail";
    }
    return "Asset";
  }, [itemType]);

  const handleEquip = () => {
    sendRedeemGiftCardEvent(eventTypes.equipAvatarClicked);
    window.location.href = avatarPageUrl;
  };

  return (
    <div
      className="flex width-full items-center gap-medium bg-surface-200 stroke-standard stroke-muted padding-medium radius-medium margin-bottom-large"
      role="status"
      data-testid="redeemed-item-banner"
    >
      <div className="flex size-1300 shrink-0">
        <Thumbnail
          type={thumbnailType}
          targetId={itemId}
          altName={itemName}
          containerClass="width-full height-full"
          imgClassName="size-full"
        />
      </div>
      <div className="flex min-width-0 grow-1 flex-col">
        <span className="text-title-medium content-emphasis">
          {translate("Heading.FreeItemReceived")}
        </span>
        <span className="text-body-medium content-default">
          {translate("Description.FreeItemReceived")}
        </span>
      </div>
      <Button className="shrink-0" variant="Standard" size="Medium" onClick={handleEquip}>
        {translate("Action.Equip")}
      </Button>
      <IconButton
        className="shrink-0"
        variant="Utility"
        size="Large"
        icon="icon-regular-x-small"
        ariaLabel={translate("Action.Dialog.Close")}
        onClick={onDismiss}
      />
    </div>
  );
}

export default RedeemedItemBanner;
