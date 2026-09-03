import React, { Fragment } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loading, Modal } from "react-style-guide";
import { DeviceMeta } from "Roblox";
import { fido2Util, hybridResponseService } from "core-roblox-utilities";
import { Button } from "@rbx/foundation-ui";
import useAccountRecoveryContext from "../../hooks/useAccountRecoveryContext";
import { AccountRecoveryActionType } from "../../store/action";
import ModalState from "../../store/modalState";
import { FooterButtonConfig } from "../../../common/modalFooter";
import { isPasskeyCompatible } from "../../../common/compatibility";
import { PasswordDeletionSource } from "../../../../common/request/apis/auth";

const ModalAddNewPasskey: React.FC = () => {
  const {
    state: {
      modalStateAndProps,
      userIdToRecover,
      username,
      recoverySessionId,
      resources,
      requestService,
    },
    dispatch,
  } = useAccountRecoveryContext();

  const { data: passkeySupported = false, isLoading: loading } = useQuery({
    queryKey: ["passkeySupport"],
    queryFn: () =>
      isPasskeyCompatible({
        producer: DeviceMeta ?? undefined,
        hybridCallback: () =>
          hybridResponseService.getNativeResponse(
            hybridResponseService.FeatureTarget.CREDENTIALS_PROTOCOL_AVAILABLE,
            {},
            2000,
          ),
      }),
  });

  const handleNextSteps = () => {
    if (modalStateAndProps.modalState !== ModalState.ADD_NEW_PASSKEY) return;
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
    mutate: addPasskey,
    isPending: requestInFlight,
    error: requestError,
  } = useMutation(
    async () => {
      if (!userIdToRecover || !username || !recoverySessionId) {
        throw new Error(resources.Message.UnknownError);
      }

      const startResult = await requestService.authApi.startPreAuthPasskeyRegistration(username);
      if (startResult.isError) throw new Error(resources.Message.UnknownError);

      // Extract value after error check - TypeScript needs explicit narrowing
      const startRegistrationData = startResult.isError === false ? startResult.value : null;
      if (!startRegistrationData) throw new Error(resources.Message.UnknownError);

      const { creationOptions, sessionId } = startRegistrationData;

      const makeCredentialOptions = fido2Util.convertPublicKeyParametersToStandardBase64(
        JSON.stringify(creationOptions),
      );

      const credential = await navigator.credentials.create({
        publicKey: fido2Util.formatCredentialRequestWeb(JSON.stringify(makeCredentialOptions)),
      });
      if (credential === null) throw new Error(resources.Message.UnknownError);

      const formattedCredentialResponse = fido2Util.formatCredentialRegistrationResponseWeb(
        credential as PublicKeyCredential,
      );

      const finishResult = await requestService.authApi.finishARPreAuthPasskeyRegistration(
        recoverySessionId,
        userIdToRecover,
        sessionId,
        formattedCredentialResponse,
        true,
        PasswordDeletionSource.AccountRecoveryPasswordAndPasskey,
      );
      if (finishResult.isError) throw new Error(resources.Message.UnknownError);
    },
    { onSuccess: handleNextSteps, onError: error => console.error(error) },
  );

  if (modalStateAndProps.modalState !== ModalState.ADD_NEW_PASSKEY) {
    return <Fragment />;
  }

  const handleSkip = () => {
    handleNextSteps();
  };

  const positiveButton: FooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.AddAPasskey
    ),
    label: resources.Action.AddAPasskey,
    enabled: !requestInFlight,
    action: () => addPasskey(),
  };

  const negativeButton: FooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.SkipAddingPasskey
    ),
    label: resources.Action.SkipAddingPasskey,
    enabled: !requestInFlight,
    action: handleSkip,
  };

  const okButton: FooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.Ok
    ),
    label: resources.Action.Ok,
    enabled: !requestInFlight,
    action: handleSkip,
  };

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <React.Fragment>
          <Modal.Header useBaseBootstrapComponent>
            <div />
            <span className="text-heading-small text-align-x-center padding-large">
              {passkeySupported
                ? resources.Heading.EnhancedProtectionPostRecoveryPasskey
                : resources.Heading.EnhancedProtectionProgramPostRecoveryNoPasskey}
            </span>
          </Modal.Header>
          <Modal.Body>
            <p className="text-center modal-margin-bottom">
              {passkeySupported
                ? resources.Description.EnhancedProtectionAddPasskey("\n")
                : resources.Description.DeviceDoesNotSupportPasskey}
            </p>
            {requestError && <p className="text-error xsmall">{(requestError as Error).message}</p>}
          </Modal.Body>
          {passkeySupported ? (
            <Modal.Footer>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <Button
                  variant="Emphasis"
                  size="Medium"
                  aria-label={positiveButton.label}
                  isLoading={requestInFlight}
                  onClick={positiveButton.action}
                >
                  {positiveButton.content}
                </Button>
                <Button
                  variant="Standard"
                  size="Medium"
                  aria-label={negativeButton.label}
                  isLoading={requestInFlight}
                  onClick={negativeButton.action}
                >
                  {negativeButton.content}
                </Button>
              </div>
            </Modal.Footer>
          ) : (
            <Modal.Footer>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
                <Button
                  variant="Emphasis"
                  size="Medium"
                  aria-label={okButton.label}
                  isLoading={requestInFlight}
                  onClick={okButton.action}
                  style={{ width: "100%" }}
                >
                  {okButton.content}
                </Button>
              </div>
            </Modal.Footer>
          )}
        </React.Fragment>
      )}
    </div>
  );
};

export default ModalAddNewPasskey;
