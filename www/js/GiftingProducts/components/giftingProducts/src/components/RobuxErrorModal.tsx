import { FC, useMemo } from "react";
import { Button, Modal } from "@rbx/core-ui/legacy/react-style-guide";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { translationConfig } from "../translation.config";
import { RobuxGiftErrorType } from "../constants/TypeDefinitions";

type RobuxErrorModalProps = {
  errorType: RobuxGiftErrorType;
  onClose: () => void;
} & WithTranslationsProps;

const RobuxErrorModal: FC<RobuxErrorModalProps> = ({ errorType, onClose, translate }) => {
  const titleStr = useMemo(() => {
    switch (errorType) {
      case RobuxGiftErrorType.PreparePayment:
        return "Heading.Gifting.GiftingError";
      case RobuxGiftErrorType.GiftLimit:
        return "Heading.Gifting.GiftLimitError";
      case RobuxGiftErrorType.RecipientIneligible:
      case RobuxGiftErrorType.PurchaserIneligible:
      default:
        return "";
    }
  }, [errorType]);

  const bodyStr = useMemo(() => {
    switch (errorType) {
      case RobuxGiftErrorType.PreparePayment:
        return "Description.GiftingError";
      case RobuxGiftErrorType.GiftLimit:
        return "Description.GiftLimitError";
      case RobuxGiftErrorType.RecipientIneligible:
      case RobuxGiftErrorType.PurchaserIneligible:
      default:
        return "";
    }
  }, [errorType]);

  const buttonStr = useMemo(() => {
    switch (errorType) {
      case RobuxGiftErrorType.PreparePayment:
        return "Message.Gifting.TryAgain";
      case RobuxGiftErrorType.GiftLimit:
        return "Action.Gifting.Close";
      case RobuxGiftErrorType.RecipientIneligible:
      case RobuxGiftErrorType.PurchaserIneligible:
      default:
        return "";
    }
  }, [errorType]);

  if (!titleStr || !bodyStr || !buttonStr) {
    return null;
  }

  return (
    <Modal
      aria-labelledby="robux-error-modal-title"
      centered
      className="robux-gifting-error-modal"
      onHide={onClose}
      scrollable={false}
      show
      size="md"
    >
      <Modal.Header useBaseBootstrapComponent>
        <Modal.Title id="robux-error-modal-title">{translate(titleStr)}</Modal.Title>
        <button type="button" className="close close-button" onClick={onClose} aria-label="Close">
          <span className="icon-close" />
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className="gifting-error">{translate(bodyStr)}</div>
      </Modal.Body>
      <Modal.Footer>
        <div className="buttons-section">
          <Button
            variant={Button.variants.growth}
            width={Button.widths.full}
            size={Button.sizes.medium}
            onClick={onClose}
          >
            {translate(buttonStr)}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default withTranslations(RobuxErrorModal, translationConfig);
