import React, { useState } from "react";
import ModernCardHeader from "../../common/modernCardComponent/modernCardHeader";
import {
  CardFooterButtonConfig,
  ModernCardFooter,
} from "../../common/modernCardComponent/modernCardFooter";
import ModernCardBody from "../../common/modernCardComponent/modernCardBody";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import {
  handleContinueRecovery,
  handlePasswordResetSuccess,
  handleUpdatePassword,
  ProfileSection,
} from "../commonHelpers";
import ComponentState from "../store/componentState";
import { AccountRecoveryActionType } from "../store/action";
import {
  ContinueRecoveryReturnType,
  RecoveryState,
} from "../../../common/request/types/accountRecovery";

const ContinueFallback: React.FC = () => {
  const {
    state: {
      resources,
      requestService,
      eventService,
      componentStateAndProps,
      userIdToRecover,
      username,
      combinedName,
      recoverySessionId,
      recover2sv,
      recoverPassword,
    },
    dispatch,
  } = useAccountRecoveryContext();

  // This case should never happen.
  if (
    componentStateAndProps.componentState !== ComponentState.CONTINUE_FALLBACK ||
    !userIdToRecover
  ) {
    return <React.Fragment />;
  }

  /*
   * Component State
   */
  const [requestInFlight, setRequestInFlight] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const contactMethodNumber =
    componentStateAndProps.additionalComponentProps.contactMethodNumber ?? 0;

  /*
   * Event Handlers
   */

  const handleContinueRecoveryResult = async (
    continueRecoveryResult: ContinueRecoveryReturnType,
    handleError: (error: string) => void,
  ) => {
    switch (continueRecoveryResult.recoveryState) {
      case RecoveryState.AccountVerified:
        // If user is in verified state for 2SV recovery after only
        // verifying one contact method, they must be on creation ip.
        if (contactMethodNumber === 0 && recover2sv) {
          dispatch({
            type: AccountRecoveryActionType.SET_COMPONENT_STATE,
            recoverySessionState: RecoveryState.AccountVerified,
            componentState: ComponentState.ACCOUNT_VERIFIED_CONFIRMATION,
            additionalComponentProps: null,
          });
          return;
        }
        // If only recovering 2SV, skip navigation to choose account/reset password screen.
        if (recover2sv && !recoverPassword) {
          await handleUpdatePassword({
            requestService,
            resources,
            dispatch,
            eventService,
            recoverySessionId,
            userIdToRecover: userIdToRecover ?? 0,
            password: "",
            confirmPassword: "",
            onError: handleError,
            onPasswordResetSuccess: handlePasswordResetSuccess,
          });
          return;
        }
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.AccountVerified,
          componentState: ComponentState.DISAMBIGUATION_PAGE,
          additionalComponentProps: null,
        });
        break;
      case RecoveryState.AwaitingReevaluation:
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.AwaitingReevaluation,
          componentState: ComponentState.CANNOT_RECOVER_ACCOUNT,
          additionalComponentProps: null,
        });
        break;
      case RecoveryState.ContactMethodVerificationRequired:
        dispatch({
          type: AccountRecoveryActionType.SET_COMPONENT_STATE,
          recoverySessionState: RecoveryState.ContactMethodVerificationRequired,
          componentState: ComponentState.SEND_CODE,
          additionalComponentProps: {
            phonePrefixIndexAutoFill: null,
            contactMethodAutoFill: "",
            contactMethodNumber: 1,
            previousRecoveryMethod: continueRecoveryResult.previousRecoveryMethod ?? "",
            previousRecoveryMethodTypes: continueRecoveryResult.previousRecoveryMethodTypes ?? [],
            nextRecoveryMethodTypes: continueRecoveryResult.nextRecoveryMethodTypes ?? [],
          },
        });
        break;
      case RecoveryState.AccountIdentifierRequired:
      case RecoveryState.AwaitingContactMethodVerification:
      case RecoveryState.Invalid:
      default:
        handleError(resources.Message.UnknownError);
        break;
    }
  };

  const continueRecovery = async () => {
    setRequestInFlight(true);
    setRequestError(null);
    await handleContinueRecovery({
      requestService,
      resources,
      recoverySessionId,
      userId: userIdToRecover,
      onSuccess: (continueRecoveryResult: ContinueRecoveryReturnType) => {
        // eslint-disable-next-line no-void
        void handleContinueRecoveryResult(continueRecoveryResult, () => {
          setRequestError(resources.Message.UnknownError);
          setRequestInFlight(false);
        });
      },
      onError: error => {
        setRequestError(error ?? resources.Message.UnknownError);
        setRequestInFlight(false);
      },
      on2svAbandoned: () => {
        setRequestInFlight(false);
      },
    });
  };

  /*
   * Component Markup
   */

  const bodyText = componentStateAndProps.additionalComponentProps.didAbandon2sv
    ? resources.Description.VerifyAgain
    : resources.Description.SomethingWentWrongVerifyAgain;
  const continueButton: CardFooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.Continue
    ),
    label: resources.Action.Continue,
    enabled: !requestInFlight,
    action: continueRecovery,
  };

  return (
    <React.Fragment>
      <ModernCardHeader headerText={resources.Heading.RobloxAccountRecovery} />
      <ModernCardBody>
        <ProfileSection
          userId={userIdToRecover ?? 0}
          combinedName={combinedName ?? ""}
          username={username ?? ""}
        />
        <p className="padding-bottom-large">{bodyText}</p>
      </ModernCardBody>
      <ModernCardFooter positiveButton={continueButton} negativeButton={null}>
        {requestError && <p className="text-error xsmall">{requestError}</p>}
      </ModernCardFooter>
    </React.Fragment>
  );
};

export default ContinueFallback;
