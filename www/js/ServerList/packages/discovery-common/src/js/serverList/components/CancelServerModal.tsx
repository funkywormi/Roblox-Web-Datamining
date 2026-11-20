import React, { useCallback, useState } from "react";
import { type TranslateFunction, withTranslations } from "@rbx/core-scripts/react";
import { SimpleModal } from "@rbx/core-ui";
import translationConfig from "../translation.config";
import serverListConstants from "../constants/serverListConstants";

const { resources } = serverListConstants;

type TCancelServerError = {
  userFacingMessage?: string;
  message: string;
};

type TCancelServerModalProps = {
  translate: TranslateFunction;
  showModal: boolean;
  closeModal: (cancelled?: boolean) => void;
  expirationDate: string;
  cancelPrivateServer: () => Promise<{ data: unknown }>;
  systemFeedbackService: {
    success: (message: string) => void;
    warning: (message: string) => void;
  };
  setSubscription: (subscription: unknown) => void;
};

function CancelServerModal({
  translate,
  showModal,
  closeModal,
  expirationDate,
  cancelPrivateServer,
  systemFeedbackService,
  setSubscription,
}: TCancelServerModalProps) {
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
      .catch(({ data }: { data: { errors: [TCancelServerError, ...TCancelServerError[]] } }) => {
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

export default withTranslations(CancelServerModal, translationConfig.privateServer);
