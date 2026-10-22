import { useContext } from "react";
import { Modal } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslation } from "@rbx/core-scripts/react";
import { ModalContext } from "../../contexts/ModalContext";
import "../../stylesheets/quickPay.scss";

export function QuickPay3DSModal() {
  const {
    quickPay3DS: { closeModal, isOpen, url },
  } = useContext(ModalContext);

  const { translate } = useTranslation();

  return (
    <Modal show={isOpen} onHide={closeModal} size="sm" centered scrollable={false}>
      <Modal.Header
        title={translate("QuickPay.Authentication")}
        showCloseButton
        onClose={closeModal}
      />
      <div className="quick-pay-3ds-modal-content">
        <iframe title="3DS Modal" src={url} width={400} height={640} style={{ border: 0 }} />
      </div>
    </Modal>
  );
}
