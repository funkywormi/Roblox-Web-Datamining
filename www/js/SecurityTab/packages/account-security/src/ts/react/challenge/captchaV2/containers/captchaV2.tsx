import { FC, useCallback, useEffect, useRef } from "react";
import { HttpResponseCodes } from "@rbx/core-scripts/http";
import localStorageService from "@rbx/core-scripts/local-storage";
import { CHALLENGE_ID_STORAGE_KEY } from "../app.config";
import useCaptchaV2Context from "../hooks/useCaptchaV2Context";
import { ErrorCode } from "../interface";
import { CaptchaV2ActionType } from "../store/action";
import {
  clearCaptchaSuccessCallback,
  setCaptchaSuccessCallback,
  waitForSensorReady,
} from "./sensor";

// Technical reason forwarded to the invalidation callback; never displayed.
const INVALIDATION_ERROR_MESSAGE = "CaptchaV2 verification failed";

const CaptchaV2: FC = () => {
  const {
    state: { challengeId, requestService, eventService, metricsService },
    dispatch,
  } = useCaptchaV2Context();

  const closeModal = useCallback(() => {
    dispatch({ type: CaptchaV2ActionType.HIDE_MODAL_CHALLENGE });
  }, [dispatch]);

  const invalidate = useCallback(
    (errorCode: ErrorCode) => {
      closeModal();
      dispatch({
        type: CaptchaV2ActionType.SET_CHALLENGE_INVALIDATED,
        onChallengeInvalidatedData: {
          errorCode,
          errorMessage: INVALIDATION_ERROR_MESSAGE,
        },
      });
    },
    [closeModal, dispatch],
  );

  const complete = useCallback(
    (redemptionToken: string) => {
      closeModal();
      dispatch({
        type: CaptchaV2ActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: { redemptionToken },
      });
    },
    [closeModal, dispatch],
  );

  // The interactive challenge is rendered by the sensor in its own Auto ABR
  // modal; we only flag it visible and emit telemetry.
  const showChallenge = useCallback(() => {
    dispatch({ type: CaptchaV2ActionType.SHOW_MODAL_CHALLENGE });
  }, [dispatch]);

  // Verifies the session over HTTP. Held in a ref so the sensor's success
  // callback can re-invoke the latest version after the user solves the
  // interactive challenge.
  const verifyRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const verify = useCallback(async (): Promise<void> => {
    const result = await requestService.captchaV2.submitCaptcha(challengeId);

    if (!result.isError) {
      complete(result.value.redemption_token);
      return;
    }

    if (result.errorStatusCode === HttpResponseCodes.forbidden) {
      showChallenge();
      return;
    }

    if (result.errorStatusCode === HttpResponseCodes.notFound) {
      invalidate(ErrorCode.SESSION_NOT_FOUND);
      return;
    }

    invalidate(ErrorCode.UNKNOWN);
  }, [challengeId, complete, invalidate, requestService.captchaV2, showChallenge]);
  verifyRef.current = verify;

  // Inject the sensor, then verify once it is ready. Runs once per challenge.
  useEffect(() => {
    const currentChallengeId = localStorageService.getLocalStorage(CHALLENGE_ID_STORAGE_KEY) as
      | string
      | undefined;
    if (challengeId === currentChallengeId) {
      return undefined;
    }
    localStorageService.setLocalStorage(CHALLENGE_ID_STORAGE_KEY, challengeId);

    eventService.sendChallengeInitializedEvent();
    metricsService.fireChallengeInitializedEvent();

    setCaptchaSuccessCallback(isValid => {
      if (isValid) {
        // eslint-disable-next-line no-void
        void verifyRef.current();
      }
    });

    const cancelWait = waitForSensorReady(sensorFinished => {
      if (sensorFinished) {
        eventService.sendSensorFinishedEvent();
        metricsService.fireSensorFinishedEvent();
      }
      // eslint-disable-next-line no-void
      void verify();
    });

    return () => {
      cancelWait();
      clearCaptchaSuccessCallback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId]);

  // Invisible challenge: no UI of our own.
  return null;
};

export default CaptchaV2;
