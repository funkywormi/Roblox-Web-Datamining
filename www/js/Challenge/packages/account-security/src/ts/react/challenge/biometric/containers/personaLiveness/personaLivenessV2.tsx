import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CurrentUser, DeviceMeta } from "Roblox";
import { urlService } from "core-utilities";
import { QRDeepLinkDialog } from "@rbx/identity-verification";
import LoadingPage from "./LoadingPage";
import useBiometricContext from "../../hooks/useBiometricContext";
import { ErrorCode } from "../../interface";
import { BiometricActionType } from "../../store/action";
import { QR_POLLING_INTERVAL, QR_POLLING_MAX_TIMES } from "./settings";
import { getIsSuppressed } from "./services/suppressedStatusAPI";
import { TELEMETRY_REASONS, TelemetryReason } from "./telemetryReasons";

// Deeplink the user's mobile device opens when scanning the QR.
const buildAccountUnlockDeeplink = (userId: string): string => {
  const params = new URLSearchParams({ user_id: userId });
  return `https://ro.blox.com/Ebh5?pid=QR_code&c=liveness_onelink&is_retargeting=false&af_dp=roblox%3A%2F%2Fnavigation%2Faccount_unlock%3F${params.toString()}&deep_link_value=roblox%3A%2F%2Fnavigation%2Faccount_unlock%3F${params.toString()}`;
};

const REDIRECT_TO_HOME_DELAY_MS = 100;

function PersonaLivenessCheckV2(): React.ReactElement {
  const {
    state: { eventService, metricsService, onChallengeDisplayed, resources },
    dispatch: biometricDispatch,
  } = useBiometricContext();
  const livenessResources = resources.personaLiveness;

  const [canceled, setCanceled] = useState<boolean>(false);

  const isMobileBrowser = useMemo(() => {
    const meta = DeviceMeta?.();
    return !!meta && !meta.isInApp && (meta.isIosDevice || meta.isAndroidDevice);
  }, []);

  const pollingIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  // Tombstone refs so each side effect fires at most once even if the
  // parent re-renders us after a terminal state.
  const pollingStartedRef = useRef<boolean>(false);
  const terminatedRef = useRef<boolean>(false);

  const cleanupPolling = useCallback(() => {
    if (pollingIntervalRef.current !== undefined) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = undefined;
    }
  }, []);

  // Bypass `onChallengeCompleted` — GCC retries unlock at the redeem
  // step, which 500s once the task no longer exists.
  const redirectToHome = useCallback(() => {
    if (terminatedRef.current) {
      return;
    }
    terminatedRef.current = true;
    cleanupPolling();

    // Fire completed telemetry but do not actually fire callback, relies
    // on redirect to home to exit challenge flow.
    eventService.sendChallengeCompletedEvent(TELEMETRY_REASONS.QR_COMPLETED);
    metricsService.fireChallengeCompletedEvent(TELEMETRY_REASONS.QR_COMPLETED);

    // Settle window for backend state to propagate; otherwise the next
    // pageload bounces to /not-approved. Mirrors accountLock's
    // `ACCOUNT_UNLOCK_DELAY`.
    setTimeout(() => {
      window.location.href = urlService.getAbsoluteUrl("/home");
    }, REDIRECT_TO_HOME_DELAY_MS);
  }, [cleanupPolling, eventService, metricsService]);

  const invalidateChallenge = useCallback(
    (errorCode: ErrorCode, errorMessage: string, reason: TelemetryReason) => {
      if (terminatedRef.current) {
        return;
      }
      terminatedRef.current = true;
      cleanupPolling();
      biometricDispatch({
        type: BiometricActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode,
          errorMessage,
          reason,
        },
      });
    },
    [biometricDispatch, cleanupPolling],
  );

  const abandonChallenge = useCallback(
    (reason: TelemetryReason) => {
      if (terminatedRef.current) {
        return;
      }
      terminatedRef.current = true;
      cleanupPolling();
      setCanceled(true);
      biometricDispatch({
        type: BiometricActionType.SET_CHALLENGE_ABANDONED,
        onChallengeAbandonedData: { reason },
      });
    },
    [biometricDispatch, cleanupPolling],
  );

  const startPolling = useCallback(() => {
    if (pollingStartedRef.current || terminatedRef.current) {
      return;
    }
    pollingStartedRef.current = true;

    let times = 0;
    pollingIntervalRef.current = setInterval(() => {
      if (times >= QR_POLLING_MAX_TIMES) {
        invalidateChallenge(
          ErrorCode.TIMEOUT,
          "Persona Liveness Check timed out",
          TELEMETRY_REASONS.QR_POLLING_TIMEOUT,
        );
        return;
      }
      times += 1;

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      getIsSuppressed().then(isSuppressed => {
        if (terminatedRef.current) {
          return;
        }
        // null = transient failure; keep polling instead of terminating.
        if (isSuppressed === false) {
          redirectToHome();
        }
      });
    }, QR_POLLING_INTERVAL);
  }, [redirectToHome, invalidateChallenge]);

  useEffect(() => {
    // Defensively render only for authenticated users.
    if (!CurrentUser?.isAuthenticated || !CurrentUser.userId) {
      invalidateChallenge(
        ErrorCode.UNKNOWN,
        "Persona Liveness V2 requires an authenticated user",
        TELEMETRY_REASONS.START_LIVENESS_FAILED,
      );
      return undefined;
    }
    eventService.sendChallengeDisplayedEvent(TELEMETRY_REASONS.QR_DISPLAYED);
    metricsService.fireChallengeDisplayedEvent(TELEMETRY_REASONS.QR_DISPLAYED);
    onChallengeDisplayed({ displayed: true, reason: TELEMETRY_REASONS.QR_DISPLAYED });

    // Deeplink directly when it is a mobile browser (going into app if installed)
    // or browser if not.
    if (isMobileBrowser) {
      window.location.href = buildAccountUnlockDeeplink(CurrentUser.userId);
    }

    startPolling();
    return () => {
      cleanupPolling();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Any dismissal (X, escape, scrim) counts as abandoning the challenge.
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        abandonChallenge(TELEMETRY_REASONS.QR_USER_ABANDON);
      }
    },
    [abandonChallenge],
  );

  if (canceled || terminatedRef.current || !CurrentUser?.userId) {
    return <LoadingPage />;
  }

  return (
    <QRDeepLinkDialog
      open
      onOpenChange={handleOpenChange}
      deeplink={buildAccountUnlockDeeplink(CurrentUser.userId)}
      title={livenessResources.qrTitle}
      description={livenessResources.qrDescription}
      footer={
        <span
          dangerouslySetInnerHTML={{
            __html: livenessResources.qrFooter,
          }}
        />
      }
      closeAffordance={livenessResources.closeAffordance || "Close"}
    />
  );
}

export default PersonaLivenessCheckV2;
