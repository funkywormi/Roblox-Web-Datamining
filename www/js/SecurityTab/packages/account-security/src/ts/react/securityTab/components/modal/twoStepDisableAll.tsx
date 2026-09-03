import React, { useState } from "react";
import { AccountIntegrityChallengeService } from "Roblox";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { Result } from "../../../../common/result";
import * as TwoStepVerificationApiTypes from "../../../../common/request/types/twoStepVerification";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import useGenericErrorModal from "../../hooks/useGenericErrorModal";
import ModalState from "../../store/modalState";
import { MediaType } from "../../../challenge/twoStepVerification";
import { mapTwoStepVerificationErrorToResource } from "../../constants/resources";
import { SecurityTabActionType } from "../../store/action";

type DisableAction = (
  userId: string,
) => Promise<Result<void, TwoStepVerificationApiTypes.TwoStepVerificationError | null>>;

const ModalTwoStepDisableAll: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, requestService, modalStateAndProps },
    dispatch,
  } = useSecurityTabContext();

  const { showGenericErrorModal } = useGenericErrorModal();

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.TWO_STEP_DISABLE_ALL) {
    return <React.Fragment />;
  }

  const { enabledMethods } = modalStateAndProps.additionalModalProps;

  type DisableResult = {
    success: boolean;
    method: MediaType;
    error?: string;
    shouldClose?: boolean;
  };

  const disableAllTwoStepVerification = async () => {
    setRequestError(null);
    setRequestInFlight(true);

    const authenticatedUserId = authenticatedUser.id?.toString() ?? "";

    // No security key mapping since we handle disable through authenticator
    const disableActionsMap: { [key in MediaType]?: DisableAction } = {
      [MediaType.Authenticator]: (userId: string) =>
        requestService.twoStepVerification.disableAuthenticator(userId),
      [MediaType.Email]: (userId: string) =>
        requestService.twoStepVerification.disableEmailTwoStepVerification(userId),
      [MediaType.SMS]: (userId: string) =>
        requestService.twoStepVerification.disableSmsTwoStepVerification(userId),
    };

    const disableMethod = async (method: MediaType): Promise<DisableResult> => {
      const disableAction = disableActionsMap[method];

      // mock success for media types not in the map since they don't have a disable action
      // (i.e. security key is disabled through authenticator, none doesn't need it)
      if (!disableAction) {
        return { success: true, method };
      }
      const disableResult = await disableAction(authenticatedUserId);

      if (disableResult.isError) {
        const { Generic } = AccountIntegrityChallengeService;
        if (Generic.ChallengeError.matchAbandoned(disableResult.errorRaw)) {
          closeModal();
          return { success: false, method, shouldClose: true };
        }
        showGenericErrorModal();
        return {
          success: false,
          method,
          error: mapTwoStepVerificationErrorToResource(resources, disableResult.error),
        };
      }

      return { success: true, method };
    };

    const validMethods = enabledMethods.filter(method => method !== MediaType.SecurityKey);
    const results = await Promise.all(validMethods.map(method => disableMethod(method)));

    const shouldClose = results.some(result => result.shouldClose);
    if (shouldClose) {
      return;
    }

    const hasError = results.some(result => !result.success);
    const firstError = results.find(result => !result.success && result.error);

    if (firstError?.error) {
      setRequestError(firstError.error);
    }

    // Dispatch disable actions for successful disables
    results
      .filter(result => result.success)
      .forEach(result => {
        dispatch({
          type: SecurityTabActionType.DISABLE_MEDIA_TYPE,
          mediaType: result.method,
        });
      });

    setRequestInFlight(false);
    if (!hasError) {
      closeModal();
    }
  };

  return (
    <div className="modal-modern">
      <div className="modal-header">
        <div className="modal-modern-header-button">
          <button type="button" className="close" onClick={closeModal}>
            <span aria-hidden="true">
              <span className="icon-close" />
            </span>
            <span className="sr-only">{resources.Action.Dialog.Close}</span>
          </button>
        </div>
        <div className="modal-title">
          <h5>
            <span>{resources.Response.Dialog.Warning}</span>
          </h5>
        </div>
      </div>
      <Modal.Body>
        <div className="text-center">
          <p>{resources.Response.Dialog.TwoStepDisableWarning}</p>
          {requestError && <div className="two-step-modal-error text-error">{requestError}</div>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="modal-modern-footer-buttons center-buttons">
          <button
            className="btn-primary-md"
            type="button"
            onClick={disableAllTwoStepVerification}
            disabled={requestInFlight}
          >
            {resources.Label.Dialog.Confirm}
          </button>
          <button className="btn-secondary-md" type="button" onClick={closeModal}>
            {resources.Label.Cancel}
          </button>
        </div>
      </Modal.Footer>
    </div>
  );
};

export default ModalTwoStepDisableAll;
