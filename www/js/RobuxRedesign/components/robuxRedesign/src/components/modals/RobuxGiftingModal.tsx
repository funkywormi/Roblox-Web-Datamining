import { useContext, useEffect, useRef, useState } from "react";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";
import { useTranslation } from "@rbx/core-scripts/react";
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  Button,
  IconButton,
  DialogTitle,
  TextInput,
  Tooltip,
  TooltipTrigger,
} from "@rbx/foundation-ui";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { useRobuxGifting } from "../../hooks/robuxGifting/useRobuxGifting";
import { ModalContext } from "../../contexts/ModalContext";
import { trackCounter } from "../../observability";

export function RobuxGiftingModal() {
  const [isCopiedTooltipOpen, setIsCopiedTooltipOpen] = useState(false);
  const { giftingAvatarImageUrl, giftingUrl } = useContext(BuyRobuxPageContext);
  const {
    robuxGifting: { closeModal, isOpen },
  } = useContext(ModalContext);

  const { translate } = useTranslation();
  const { handleCopyUrl, handleShareLink, qrImgSrc } = useRobuxGifting(giftingUrl);
  const currentUser = authenticatedUser();
  const isLoggedIn = currentUser != null;
  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    if (isOpen) {
      trackCounter("RobuxGiftingModalShown");
    } else if (wasOpenRef.current) {
      trackCounter("RobuxGiftingModalClosed");
    }

    wasOpenRef.current = isOpen;
  }, [isLoggedIn, isOpen]);

  if (!currentUser) {
    return null;
  }

  const { displayName, name } = currentUser;
  const userName = `@${name}`;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={closeModal}
      size="Medium"
      isModal
      hasCloseAffordance
      closeLabel={translate("Action.Gifting.Close")}
    >
      <DialogContent>
        <DialogBody className="flex flex-col gap-large">
          <DialogTitle>
            <div className="text-heading-medium">{translate("Heading.Gifting.RequestRobux")}</div>
          </DialogTitle>
          <div className="flex flex-col gap-medium">
            <div className="text-body-large">
              {translate("Message.Gifting.RequestRobuxDescriptionLine1")}
            </div>
            <div className="text-body-small">
              {translate("Message.Gifting.RequestRobuxDescriptionLine2")}
            </div>
          </div>
          <div className="flex flex-col gap-medium bg-[var(--color-extended-white-100)] items-center justify-center radius-large padding-large">
            <div
              className="width-[158px] height-[158px] flex justify-center items-center"
              style={{
                backgroundImage: `url(${qrImgSrc})`,
                backgroundPosition: "center",
                backgroundSize: "contain",
                transform: "rotate(22.7deg)",
                // The reason we give this margin is because we are rotating the QR code, which makes it go out of the container and this additional margin is to compensate for that.
                marginTop: 28,
                marginBottom: 20,
              }}
            >
              <div className="width-[56px] height-[56px] bg-[var(--color-extended-white-100)]">
                <span className="clip" style={{ float: "left" }}>
                  {giftingAvatarImageUrl && (
                    <img
                      className="width-full height-full"
                      style={{
                        opacity: 1,
                        transition: "opacity .5s",
                        transform: "scale(1.25) rotate(-22.7deg)",
                      }}
                      src={giftingAvatarImageUrl}
                      alt="user avatar"
                    />
                  )}
                </span>
              </div>
            </div>
            <div className="text-align-x-center content-[var(--color-extended-gray-700)]">
              {displayName && <div className="text-title-large">{displayName}</div>}
              {userName && <div className="text-body-small">{userName}</div>}
            </div>
          </div>
          <div>
            <div className="flex flex-row gap-small items-end">
              <TextInput
                value={giftingUrl}
                onClick={e => {
                  e.currentTarget.select();
                }}
                label={translate("Action.Gifting.CopyAndShareUrl")}
              />
              <Tooltip
                position="left-center"
                open={isCopiedTooltipOpen}
                title={translate("Message.Gifting.UrlCopied")}
              >
                <TooltipTrigger asChild>
                  <IconButton
                    icon="icon-regular-chain-link"
                    size="Large"
                    ariaLabel={translate("Action.Gifting.CopyAndShareUrl")}
                    onClick={() => {
                      trackCounter("RobuxGiftingCopyUrl");
                      handleCopyUrl();
                      setIsCopiedTooltipOpen(true);
                      setTimeout(() => {
                        setIsCopiedTooltipOpen(false);
                      }, 2_000);
                    }}
                    variant="Standard"
                  />
                </TooltipTrigger>
              </Tooltip>
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <div className="flex flex-row gap-small justify-center">
            <Button variant="Standard" onClick={closeModal} className="width-full">
              {translate("Action.Gifting.Close")}
            </Button>
            <Button
              variant="Emphasis"
              onClick={handleShareLink}
              icon="icon-regular-arrow-up-from-landscape-rectangle"
              className="width-full"
            >
              {translate("Action.Gifting.ShareUrl")}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
