import React, { useEffect } from "react";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import useRecoveryActions from "../hooks/useRecoveryActions";
import ComponentState from "../store/componentState";
import ResetPassword from "./resetPassword";
import RecoveryPasskeyOrPassword from "./recoveryPasskeyOrPassword";
import RecoveryChoicePage from "./recoveryChoicePage";

/**
 * Routes to the appropriate recovery UI based on experiment flags and prior
 * navigation context (e.g. whether the user came from the choice page).
 */
const RecoveryRouter: React.FC = () => {
  const { shouldShowPasskeyFirst, shouldShowChoicePage, eventService } = useRecoveryActions();

  useEffect(() => {
    eventService.sendRecoveryPageReachedEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const {
    state: { componentStateAndProps },
  } = useAccountRecoveryContext();

  const cameFromChoicePage =
    componentStateAndProps.componentState === ComponentState.RESET_PASSWORD &&
    componentStateAndProps.additionalComponentProps?.cameFromChoicePage === true;

  if (shouldShowChoicePage && !cameFromChoicePage) {
    return <RecoveryChoicePage />;
  }

  if (cameFromChoicePage) {
    return <RecoveryPasskeyOrPassword layout="password-first" />;
  }

  if (shouldShowPasskeyFirst) {
    return <RecoveryPasskeyOrPassword />;
  }

  return <ResetPassword />;
};

export default RecoveryRouter;
