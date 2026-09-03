import { useContext } from "react";
import { useTranslation } from "@rbx/core-scripts/react";
import { Modal } from "@rbx/core-ui";
import { ModalContext } from "../contexts/ModalContext";

export function LoginRedirectErrorModal() {
  const { translate } = useTranslation();

  const {
    redirectError: { isOpen, closeModal },
  } = useContext(ModalContext);

  return (
    <Modal
      className="login-redirect-failure-modal"
      show={isOpen}
      onHide={closeModal}
      size="sm"
      centered
      scrollable={false}
    >
      <Modal.Header title={translate("Message.SomethingWentWrong")} onClose={closeModal} />
      <Modal.Body>
        <div className="text-body-large">{translate("Message.PleaseTryAgain")}</div>
      </Modal.Body>
    </Modal>
  );
}
