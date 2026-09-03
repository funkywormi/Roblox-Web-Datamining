import { FC, useCallback } from "react";
import { withTranslations, WithTranslationsProps } from "@rbx/core-scripts/react";
import { Modal } from "@rbx/core-ui/legacy/react-style-guide";
import { translationConfig } from "../translation.config";
import RobuxPhoneSubmission from "./RobuxPhoneSubmission";
import RobuxPhoneAuthentication from "./RobuxPhoneAuthentication";
import useRobuxPhoneVerification, {
  RobuxPhoneVerificationStep,
} from "../hooks/useRobuxPhoneVerification";
import "../css/robuxPhoneVerificationModal.scss";

type RobuxPhoneVerificationModalProps = {
  show: boolean;
  // the phoneVerificationSessionId argument to onClose() will be null if
  // the user exits the modal without completing the verification flow
  onClose: (phoneVerificationSessionId: string | null) => void;
} & WithTranslationsProps;

const RobuxPhoneVerificationModal: FC<RobuxPhoneVerificationModalProps> = ({
  onClose,
  show,
  translate,
}) => {
  const robuxPhoneVerification = useRobuxPhoneVerification(onClose);
  const { onExitModal, phoneVerificationStep } = robuxPhoneVerification;
  const onExit = useCallback(() => {
    onExitModal(null);
  }, [onExitModal]);

  return (
    <Modal
      aria-labelledby="verification-upsell-modal-title"
      centered
      className="robux-gifting-verification-modal"
      onHide={onExit}
      scrollable={false}
      show={show}
      size="md"
    >
      <Modal.Header useBaseBootstrapComponent>
        <Modal.Title id="verification-upsell-modal-title">
          {translate("Heading.Verification")}
        </Modal.Title>
        <button type="button" className="close close-button" onClick={onExit} aria-label="Close">
          <span className="icon-close" />
        </button>
      </Modal.Header>
      {phoneVerificationStep === RobuxPhoneVerificationStep.PhoneNumber ? (
        <RobuxPhoneSubmission robuxPhoneVerification={robuxPhoneVerification} />
      ) : (
        <RobuxPhoneAuthentication robuxPhoneVerification={robuxPhoneVerification} />
      )}
    </Modal>
  );
};

export default withTranslations(RobuxPhoneVerificationModal, translationConfig);
