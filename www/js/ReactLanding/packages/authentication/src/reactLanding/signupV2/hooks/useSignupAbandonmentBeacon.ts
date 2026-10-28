import { useCallback, useEffect, useRef } from "react";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { sendSignupAbandonmentEvent } from "../../services/eventService";
import useSignUpContainerV2State, {
  SignUpV2Operation,
  SignUpV2Step,
} from "../state/signUpContainerV2State";
import {
  authStage,
  AuthFlowTelemetry,
  AuthStage,
} from "../../../shared/telemetry/authFlowTelemetry";

const getAbandonmentState = (step: SignUpV2Step, operation: SignUpV2Operation): string => {
  const { abandoned } = EVENT_CONSTANTS.state.signUpV2;
  if (operation === SignUpV2Operation.CreatingPasskey) {
    return abandoned.awaitingCeremony;
  }
  if (step === SignUpV2Step.AddAuthMethod) {
    return abandoned.awaitingChoice;
  }
  return abandoned.formIncomplete;
};

const getAbandonmentStage = (step: SignUpV2Step, operation: SignUpV2Operation): AuthStage => {
  if (operation === SignUpV2Operation.CreatingPasskey) {
    return authStage.awaitingCeremony;
  }
  if (step === SignUpV2Step.AddAuthMethod) {
    return authStage.awaitingChoice;
  }
  return authStage.formIncomplete;
};

export type SignupAbandonmentStep = { state: string; stage: AuthStage };

const getSignUpV2AbandonmentStep = (): SignupAbandonmentStep => {
  const { step, operation } = useSignUpContainerV2State.getState();
  return {
    state: getAbandonmentState(step, operation),
    stage: getAbandonmentStage(step, operation),
  };
};

export type SignupAbandonmentBeaconOptions = {
  isEnabled?: boolean;
  /** Read when the beacon fires. Defaults to the Signup V2 step and operation. */
  getAbandonmentStep?: () => SignupAbandonmentStep;
};

/**
 * Reports that the signup page was left before signup completed.
 *
 * `visibilitychange` covers backgrounding, so a tab switch also counts and
 * sessions that later succeed must be excluded when counting true abandonment.
 * `pagehide` additionally covers closing the tab and navigating away, which
 * backgrounding alone misses. Neither fires when a desktop window is minimized.
 *
 * Belongs in whichever component owns *every* path that can complete signup: a
 * success that does not call `markSignupCompleted` is reported as abandonment.
 */
const useSignupAbandonmentBeacon = (
  telemetry?: AuthFlowTelemetry,
  {
    isEnabled = true,
    getAbandonmentStep = getSignUpV2AbandonmentStep,
  }: SignupAbandonmentBeaconOptions = {},
): { markSignupCompleted: () => void } => {
  const hasReportedRef = useRef(false);
  const isCompletedRef = useRef(false);

  const markSignupCompleted = useCallback((): void => {
    isCompletedRef.current = true;
  }, []);

  useEffect(() => {
    if (!isEnabled) {
      return undefined;
    }
    const reportAbandonment = (): void => {
      if (isCompletedRef.current || hasReportedRef.current) {
        return;
      }
      hasReportedRef.current = true;
      // Read at fire time; this closure is created once and would otherwise
      // always report the stage the user started at.
      const { state, stage } = getAbandonmentStep();
      sendSignupAbandonmentEvent(EVENT_CONSTANTS.context.schematizedSignupForm, state);
      telemetry?.flowAbandoned(stage);
    };

    const reportIfHidden = (): void => {
      if (document.visibilityState === "hidden") {
        reportAbandonment();
      }
    };

    document.addEventListener("visibilitychange", reportIfHidden);
    // Unguarded: the page can be torn down while still reported as visible.
    window.addEventListener("pagehide", reportAbandonment);
    return () => {
      document.removeEventListener("visibilitychange", reportIfHidden);
      window.removeEventListener("pagehide", reportAbandonment);
    };
  }, [telemetry, isEnabled, getAbandonmentStep]);

  return { markSignupCompleted };
};

export default useSignupAbandonmentBeacon;
