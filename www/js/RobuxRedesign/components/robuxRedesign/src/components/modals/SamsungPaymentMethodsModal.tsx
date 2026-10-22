import { useContext } from "react";
import { Modal, Button } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslation } from "@rbx/core-scripts/react";
import { ModalContext } from "../../contexts/ModalContext";
import { SamsungPaymentMethods } from "../../hooks/samsungPaymentMethods/useSamsungPaymentMethods";
import "../../stylesheets/samsungPaymentMethods.scss";

export function SamsungPaymentMethodsModal({
  handleClose,
  handleRedeemCreditClick,
  handleSamsungPayClick,
}: SamsungPaymentMethods) {
  const {
    samsungPaymentMethods: { isOpen: isSamsungPaymentMethodsModalOpen },
  } = useContext(ModalContext);

  const { translate } = useTranslation();

  return (
    <Modal
      show={isSamsungPaymentMethodsModalOpen}
      onHide={handleClose}
      size="md"
      scrollable={false}
      className="bottom-modal"
    >
      <Modal.Header
        title={translate("Message.MobilePaymentMethod.BottomSheetTitle")}
        showCloseButton
        onClose={handleClose}
      />
      <Modal.Body>
        <div className="samsung-pay-modal-buttons">
          <Button
            className="modal-button button-with-icon-text"
            variant={Button.variants.control}
            width={Button.widths.full}
            size={Button.sizes.large}
            onClick={handleSamsungPayClick}
          >
            <div className="button-inner">
              <div className="icon-samsung-pay" />
              <span className="button-label">
                {translate("Message.MobilePaymentMethod.MilkyWayCheckout")}
              </span>
            </div>
          </Button>
        </div>
        <div className="redeem-credit-buttons">
          <Button
            className="modal-button button-with-icon-text"
            variant={Button.variants.control}
            width={Button.widths.full}
            size={Button.sizes.large}
            onClick={handleRedeemCreditClick}
          >
            <div className="button-inner">
              <div className="payment-method-image payment-method-image-roblox robloxCredit" />
              <span className="button-label">
                {translate("Message.MobilePaymentMethod.RobloxCredit")}
              </span>
            </div>
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
