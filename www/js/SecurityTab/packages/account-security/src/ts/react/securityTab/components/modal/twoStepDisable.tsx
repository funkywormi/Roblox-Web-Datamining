import React, { useState } from "react";
import { fetchTranslations } from "roblox-badges";
import { CurrentUser, AccountIntegrityChallengeService } from "Roblox";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import * as TwoStepVerificationApiTypes from "../../../../common/request/types/twoStepVerification";
import { Result } from "../../../../common/result";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import { MediaType } from "../../../challenge/twoStepVerification";
import { mapTwoStepVerificationErrorToResource } from "../../constants/resources";
import { SecurityTabActionType } from "../../store/action";
import { getFilteredEnabledMediaTypes } from "../../utils/helperUtils";

const ModalTwoStepDisable: React.FC<ModalFragmentProps> = ({ closeModal }: ModalFragmentProps) => {
  const {
    state: {
      resources,
      requestService,
      modalStateAndProps,
      twoStepVerificationMetadata,
      enabledMediaTypes,
    },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Component State
   */

  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [checkboxState, setCheckboxState] = useState<boolean>(false);

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.TWO_STEP_DISABLE) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const checkboxClickHandler = () => {
    setCheckboxState(!checkboxState);
  };

  const showAdditionalWarning = () => {
    return (
      modalStateAndProps.additionalModalProps.mediaTypeToDisable === MediaType.Authenticator &&
      twoStepVerificationMetadata.receiveWarningsOnDisableTwoStep
    );
  };
  const disableTurnOffButton = () => {
    return showAdditionalWarning() && !checkboxState;
  };

  const disableTwoStepVerification = async (
    close?: () => void,
    setError?: (error: string | null) => void,
    setInFlight?: (inFlight: boolean) => void,
  ) => {
    setError?.(null);
    setInFlight?.(true);

    let disableResult: Result<void, TwoStepVerificationApiTypes.TwoStepVerificationError | null>;
    switch (modalStateAndProps.additionalModalProps.mediaTypeToDisable) {
      case MediaType.Authenticator:
        disableResult = await requestService.twoStepVerification.disableAuthenticator(
          authenticatedUser.id!.toString(),
        );
        break;

      case MediaType.Email:
        disableResult = await requestService.twoStepVerification.disableEmailTwoStepVerification(
          authenticatedUser.id!.toString(),
        );
        break;

      case MediaType.SMS:
        disableResult = await requestService.twoStepVerification.disableSmsTwoStepVerification(
          authenticatedUser.id!.toString(),
        );
        break;

      default:
        close?.();
        return;
    }

    if (disableResult.isError) {
      const { Generic } = AccountIntegrityChallengeService;
      // Ignore challenge abandons for errors.
      if (Generic.ChallengeError.matchAbandoned(disableResult.errorRaw)) {
        close?.();
      } else {
        setError?.(mapTwoStepVerificationErrorToResource(resources, disableResult.error));
        setInFlight?.(false);
      }
      return;
    }

    dispatch({
      type: SecurityTabActionType.DISABLE_MEDIA_TYPE,
      mediaType: modalStateAndProps.additionalModalProps.mediaTypeToDisable,
    });

    // Re-fetch user configuration to ensure enabledMediaTypes reflects the actual backend state
    // This is important because when isSingleMethodEnforcementEnabled is true, methods at lower
    // security levels may have been filtered out initially, but should be shown after disabling
    // higher-level methods (e.g., Email should appear after disabling Authenticator).
    const getUserConfigurationResult =
      await requestService.twoStepVerification.getUserConfiguration(
        authenticatedUser.id!.toString(),
      );
    if (!getUserConfigurationResult.isError) {
      const configuration = getUserConfigurationResult.value;
      const mediaTypes = getFilteredEnabledMediaTypes(
        configuration,
        twoStepVerificationMetadata.isSingleMethodEnforcementEnabled,
      );

      dispatch({
        type: SecurityTabActionType.INITIALIZE_TWO_STEP_VERIFICATION,
        metadata: twoStepVerificationMetadata,
        enabledMediaTypes: mediaTypes,
      });
    }

    close?.();
  };

  const userHasSecurityKeys =
    modalStateAndProps.additionalModalProps.mediaTypeToDisable === MediaType.Authenticator &&
    enabledMediaTypes.includes(MediaType.SecurityKey);
  const userAcknowledged = async () => {
    if (!userHasSecurityKeys) {
      await disableTwoStepVerification(closeModal, setRequestError, setRequestInFlight);
    } else {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.SECURITY_KEY_DELETED_WARNING,
        additionalModalProps: {
          title: resources.Response.Dialog.Warning,
          pendingActionFunction: disableTwoStepVerification,
        },
      });
    }
  };

  /*
   * Component Markup
   */

  const getDisableTwoStepWarningMessage = () => {
    let disableWarning = resources.Response.Dialog.TwoStepDisableWarning;
    if (enabledMediaTypes.length > 1) {
      if (modalStateAndProps.additionalModalProps.mediaTypeToDisable === MediaType.Email) {
        disableWarning = resources.Response.Dialog.TwoStepDisableWarningEmail;
      } else if (
        modalStateAndProps.additionalModalProps.mediaTypeToDisable === MediaType.Authenticator
      ) {
        disableWarning = resources.Response.Dialog.TwoStepDisableWarningAuthenticator;
      }
    }
    return disableWarning;
  };

  const showVerifiedBadgeTwoStepInfo = CurrentUser.hasVerifiedBadge || false;
  const verifiedBadgeTwoStepChangeWarning =
    fetchTranslations().translatedVerifiedBadgeTwoSVChangeText;

  return (
    <div className="update-two-step">
      <div className="modal-header">
        <div className="modal-modern-header-button">
          {!showAdditionalWarning() && (
            <button type="button" className="close" onClick={closeModal}>
              <span aria-hidden="true">
                <span className="icon-close" />
              </span>
              <span className="sr-only">{resources.Action.Dialog.Close}</span>
            </button>
          )}
        </div>
        <div className="modal-title">
          <h2>{resources.Response.Dialog.Warning}</h2>
        </div>
      </div>
      <Modal.Body>
        <div className="text-center">
          {showVerifiedBadgeTwoStepInfo && <div>{verifiedBadgeTwoStepChangeWarning}</div>}
          {!showVerifiedBadgeTwoStepInfo && !showAdditionalWarning() && (
            <div>{getDisableTwoStepWarningMessage()}</div>
          )}
          {!showVerifiedBadgeTwoStepInfo && showAdditionalWarning() && (
            <div>{resources.Response.Dialog.TwoStepDisableAdditionalWarningAuthenticator}</div>
          )}
          {requestError && <div className="two-step-modal-error text-error">{requestError} </div>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        {showAdditionalWarning() && (
          <div className="modal-modern-footer-buttons center-buttons">
            <div className="user-acknowledge-checkbox">
              <input
                id="acknowledgement"
                className="larger"
                type="checkbox"
                onClick={checkboxClickHandler}
              />
              <label htmlFor="acknowledgement">
                {resources.Label.DisableAuthenticator.Acknowledge}
              </label>
            </div>
          </div>
        )}
        <div className="modal-modern-footer-buttons center-buttons">
          <button
            className="btn-primary-md"
            type="button"
            onClick={userAcknowledged}
            disabled={requestInFlight || disableTurnOffButton()}
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
export default ModalTwoStepDisable;
