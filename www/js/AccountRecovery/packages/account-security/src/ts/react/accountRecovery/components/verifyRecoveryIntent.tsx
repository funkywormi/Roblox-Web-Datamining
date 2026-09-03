import React, { useEffect, useRef, useState } from "react";
import { Loading } from "react-style-guide";
import useExperiments from "@rbx/authentication-common/hooks/useExperiments";
import ModernCardHeader from "../../common/modernCardComponent/modernCardHeader";
import ModernCardBody from "../../common/modernCardComponent/modernCardBody";
import {
  CardFooterButtonConfig,
  ModernCardFooter,
} from "../../common/modernCardComponent/modernCardFooter";
import { RecoveryIntentStatus } from "../../../common/request/types/accountRecovery";
import useAccountRecoveryContext from "../hooks/useAccountRecoveryContext";
import { handleVerifiedRecovery, ProfileSection } from "../commonHelpers";
import ComponentState from "../store/componentState";
import {
  isRetryableRecoveryIntentRequestError,
  isRetryableRecoveryIntentVerifyError,
} from "../constants/config";
import { mapAccountRecoveryErrorToResource } from "../constants/resources";

// Keep automatic checks frequent enough for approval feedback, but cap them at
// the recovery intent's one-hour lifetime.
const POLL_INTERVAL_MS = 4000;
const MAX_POLL_RETRIES = (60 * 60 * 1000) / POLL_INTERVAL_MS;

/**
 * Waits for a Recovery Account owner to approve the request, then redeems that
 * approval and resumes the normal Account Recovery state machine.
 */
