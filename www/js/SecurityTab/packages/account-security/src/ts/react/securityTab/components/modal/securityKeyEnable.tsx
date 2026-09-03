import React, { useEffect } from "react";
import { fido2Util, hybridResponseService } from "core-roblox-utilities";
import { DeviceMeta } from "Roblox";
import { ModalFragmentProps, SecurityKeyCreateCredentialOutput } from "../../constants/types";
import useSecurityTabContext from "../../hooks/useSecurityTabContext";
import ModalState from "../../store/modalState";
import { SecurityTabActionType } from "../../store/action";
import { NATIVE_RESPONSE_TIMEOUT_MILISECONDS } from "../../app.config";

const ModalSecurityKeyEnable: React.FC<ModalFragmentProps> = ({
  closeModal,
}: ModalFragmentProps) => {
  const {
    state: { resources, modalStateAndProps },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Effects
   */

  useEffect(() => {
    const onCreateCredential = (securityKeyCredential: SecurityKeyCreateCredentialOutput) => {
      if (modalStateAndProps.modalState !== ModalState.SECURITY_KEY_ENABLE) {
        return;
      }
      if (securityKeyCredential.credential === null) {
        dispatch({
          type: SecurityTabActionType.SET_MODAL_STATE,
          modalState: ModalState.SECURITY_KEY_ERROR,
          additionalModalProps: null,
        });
      } else {
        dispatch({
          type: SecurityTabActionType.SET_MODAL_STATE,
          modalState: ModalState.SECURITY_KEY_NAME,
          additionalModalProps: {
            sessionId: modalStateAndProps.additionalModalProps.sessionId,
            credential: securityKeyCredential.credential,
            registerSecurityKeyFunction:
              modalStateAndProps.additionalModalProps.registerSecurityKeyFunction,
          },
        });
      }
    };
    const createCredential = async () => {
      if (modalStateAndProps.modalState !== ModalState.SECURITY_KEY_ENABLE) {
        return;
      }
      const securityKeyCredential: SecurityKeyCreateCredentialOutput = {
        credential: null,
      };

      const shouldConvertToStandardBase64 = !(
        DeviceMeta &&
        DeviceMeta().isInApp &&
        DeviceMeta().isAndroidApp
      );
      // Make a deep copy because we don't want to alter parameters passed to native layer

      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      const makeCredentialOptions = shouldConvertToStandardBase64
        ? fido2Util.convertPublicKeyParametersToStandardBase64(
            JSON.stringify(modalStateAndProps.additionalModalProps.creationOptions),
          )
        : modalStateAndProps.additionalModalProps.creationOptions;
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */

      // Android does not support discouraged resident keys.
      /* eslint-disable @typescript-eslint/no-unsafe-member-access */
      if (
        DeviceMeta().isAndroidApp &&
        makeCredentialOptions.publicKey.authenticatorSelection &&
        makeCredentialOptions.publicKey.authenticatorSelection.residentKey === "discouraged"
      ) {
        makeCredentialOptions.publicKey.authenticatorSelection.residentKey = "preferred";
      }
      /* eslint-enable @typescript-eslint/no-unsafe-member-access */

      try {
        if (modalStateAndProps.additionalModalProps.isInApp) {
          const credentialString = await hybridResponseService.getNativeResponse(
            hybridResponseService.FeatureTarget.REGISTER_CREDENTIALS,
            {
              creationOptionsJSON: JSON.stringify(makeCredentialOptions),
            },
            NATIVE_RESPONSE_TIMEOUT_MILISECONDS,
          );

          if (credentialString !== null) {
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
            const credential = JSON.parse(credentialString);
            // check for error here
            if (credential.errorCode === undefined) {
              securityKeyCredential.credential = shouldConvertToStandardBase64
                ? fido2Util.formatCredentialRegistrationResponseApp(credentialString)
                : credentialString;
            }
          }
        } else {
          // Decode only if we're on web.
          const credential = await navigator.credentials.create({
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
            publicKey: fido2Util.formatCredentialRequestWeb(JSON.stringify(makeCredentialOptions)),
          });

          if (credential !== null) {
            securityKeyCredential.credential = fido2Util.formatCredentialRegistrationResponseWeb(
              credential as PublicKeyCredential,
            );
          }
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      } finally {
        onCreateCredential(securityKeyCredential);
      }
    };

    // eslint-disable-next-line no-void
    void createCredential();
  }, []);

  /*
   * Component Markup
   */

  return (
    <div className="enable-security-key-modal">
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
            <span>{resources.Heading.RegisterSecurityKey}</span>
          </h5>
        </div>
      </div>

      <div className="security-key-container">
        <div className="security-key-symbol">
          <div className="security-key-usb-icon" />
        </div>
        <div className="security-key-text">{resources.Label.SecurityKey.PhysicalKey}</div>
      </div>
      <div className="security-key-spinner">
        <div className="spinner-donut" />
      </div>
    </div>
  );
};
export default ModalSecurityKeyEnable;
