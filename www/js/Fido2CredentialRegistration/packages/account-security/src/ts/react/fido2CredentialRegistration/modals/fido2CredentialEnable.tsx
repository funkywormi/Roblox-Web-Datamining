import React, { useEffect, useState } from "react";
import { hybridResponseService, fido2Util } from "core-roblox-utilities";
import { authenticatedUser } from "header-scripts";
import { DeviceMeta, AccountIntegrityChallengeService } from "Roblox";
import {
  ModalFragmentProps,
  Fido2CreateCredentialOutput,
  CredentialPurpose,
} from "../constants/types";
import useFido2CredentialRegistrationContext from "../hooks/useFido2CredentialRegistrationContext";
import ModalState from "../store/modalState";
import { Fido2CredentialRegistrationActionType } from "../store/action";
import { EVENT_CONSTANTS, NATIVE_RESPONSE_TIMEOUT_MILLISECONDS } from "../app.config";

const ModalFido2CredentialEnable: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: {
      translate,
      eventService,
      requestService,
      onGenericError,
      onDuplicateCreated,
      credentialPurpose,
      modalStateAndProps,
    },
    dispatch,
  } = useFido2CredentialRegistrationContext();

  const [creationOptionsReceived, setCreationOptionsReceived] = useState(false);

  const inApp = () => {
    return DeviceMeta && DeviceMeta().isInApp;
  };

  // eslint-disable-next-line consistent-return
  const getCreationOptions = async () => {
    // Since credentialPurpose is necessarily an enum, default case is not required.
    // eslint-disable-next-line default-case
    switch (credentialPurpose) {
      case CredentialPurpose.Login:
        return requestService.authApi.startPasskeyRegistration();
      case CredentialPurpose.TwoStepVerification:
        return requestService.twoStepVerification.enableSecurityKey(
          authenticatedUser.id!.toString(),
        );
    }
  };

  /*
   * Effects
   */

  useEffect(() => {
    const onCreateCredential = (
      fido2Credential: Fido2CreateCredentialOutput,
      sessionId: string,
    ) => {
      if (modalStateAndProps.modalState !== ModalState.FIDO_CREDENTIAL_ENABLE) {
        return;
      }
      if (fido2Credential.credential === null) {
        dispatch({
          type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
          modalState: ModalState.FIDO_CREDENTIAL_ERROR,
          additionalModalProps: null,
        });
      } else {
        dispatch({
          type: Fido2CredentialRegistrationActionType.SET_MODAL_STATE,
          modalState: ModalState.FIDO_CREDENTIAL_NAME,
          additionalModalProps: {
            credential: fido2Credential.credential,
            sessionId,
          },
        });
      }
    };

    const createCredential = async () => {
      if (modalStateAndProps.modalState !== ModalState.FIDO_CREDENTIAL_ENABLE) {
        return;
      }
      const fido2Credential: Fido2CreateCredentialOutput = {
        credential: null,
      };

      const enableFidoCredentialResult = await getCreationOptions();

      if (enableFidoCredentialResult.isError) {
        closeModal();
        const { Generic } = AccountIntegrityChallengeService;

        // Ignore challenge abandons for errors.
        if (!Generic.ChallengeError.matchAbandoned(enableFidoCredentialResult.errorRaw)) {
          onGenericError();
          eventService.sendPasskeyRegistrationErrorEvent(
            String(enableFidoCredentialResult.error ?? ""),
            EVENT_CONSTANTS.passkeyErrorSources.startStep,
          );
        }
        return;
      }

      // We don't want to show the modal before the request has been received successfully/user has reauth'ed if applicable.
      setCreationOptionsReceived(true);

      const shouldConvertToStandardBase64 = !(
        DeviceMeta &&
        DeviceMeta().isInApp &&
        DeviceMeta().isAndroidApp
      );

      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      const makeCredentialOptions = shouldConvertToStandardBase64
        ? fido2Util.convertPublicKeyParametersToStandardBase64(
            JSON.stringify(enableFidoCredentialResult.value.creationOptions),
          )
        : enableFidoCredentialResult.value.creationOptions;
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */

      try {
        if (inApp()) {
          // iOS API doesn't respect authenticatorAttachment. Set the key type here to be passed to the native layer.
          /* eslint-disable @typescript-eslint/no-unsafe-member-access */
          // eslint-disable-next-line default-case
          switch (credentialPurpose) {
            case CredentialPurpose.Login:
              makeCredentialOptions.keyType = "platform";
              break;
            case CredentialPurpose.TwoStepVerification:
              makeCredentialOptions.keyType = "hardware";
          }
          /* eslint-enable @typescript-eslint/no-unsafe-member-access */

          const credentialString = await hybridResponseService.getNativeResponse(
            hybridResponseService.FeatureTarget.REGISTER_CREDENTIALS,
            {
              creationOptionsJSON: JSON.stringify(makeCredentialOptions),
            },
            NATIVE_RESPONSE_TIMEOUT_MILLISECONDS,
          );

          if (credentialString !== null) {
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
            const credential = JSON.parse(credentialString);

            if (credential.errorCode !== undefined) {
              if (credential.errorCode === 11) {
                onDuplicateCreated();
                closeModal();
                return;
              }

              eventService.sendPasskeyRegistrationErrorEvent(
                String(credential.errorMsg ?? ""),
                EVENT_CONSTANTS.passkeyErrorSources.registerCredentialsErrorCode,
              );
            }
            // iOS resolves with an empty object (which gets decoded to an empty JS array [] due to Lua HTTPService behavior) on failure;
            // check for this case here. We should change native code to resolve with an error code/message like Android does in the future.
            else if (credential.id === undefined) {
              eventService.sendPasskeyRegistrationErrorEvent(
                "", // Self-explanatory error source.
                EVENT_CONSTANTS.passkeyErrorSources.registerCredentialsEmptyResponse,
              );
              // Check for error code from native CredentialsProtocol implementation.
            } else {
              // Temporary bug fix for certain Android devices that have the wrong type for clientExtensionResults
              if (DeviceMeta && DeviceMeta().isInApp && DeviceMeta().isAndroidApp) {
                delete credential.clientExtensionResults;
              }

              fido2Credential.credential = shouldConvertToStandardBase64
                ? fido2Util.formatCredentialRegistrationResponseApp(credentialString)
                : JSON.stringify(credential);
            }
          }
        } else {
          // Decode only if we're on web.
          const credential = await navigator.credentials.create({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            publicKey: fido2Util.formatCredentialRequestWeb(JSON.stringify(makeCredentialOptions)),
          });

          if (credential !== null) {
            fido2Credential.credential = fido2Util.formatCredentialRegistrationResponseWeb(
              credential as PublicKeyCredential,
            );
          } else {
            eventService.sendPasskeyRegistrationErrorEvent(
              "", // Self-explanatory error source.
              EVENT_CONSTANTS.passkeyErrorSources.registerCredentialsEmptyResponse,
            );
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        // For some reason the explicit any is required to get this to build.
        // Code 11 is for InvalidStateError, which should always result from a duplicate credential creation.
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-explicit-any
        if ((error as any)?.code === 11) {
          onDuplicateCreated();
          closeModal();
          return;
        }

        eventService.sendPasskeyRegistrationErrorEvent(
          String(error ?? ""),
          EVENT_CONSTANTS.passkeyErrorSources.registerCredentialsErrorCode,
        );
      }
      onCreateCredential(fido2Credential, enableFidoCredentialResult.value.sessionId);
    };

    // eslint-disable-next-line no-void
    void createCredential();
  }, []);

  // Do not render a modal for login flow.
  if (credentialPurpose === CredentialPurpose.Login) {
    return <React.Fragment />;
  }

  return (
    <React.Fragment>
      {creationOptionsReceived && (
        <div className="enable-fido-credential-modal">
          <div className="modal-header">
            <div className="modal-modern-header-button">
              <button type="button" className="close" onClick={closeModal}>
                <span aria-hidden="true">
                  <span className="icon-close" />
                </span>
                <span className="sr-only">{translate("Action.Dialog.Close")}</span>
              </button>
            </div>
            <div className="modal-title">
              <h4>
                <span>{translate("Heading.RegisterSecurityKey")}</span>
              </h4>
            </div>
          </div>

          <div className="fido-credential-container">
            <div className="fido-credential-symbol">
              <div className="fido-credential-usb-icon" />
            </div>
            <div className="fido-credential-text">{translate("Label.SecurityKey.PhysicalKey")}</div>
          </div>
          <div className="fido-credential-spinner">
            <div className="spinner-donut" />
          </div>
        </div>
      )}
    </React.Fragment>
  );
};
export default ModalFido2CredentialEnable;