const VerifyRecoveryIntent: React.FC = () => {
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

  // UI state for the approval check. The refs persist across renders without
  // themselves causing a render when timers or session IDs change.
  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState(false); // Sets "waiting" UI

  let contactMethodNumber = 0;
  if (componentStateAndProps.componentState === ComponentState.VERIFY_RECOVERY_INTENT) {
    contactMethodNumber = componentStateAndProps.additionalComponentProps.contactMethodNumber ?? 0;
  }

  // Polling experiment setup. We don't check device meta as the account-recover-based recovery flag
  // already checks for this.
  const experiments = useExperiments("AccountSecurity.SelfRecovery.RecoveryUI");
  const shouldPollRecoveryIntent =
    !experiments.isLoading && experiments.shouldPollRecoveryIntent === true;

  // A manual click is a request token that must be consumed before another can be issued.
  // Tracking the consumed value prevents a later render or state change from replaying an earlier click.
  const [manualCheckRequest, setManualCheckRequest] = useState(0);
  const consumedManualCheckRequestRef = useRef(0);

  // Parameters to enforce polling limits, reset when a new recovery session starts.
  const pollAttemptRef = useRef(0);
  const pollRecoverySessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Do not display an error from a previous recovery session.
    setRequestError(null);
  }, [recoverySessionId]);

  useEffect(() => {
    // The effect supports two modes: continuous, polled checks, or
    // one check for each manual button click. This is controlled by the shouldPollRecoveryIntent
    // from the AccountSecurity.SelfRecovery.RecoveryUI layer.
    const hasUnconsumedManualCheck = manualCheckRequest > consumedManualCheckRequestRef.current;
    if (
      componentStateAndProps.componentState !== ComponentState.VERIFY_RECOVERY_INTENT ||
      experiments.isLoading ||
      (!shouldPollRecoveryIntent && !hasUnconsumedManualCheck)
    ) {
      setRequestInFlight(false);
      return undefined;
    }

    let intervalId: ReturnType<typeof setInterval> | undefined;
    let isRequestInFlight = false;
    let isEffectActive = true;

    // Consume this one-shot trigger so a later render does not repeat the same
    // manual approval check.
    if (!shouldPollRecoveryIntent) {
      consumedManualCheckRequestRef.current = manualCheckRequest;
    }

    // Reset poll reference to 0 if this effect belongs to a new recovery attempt.
    if (pollRecoverySessionIdRef.current !== recoverySessionId) {
      pollRecoverySessionIdRef.current = recoverySessionId;
      pollAttemptRef.current = 0;
    }

    // An approved Recovery Account intent and a successful OTP share the same
    // post-verification recovery flow.
    const continueAfterVerification = () =>
      handleVerifiedRecovery({
        requestService,
        resources,
        eventService,
        dispatch,
        recoverySessionId,
        userIdToRecover,
        contactMethodNumber,
        recover2sv,
        recoverPassword,
      });

    // Is no-op when polling is off.
    const stopPolling = () => {
      if (intervalId !== undefined) clearInterval(intervalId);
    };

    const finishApprovalCheck = () => {
      stopPolling();
      isRequestInFlight = false;
      setRequestInFlight(false);
    };

    const finishPendingApprovalCheck = () => {
      isRequestInFlight = false;
      if (!shouldPollRecoveryIntent) {
        setRequestInFlight(false);
        setRequestError(resources.Message.RecoveryIntentPending);
      }
    };

    // Read the intent state first; only the verify endpoint may redeem an
    // approved intent. This avoids a client-side status → redeem race.
    async function checkAndRedeemRecoveryIntent(): Promise<void> {
      // Do not overlap a slow status request with the next interval tick.
      if (isRequestInFlight) return;

      // Stop polling if we exceeded max retries.
      if (shouldPollRecoveryIntent && pollAttemptRef.current >= MAX_POLL_RETRIES) {
        finishApprovalCheck();
        setRequestError(resources.Message.UnknownError);
        return;
      }

      if (shouldPollRecoveryIntent) pollAttemptRef.current += 1;

      isRequestInFlight = true;
      setRequestInFlight(true);

      // Fetch status from account recovery
      const statusResult =
        await requestService.accountRecoveryApi.getRecoveryIntentStatus(recoverySessionId);
      if (!isEffectActive) return;

      if (statusResult.isError) {
        // Keep the recovery intent available after transient failures. Polling
        // retries automatically; manual mode lets the user issue the next check.
        if (isRetryableRecoveryIntentRequestError(statusResult.errorStatusCode)) {
          isRequestInFlight = false;
          if (!shouldPollRecoveryIntent) setRequestInFlight(false);
          return;
        }
        // Else return error
        finishApprovalCheck();
        setRequestError(mapAccountRecoveryErrorToResource(resources, statusResult.error));
        return;
      }

      // Reset and act according to status result
      switch (statusResult.value.status) {
        case RecoveryIntentStatus.Pending:
          finishPendingApprovalCheck();
          return;
        case RecoveryIntentStatus.Approved:
        case RecoveryIntentStatus.Redeemed: {
          // The verify endpoint atomically redeems the approved intent and advances the recovery
          // session. It handles both "APPROVED" and "REDEEMED".
          const verifyResult =
            await requestService.accountRecoveryApi.verifyRecoveryIntent(recoverySessionId);
          if (!isEffectActive) return;

          // Determine if we can retry on error.
          if (verifyResult.isError) {
            if (isRetryableRecoveryIntentVerifyError(verifyResult.errorStatusCode)) {
              isRequestInFlight = false;
              if (!shouldPollRecoveryIntent) setRequestInFlight(false);
              return;
            }
            finishApprovalCheck();
            setRequestError(mapAccountRecoveryErrorToResource(resources, verifyResult.error));
            return;
          }

          // If it's still pending, allow retries.
          if (verifyResult.value.status === RecoveryIntentStatus.Pending) {
            finishPendingApprovalCheck();
            return;
          }

          stopPolling();
          try {
            await continueAfterVerification();
          } finally {
            isRequestInFlight = false;
            setRequestInFlight(false);
          }
          return;
        }
        case RecoveryIntentStatus.Denied:
        case RecoveryIntentStatus.Invalid:
          finishApprovalCheck();
          setRequestError(resources.Message.Error.RecoveryIntentDenied);
          return;
        default:
          finishApprovalCheck();
          setRequestError(resources.Message.UnknownError);
      }
    }

    if (shouldPollRecoveryIntent) {
      intervalId = setInterval(() => {
        // eslint-disable-next-line no-void
        void checkAndRedeemRecoveryIntent();
      }, POLL_INTERVAL_MS);
    }

    // eslint-disable-next-line no-void
    void checkAndRedeemRecoveryIntent();

    return () => {
      isEffectActive = false;
      stopPolling();
    };
  }, [
    componentStateAndProps.componentState,
    contactMethodNumber,
    dispatch,
    experiments.isLoading,
    eventService,
    manualCheckRequest,
    recover2sv,
    recoverPassword,
    recoverySessionId,
    requestService,
    resources,
    shouldPollRecoveryIntent,
    userIdToRecover,
  ]);

  // Make sure we are in the correct screen for this.
  if (componentStateAndProps.componentState !== ComponentState.VERIFY_RECOVERY_INTENT) {
    return null;
  }

  // The footer is intentionally omitted during automatic polling. In manual
  // mode it is the user-controlled trigger for the next status check.
  const shouldShowManualCheck = !experiments.isLoading && !shouldPollRecoveryIntent;

  // Spinner if we are checking for approval, "Continue" otherwise.
  // Does not display when shouldPollRecoveryIntent === true
  const continueButton: CardFooterButtonConfig = {
    content: requestInFlight ? (
      <span className="spin spinner-xs spinner-no-margin" />
    ) : (
      resources.Action.Continue
    ),
    label: resources.Action.Continue,
    enabled: !requestInFlight,
    action: () => {
      setRequestInFlight(true);
      setRequestError(null);
      setManualCheckRequest(request => request + 1);
    },
  };
  return (
    <React.Fragment>
      <ModernCardHeader headerText={resources.Heading.RobloxAccountRecovery} />
      <ModernCardBody>
        {userIdToRecover ? (
          <ProfileSection
            userId={userIdToRecover}
            combinedName={combinedName ?? ""}
            username={username ?? ""}
          />
        ) : (
          <div className="flex flex-col items-center padding-bottom-large">
            <span className="text-heading-small">
              {componentStateAndProps.additionalComponentProps.contactMethodToDisplay}
            </span>
          </div>
        )}
        <div className="padding-xsmall" />
        <p className="text-align-x-left">
          {shouldPollRecoveryIntent
            ? resources.Description.VerifyRecoveryIntentPolling
            : resources.Description.VerifyRecoveryIntent}
        </p>
        {requestError ? (
          <p className="text-error xsmall">{requestError}</p>
        ) : experiments.isLoading || shouldPollRecoveryIntent || requestInFlight ? (
          <Loading />
        ) : null}
      </ModernCardBody>
      {shouldShowManualCheck && (
        <ModernCardFooter positiveButton={continueButton} negativeButton={null} />
      )}
    </React.Fragment>
  );
};

export default VerifyRecoveryIntent;
