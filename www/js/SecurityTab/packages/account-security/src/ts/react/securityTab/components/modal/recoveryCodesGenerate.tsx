import React, { useEffect, useState } from "react";
import { Modal } from "react-style-guide";
import { authenticatedUser } from "header-scripts";
import { AccountIntegrityChallengeService } from "Roblox";
import { ModalFragmentProps } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import { SecurityTabActionType } from "../../store/action";
import { mapTwoStepVerificationErrorToResource } from "../../constants/resources";
import { FooterButtonConfig, FragmentModalFooter } from "../../../common/modalFooter";

const ModalRecoveryCodesGenerate: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, requestService, modalStateAndProps, recoveryCodeStatus },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Component State
   */

  const [inLoadingState, setInLoadingState] = useState<boolean>(true);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  /*
   * Effects
   */

  useEffect(() => {
    const initializeModal = async () => {
      if (modalStateAndProps.modalState !== ModalState.RECOVERY_CODES_GENERATE) {
        return;
      }

      const getRecoveryCodesStatusResult =
        await requestService.twoStepVerification.getRecoveryCodesStatus(
          authenticatedUser.id!.toString(),
        );
      if (getRecoveryCodesStatusResult.isError) {
        dispatch({
          type: SecurityTabActionType.SET_MODAL_STATE,
          modalState: ModalState.GENERIC_TEXT_ERROR,
          additionalModalProps: {
            title: resources.Heading.Dialog.DefaultError,
            body: mapTwoStepVerificationErrorToResource(
              resources,
              getRecoveryCodesStatusResult.error,
            ),
            button: resources.Action.Dialog.Success,
          },
        });
        return;
      }
      dispatch({
        type: SecurityTabActionType.SET_RECOVERY_CODE_STATUS,
        recoveryCodeStatus: getRecoveryCodesStatusResult.value,
      });

      if (getRecoveryCodesStatusResult.value.activeCount === 0) {
        const generateRecoveryCodesResult =
          await requestService.twoStepVerification.generateRecoveryCodes(
            authenticatedUser.id!.toString(),
          );
        if (generateRecoveryCodesResult.isError) {
          const { Generic } = AccountIntegrityChallengeService;
          if (
            Generic.ChallengeError &&
            Generic.ChallengeError.matchAbandoned(generateRecoveryCodesResult.errorRaw)
          ) {
            setInLoadingState(false);
            return;
          }
          dispatch({
            type: SecurityTabActionType.SET_MODAL_STATE,
            modalState: ModalState.GENERIC_TEXT_ERROR,
            additionalModalProps: {
              title: resources.Heading.Dialog.DefaultError,
              body: mapTwoStepVerificationErrorToResource(
                resources,
                generateRecoveryCodesResult.error,
              ),
              button: resources.Action.Dialog.Success,
            },
          });
          return;
        }
        dispatch({
          type: SecurityTabActionType.SET_MODAL_STATE,
          modalState: ModalState.RECOVERY_CODES_DISPLAY,
          additionalModalProps: {
            recoveryCodes: generateRecoveryCodesResult.value.recoveryCodes,
          },
        });
        return;
      }
      setInLoadingState(false);
    };

    // eslint-disable-next-line no-void
    void initializeModal();
  }, []);

  // This case should never happen.
  if (modalStateAndProps.modalState !== ModalState.RECOVERY_CODES_GENERATE) {
    return <React.Fragment />;
  }

  /*
   * Event Handlers
   */

  const generateRecoveryCodes = async () => {
    setRequestError(null);
    setRequestInFlight(true);

    const generateRecoveryCodesResult =
      await requestService.twoStepVerification.generateRecoveryCodes(
        authenticatedUser.id!.toString(),
      );
    if (generateRecoveryCodesResult.isError) {
      const { Generic } = AccountIntegrityChallengeService;
      if (Generic.ChallengeError.matchAbandoned(generateRecoveryCodesResult.errorRaw)) {
        setRequestInFlight(false);
        return;
      }
      setRequestError(
        mapTwoStepVerificationErrorToResource(resources, generateRecoveryCodesResult.error),
      );
      setRequestInFlight(false);
      return;
    }
    dispatch({
      type: SecurityTabActionType.SET_MODAL_STATE,
      modalState: ModalState.RECOVERY_CODES_DISPLAY,
      additionalModalProps: {
        recoveryCodes: generateRecoveryCodesResult.value.recoveryCodes,
      },
    });
  };

  const positiveButton: FooterButtonConfig = {
    content: requestInFlight ? (
      <div className="spinner spinner-sm spinner-no-margin spinner-block" />
    ) : (
      resources.Action.Dialog.Continue
    ),
    label: resources.Action.Dialog.Continue,
    enabled: !requestInFlight,
    action: generateRecoveryCodes,
  };

  /*
   * Component Markup
   */

  return (
    <div className="recovery-codes-modal">
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
            <span>{resources.Heading.GenerateNewRecoveryCodes}</span>
          </h5>
        </div>
      </div>

      <Modal.Body>
        {inLoadingState && <div className="spinner spinner-default modal-margin-bottom-large" />}
        {!inLoadingState && recoveryCodeStatus.activeCount > 0 && (
          <div>
            <div className="body-text text-description">
              {resources.Label.Dialog.GenerateNewRecoveryCodesClearNotice(
                recoveryCodeStatus.activeCount,
              )}
            </div>
            <br />
            {requestError && <div className=" text-center text-error">{requestError} </div>}
          </div>
        )}
      </Modal.Body>

      {!inLoadingState && (
        <FragmentModalFooter positiveButton={positiveButton} negativeButton={null} />
      )}
    </div>
  );
};
export default ModalRecoveryCodesGenerate;
