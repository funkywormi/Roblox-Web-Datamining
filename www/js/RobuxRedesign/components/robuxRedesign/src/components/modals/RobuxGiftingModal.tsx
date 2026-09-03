import { MouseEvent, useContext } from "react";
import { Modal, Button, TextFormField, Popover } from "@rbx/core-ui/legacy/react-style-guide";
import { CurrentUser } from "@rbx/core-scripts/legacy/Roblox";
import { useTranslation } from "@rbx/core-scripts/react";
import { BuyRobuxPageContext } from "../../contexts/BuyRobuxPageContext";
import { useRobuxGifting } from "../../hooks/robuxGifting/useRobuxGifting";
import { ModalContext } from "../../contexts/ModalContext";
import "../../stylesheets/giftingProducts.scss";

export function RobuxGiftingModal() {
  const { giftingAvatarImageUrl, giftingUrl } = useContext(BuyRobuxPageContext);
  const {
    robuxGifting: { closeModal, isOpen },
  } = useContext(ModalContext);

  const { translate } = useTranslation();
  const { handleCopyUrl, handleShareLink, qrImgSrc } = useRobuxGifting(giftingUrl);

  if (!CurrentUser) {
    return null;
  }

  const { displayName, name } = CurrentUser;
  const userName = `@${name}`;

  return (
    <Modal
      className="request-robux-modal"
      show={isOpen}
      onHide={closeModal}
      size="md"
      centered
      scrollable={false}
    >
      <Modal.Header
        title={translate("Heading.Gifting.RequestRobux")}
        showCloseButton
        onClose={closeModal}
      />
      <Modal.Body>
        <div className="description-container">
          <div className="description-line1">
            {translate("Message.Gifting.RequestRobuxDescriptionLine1")}
          </div>
          <div className="description-line2">
            {translate("Message.Gifting.RequestRobuxDescriptionLine2")}
          </div>
        </div>
        <div className="qr-code-container">
          <div className="qr-code-wrapper" style={{ backgroundImage: `url(${qrImgSrc})` }}>
            <div className="qr-code-profile-image">
              <span className="thumbnail-2d-container">
                {giftingAvatarImageUrl && <img src={giftingAvatarImageUrl} alt="user avatar" />}
              </span>
            </div>
          </div>
          <div className="user-info-container">
            {displayName && <div className="display-name">{displayName}</div>}
            {userName && <div className="name">{userName}</div>}
          </div>
        </div>
        <div className="copy-url-container">
          <TextFormField
            id="copy-url-input"
            label={translate("Action.Gifting.CopyAndShareUrl")}
            value={giftingUrl}
            fullWidth
            onClick={(e: MouseEvent<HTMLInputElement>) => {
              e.currentTarget.select();
            }}
          />
          <Popover
            id="url-copied-popover"
            placement="left"
            trigger="click"
            button={
              <Button
                className="copy-url-button"
                variant={Button.variants.control}
                width={Button.widths.min}
                size={Button.sizes.small}
                onClick={handleCopyUrl}
              >
                <span className="icon icon-regular-chain-link inline-block width-[20px] height-[20px] bg-inverse-surface-200" />
              </Button>
            }
          >
            {translate("Message.Gifting.UrlCopied")}
          </Popover>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="modal-footer-buttons">
          <Button variant={Button.variants.control} width={Button.widths.full} onClick={closeModal}>
            {translate("Action.Gifting.Close")}
          </Button>
          <Button
            variant={Button.variants.growth}
            size={Button.sizes.medium}
            width={Button.widths.full}
            onClick={handleShareLink}
          >
            <span className="icon icon-regular-arrow-up-from-landscape-rectangle inline-block width-[24px] height-[24px]" />
            {translate("Action.Gifting.ShareUrl")}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
