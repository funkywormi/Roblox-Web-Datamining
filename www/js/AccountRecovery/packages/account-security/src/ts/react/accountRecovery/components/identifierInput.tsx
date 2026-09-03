import React, { useState } from "react";
import {
  ContactMethodType,
  RecoveryState,
  RequestedRecoveryType,
} from "../../../common/request/types/accountRecovery";
import ModernCardHeader from "../../common/modernCardComponent/modernCardHeader";
import {
  CardFooterButtonConfig,
  ModernCardFooter,
} from "../../common/modernCardComponent/modernCardFooter";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import { validateTrue } from "../../common/inputControl";
import ModernCardBody from "../../common/modernCardComponent/modernCardBody";
import VariableInputControl from "../../common/variableInputControl";
import { handleRequestRecovery } from "../commonHelpers";
import { AccountRecoveryActionType } from "../store/action";
import ComponentState from "../store/componentState";
import { mapAccountRecoveryErrorToResource } from "../constants/resources";

const IdentifierInput: React.FC = () => {
  const {
    state: {
      eventService,
      requestService,
      phonePrefixList,
      recoverySessionId,
      resources,
      recover2sv,
      recoverPassword,
    },
    dispatch,
  } = useAccountRecoveryContext();

  /*
   * Component State
   */
  const [identifier, setIdentifier] = useState("");
  const [phonePrefixIndex, setPhonePrefixIndex] = useState<number | null>(null);

  const [requestInFlight, setRequestInFlight] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  /*
   * Event Handlers
   */

  const clearRequestError = () => setRequestError(null);
  const requestRecovery = async () => {
    setRequestInFlight(true);
    clearRequestError();
    const requestedRecoveryTypes: RequestedRecoveryType[] = [];
    if (recover2sv) {
      requestedRecoveryTypes.push("twostepverification");
    }
    if (recoverPassword) {
      requestedRecoveryTypes.push("password");
    }
    const requestRecoveryResult = await handleRequestRecovery(
      identifier,
      phonePrefixList,
      phonePrefixIndex,
      requestedRecoveryTypes,
      recoverPassword,
      recover2sv,
      recoverySessionId,
      requestService,
      resources,
      dispatch,
      (error: string) => {
        setRequestInFlight(false);
        setRequestError(error);
      },
    );
    if (requestRecoveryResult === null) {
      eventService.sendIdentifierSentEvent("", "", "");
      return;
    }
    switch (requestRecoveryResult.recoveryState) {
      case RecoveryState.ContactMethodVerificationRequired:
        if (requestRecoveryResult.processedIdentifier.identifierType !== "username") {
          // Send code immediately if they entered a phone or email.
          const sendCodeResult = await requestService.accountRecoveryApi.sendCode(
            requestRecoveryResult.processedIdentifier.parsedIdentifier,
            requestRecoveryResult.processedIdentifier.contactMethodType,
            requestRecoveryResult.recoverySessionId,
          );
          if (sendCodeResult.isError) {
            setRequestInFlight(false);
            setRequestError(mapAccountRecoveryErrorToResource(resources, sendCodeResult.error));
            return;
          }
          eventService.sendIdentifierSentEvent(
            requestRecoveryResult.recoverySessionId,
            requestRecoveryResult.processedIdentifier.identifierType,
            "resendOrVerifyCode",
          );
          dispatch({
            type: AccountRecoveryActionType.SET_COMPONENT_STATE,
            recoverySessionState: RecoveryState.AwaitingContactMethodVerification,
            componentState: ComponentState.RESEND_OR_VERIFY_CODE,
            additionalComponentProps: {
              contactMethodType: requestRecoveryResult.processedIdentifier.contactMethodType,
              contactMethodToDisplay:
                requestRecoveryResult.processedIdentifier.contactMethodType ===
                ContactMethodType.Phone
                  ? requestRecoveryResult.processedIdentifier.phoneNumber.formatInternational()
                  : requestRecoveryResult.processedIdentifier.parsedIdentifier,
            },
          });
          return;
        }
        eventService.sendIdentifierSentEvent(
          requestRecoveryResult.recoverySessionId,
          requestRecoveryResult.processedIdentifier.identifierType,
          "sendCode",
        );
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: requestRecoveryResult.recoveryState,
          componentState: ComponentState.SEND_CODE,
          additionalComponentProps: {
            phonePrefixIndexAutoFill: phonePrefixIndex,
            contactMethodAutoFill: "",
          },
        });
        break;
      case RecoveryState.AccountVerified:
        eventService.sendIdentifierSentEvent(
          requestRecoveryResult.recoverySessionId,
          requestRecoveryResult.processedIdentifier.identifierType,
          "accountVerifiedConfirmation",
        );
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: requestRecoveryResult.recoveryState,
          componentState: ComponentState.ACCOUNT_VERIFIED_CONFIRMATION,
          additionalComponentProps: null,
        });
        break;

      default:
        eventService.sendIdentifierSentEvent("", "", "");
        setRequestInFlight(false);
        setRequestError(resources.Message.UnknownError);
        break;
    }
  };

  /*
   * Component Markup
   */
  const positiveButton: CardFooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.Next
    ),
    label: resources.Action.Next,
    enabled: !requestInFlight && identifier.length > 2,
    action: requestRecovery,
  };

  return (
    <React.Fragment>
      <ModernCardHeader headerText={resources.Heading.RobloxAccountRecovery} />
      <ModernCardBody>
        <VariableInputControl
          id="inputIdentifier"
          label={resources.Label.UsernameEmailPhone}
          inputType="text"
          autoComplete="off"
          placeholder={resources.Label.EnterYourUsernameEmailPhone}
          disabled={requestInFlight}
          value={identifier}
          setValue={setIdentifier}
          canSubmit={identifier.length > 2 && !requestInFlight}
          error={requestError}
          setError={setRequestError}
          validate={validateTrue}
          handleSubmit={requestRecovery}
          hideFeedback
          phoneSelectorEnabled
          phonePrefixIndex={phonePrefixIndex}
          setPhonePrefixIndex={setPhonePrefixIndex}
          phonePrefixList={phonePrefixList}
          onChange={clearRequestError}
        />
      </ModernCardBody>
      <ModernCardFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default IdentifierInput;
