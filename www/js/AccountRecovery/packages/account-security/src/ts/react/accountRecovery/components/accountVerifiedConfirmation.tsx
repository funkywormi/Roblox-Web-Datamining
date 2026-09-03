import React, { useState } from "react";
import ModernCardHeader from "../../common/modernCardComponent/modernCardHeader";
import ModernCardBody from "../../common/modernCardComponent/modernCardBody";
import {
  CardFooterButtonConfig,
  ModernCardFooter,
} from "../../common/modernCardComponent/modernCardFooter";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import {
  formatUsername,
  handlePasswordResetSuccess,
  handleUpdatePassword,
  ProfileSection,
} from "../commonHelpers";
import { AccountRecoveryActionType } from "../store/action";
import { RecoveryState } from "../../../common/request/types/accountRecovery";
import ComponentState from "../store/componentState";

const AccountVerifiedConfirmation: React.FC = () => {
  const {
    state: {
      requestService,
      eventService,
      recoverySessionId,
      userIdToRecover,
      username,
      combinedName,
      resources,
      recover2sv,
      recoverPassword,
    },
    dispatch,
  } = useAccountRecoveryContext();

  const [requestInFlight, setRequestInFlight] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  const formattedUsername = formatUsername(username ?? "");
  const bodyText =
    recover2sv && recoverPassword
      ? resources.Description.TrustedLocationResetPasswordSkip2SV(formattedUsername)
      : recover2sv
        ? resources.Description.TrustedLocationSkip2SV(formattedUsername)
        : resources.Description.TrustedLocationResetPassword(formattedUsername);

  const buttonText = recover2sv ? resources.Action.Continue : resources.Action.ResetPassword;

  const positiveButton: CardFooterButtonConfig = {
    content: requestInFlight ? <span className="spin spinner-xs spinner-no-margin" /> : buttonText,
    label: buttonText,
    enabled: !requestInFlight,
    action: async () => {
      setRequestInFlight(true);
      setRequestError(null);
      // If only recovering 2SV, skip navigation to choose account/reset password screen.
      if (recover2sv && !recoverPassword) {
        const onError = (error: string) => {
          setRequestInFlight(false);
          setRequestError(error);
        };
        await handleUpdatePassword({
          requestService,
          resources,
          dispatch,
          eventService,
          recoverySessionId,
          userIdToRecover: userIdToRecover ?? 0,
          password: "",
          confirmPassword: "",
          onError,
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
    },
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
        {requestError && <p className="text-error xsmall">{requestError}</p>}
      </ModernCardBody>
      <ModernCardFooter positiveButton={positiveButton} negativeButton={null} />
    </React.Fragment>
  );
};

export default AccountVerifiedConfirmation;
