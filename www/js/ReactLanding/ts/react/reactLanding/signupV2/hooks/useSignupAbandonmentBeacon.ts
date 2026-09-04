import { useCallback, useEffect, useRef } from 'react';
import EVENT_CONSTANTS from '../../../common/constants/eventsConstants';
import { sendSignupAbandonmentEvent } from '../../services/eventService';
import useSignUpContainerV2State, {
  SignUpV2Operation,
  SignUpV2Step
} from '../state/signUpContainerV2State';

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
const useSignupAbandonmentBeacon = (): { markSignupCompleted: () => void } => {
  const hasReportedRef = useRef(false);
  const isCompletedRef = useRef(false);

  const markSignupCompleted = useCallback((): void => {
    isCompletedRef.current = true;
  }, []);

  useEffect(() => {
    const reportAbandonment = (): void => {
      if (isCompletedRef.current || hasReportedRef.current) {
        return;
      }
      hasReportedRef.current = true;
      // Read at fire time; this closure is created once and would otherwise
      // always report the stage the user started at.
      const { step, operation } = useSignUpContainerV2State.getState();
      sendSignupAbandonmentEvent(
        EVENT_CONSTANTS.context.schematizedSignupForm,
        getAbandonmentState(step, operation)
      );
    };

    const reportIfHidden = (): void => {
      if (document.visibilityState === 'hidden') {
        reportAbandonment();
      }
    };

    document.addEventListener('visibilitychange', reportIfHidden);
    // Unguarded: the page can be torn down while still reported as visible.
    window.addEventListener('pagehide', reportAbandonment);
    return () => {
      document.removeEventListener('visibilitychange', reportIfHidden);
      window.removeEventListener('pagehide', reportAbandonment);
    };
  }, []);

  return { markSignupCompleted };
};

export default useSignupAbandonmentBeacon;
