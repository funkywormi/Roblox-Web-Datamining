import React, { Fragment } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loading, Modal } from "react-style-guide";
import useAccountRecoveryContext from "../../hooks/useAccountRecoveryContext";
import { AccountRecoveryActionType } from "../../store/action";
import ModalState from "../../store/modalState";
import { FooterButtonConfig } from "../../../common/modalFooter";
import { mapAccountRecoveryErrorToResource } from "../../constants/resources";

const ModalSaveOrDeleteTwoStepMethod: React.FC = () => {
  const {
    state: { modalStateAndProps, requestService, recoverySessionId, resources },
    dispatch,
  } = useAccountRecoveryContext();

  const { data: currentTwoStepMethod = "", isLoading: initializing } = useQuery({
    queryKey: ["currentTwoStepMethod", recoverySessionId],
    queryFn: async () => {
      const result =
        await requestService.accountRecoveryApi.getCurrentTwoStepMethod(recoverySessionId);
      if (result.isError) {
        throw new Error(String(result.error));
      }
      return result.value.twoStepMethod;
    },
  });

  const handleNextSteps = () => {
    if (modalStateAndProps.modalState !== ModalState.SAVE_OR_DELETE_TWO_STEP_METHOD) return;
    const { shouldUpdateEmail, updatedEmail, onPasswordResetSuccess } =
      modalStateAndProps.additionalModalProps;
    if (shouldUpdateEmail) {
      dispatch({
        type: AccountRecoveryActionType.SET_MODAL_STATE,
        modalState: ModalState.UPDATE_EMAIL,
        additionalModalProps: {
          updatedEmail: updatedEmail ?? "",
          onPasswordResetSuccess,
        },
      });
      return;
    }
    onPasswordResetSuccess();
  };

  const {
    mutate: handleDelete,
    isPending: requestInFlight,
    error: deleteError,
  } = useMutation<undefined, Error>(
    async () => {
      const result = await requestService.accountRecoveryApi.disableTwoStepMethod(
        recoverySessionId,
        currentTwoStepMethod,
      );
      if (result.isError) {
        throw new Error(mapAccountRecoveryErrorToResource(resources, result.error));
      }
    },
    { onSuccess: handleNextSteps },
  );

  if (modalStateAndProps.modalState !== ModalState.SAVE_OR_DELETE_TWO_STEP_METHOD) {
    return <Fragment />;
  }

  const getTwoStepMethodText = (twoStepMethod: string) => {
    switch (twoStepMethod) {
      case "Authenticator":
        return resources.Label.Authenticator2sv;
      case "Email":
        return resources.Label.Email2sv;
      case "SecurityKey":
        return resources.Label.SecurityKey2sv;
      default:
        return "";
    }
  };

  const positiveButton: FooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.Save
    ),
    label: resources.Action.Save,
    enabled: !requestInFlight,
    action: handleNextSteps,
  };

  const negativeButton: FooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.Delete
    ),
    label: resources.Action.Delete,
    enabled: !requestInFlight,
    action: () => handleDelete(),
  };

  return (
    <div>
      {initializing ? (
        <Loading />
      ) : (
        <React.Fragment>
          <Modal.Header useBaseBootstrapComponent>
            <div />
            <span className="text-heading-small text-align-x-center padding-large">
              {resources.Heading.SaveTwoStepMethod}
            </span>
          </Modal.Header>
          <Modal.Body>
            <p className="text-center modal-margin-bottom">
              {resources.Description.KeepTwoStepMethodDynamic(
                getTwoStepMethodText(currentTwoStepMethod),
              )}
            </p>
            <p className="text-error xsmall">{deleteError?.message}</p>
          </Modal.Body>
          <Modal.Footer>
            <div className="modal-modern-footer-buttons">
              <button
                type="button"
                className="btn-growth-md modal-modern-footer-button"
                aria-label={positiveButton.label}
                onClick={positiveButton.action}
              >
                {positiveButton.content}
              </button>
              <button
                type="button"
                className="btn-control-md modal-modern-footer-button"
                aria-label={negativeButton.label}
                onClick={negativeButton.action}
              >
                {negativeButton.content}
              </button>
            </div>
          </Modal.Footer>
        </React.Fragment>
      )}
    </div>
  );
};

export default ModalSaveOrDeleteTwoStepMethod;
