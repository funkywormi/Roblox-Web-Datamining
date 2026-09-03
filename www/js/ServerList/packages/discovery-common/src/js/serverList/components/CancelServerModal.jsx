import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { withTranslations } from "@rbx/core-scripts/react";
import { SimpleModal } from "@rbx/core-ui";
import translationConfig from "../translation.config";
import serverListConstants from "../constants/serverListConstants";

const { resources } = serverListConstants;

function CancelServerModal({
  translate,
  showModal,
  closeModal,
  expirationDate,
  cancelPrivateServer,
  systemFeedbackService,
  setSubscription,
}) {
  const [isCancelling, setIsCancelling] = useState(false);

  const modalBody = <p>{translate(resources.cancelServerText, { date: expirationDate })}</p>;

  const onAction = useCallback(() => {
    setIsCancelling(true);

    cancelPrivateServer()
      .then(({ data }) => {
        setSubscription(data);
        systemFeedbackService.success(
          translate(resources.serverCancellationSuccess) || "Server renewal successfully canceled",
        );
      })
      .catch(({ data }) => {
        if (data.errors?.length > 0) {
          const error = data.errors[0];
          systemFeedbackService.warning(error.userFacingMessage ?? error.message);
        }
      })
      .finally(() => {
        setIsCancelling(false);
        closeModal(true);
      });
  }, [cancelPrivateServer, closeModal, setSubscription, systemFeedbackService, translate]);

  return (
    <SimpleModal
      show={showModal}
      title={translate(resources.cancelPrivateServerText)}
      body={modalBody}
      actionButtonText={translate(resources.confirmCancelText)}
      neutralButtonText={translate(resources.doNotCancelText)}
      onAction={onAction}
      onClose={closeModal}
      onNeutral={closeModal}
      actionButtonShow
      loading={isCancelling}
    />
  );
}

CancelServerModal.propTypes = {
  translate: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  closeModal: PropTypes.func.isRequired,
  expirationDate: PropTypes.string.isRequired,
  cancelPrivateServer: PropTypes.func.isRequired,
  systemFeedbackService: PropTypes.shape({
    success: PropTypes.func.isRequired,
    warning: PropTypes.func.isRequired,
  }).isRequired,
  setSubscription: PropTypes.func.isRequired,
};

export default withTranslations(CancelServerModal, translationConfig.privateServer);
