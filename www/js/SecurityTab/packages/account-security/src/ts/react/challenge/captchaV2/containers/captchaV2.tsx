import React, { FC, useCallback, useEffect, useRef, useState } from "react";
import { Dialog, DialogBody, DialogContent, DialogTitle, ProgressCircle } from "@rbx/foundation-ui";
import { HttpResponseCodes } from "@rbx/core-scripts/http";
import localStorageService from "@rbx/core-scripts/local-storage";
import { CaptchaV2BlockResponse } from "../../../../common/request/types/captchaV2";
import { CHALLENGE_ID_STORAGE_KEY, PX_CAPTCHA_CONTAINER_ID } from "../app.config";
import useCaptchaV2Context from "../hooks/useCaptchaV2Context";
import { ErrorCode } from "../interface";
import { CaptchaV2ActionType } from "../store/action";
import {
  clearCaptchaSuccessCallback,
  setCaptchaSuccessCallback,
  waitForSensorReady,
  startCustomChallenge,
} from "./sensor";
import "../../../../../css/tailwind.css";
import "../../../../../css/challenge/captchaV2/captchaV2.scss";

// Technical reason forwarded to the invalidation callback; never displayed.
const INVALIDATION_ERROR_MESSAGE = "CaptchaV2 verification failed";

// Must match `CHALLENGE_VIEW.height` in sensor.ts. Used to reserve the button's
// space while it loads so the dialog doesn't resize when the button appears.
const BUTTON_HEIGHT_PX = 40;
// Vendor sets an inline `min-width: 310px` on `#px-captcha` when the challenge
// renders. Reserve the same width up front so the modal is already this wide and
// doesn't expand once the button appears.
const BUTTON_MIN_WIDTH_PX = 310;
// Reserved height for the retry-error slot below the button, so toggling the
// error text never grows the dialog.
const ERROR_SLOT_HEIGHT_PX = 24;

const CaptchaV2: FC = () => {
  const {
    state: {
      challengeId,
      mode,
      renderInline,
      resources,
      requestService,
      eventService,
      metricsService,
      isModalVisible,
      onChallengeCompletedData,
      onChallengeInvalidatedData,
      isAbandoned,
    },
    dispatch,
  } = useCaptchaV2Context();

  // The Advanced Blocking Response that drives the custom render. Populated from
  // the `403` body; `null` until (and unless) an interactive challenge is
  // required.
  const [blockResponse, setBlockResponse] = useState<CaptchaV2BlockResponse | null>(null);
  // Tracked as state (via a callback ref) rather than a plain ref so the render
  // effect fires exactly when the `px-captcha` node attaches and detaches.
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  // Set when the user fails an attempt; shows the retry message below the widget.
  const [failed, setFailed] = useState(false);
  // True whenever the spinner should cover the widget.
  const [verifying, setVerifying] = useState(true);

  const closeModal = useCallback(() => {
    dispatch({ type: CaptchaV2ActionType.HIDE_MODAL_CHALLENGE });
  }, [dispatch]);

  // Dismissing via the header close button or Escape abandons the challenge.
  // Letting the abandoned effect in the context provider fire
  // `onModalChallengeAbandoned` gives the consumer a chance to re-open it.
  const abandon = useCallback(() => {
    closeModal();
    dispatch({ type: CaptchaV2ActionType.SET_CHALLENGE_ABANDONED });
  }, [dispatch, closeModal]);

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
    [dispatch, closeModal],
  );

  const complete = useCallback(
    (redemptionToken: string) => {
      closeModal();
      dispatch({
        type: CaptchaV2ActionType.SET_CHALLENGE_COMPLETED,
        onChallengeCompletedData: { redemptionToken },
      });
    },
    [dispatch, closeModal],
  );

  // Reveals the interactive challenge. The custom render (window globals + block
  // script injection) is driven by an effect once the `px-captcha` container is
  // mounted; here we only stash the block response and flag the modal visible.
  const showChallenge = useCallback(
    (block: CaptchaV2BlockResponse, isRetry: boolean) => {
      setBlockResponse(block);

      // Only reveal the modal on the initial challenge. On a retry the modal is
      // already open, so we just swap in the new block and re-render the widget.
      if (!isRetry) {
        dispatch({ type: CaptchaV2ActionType.SHOW_MODAL_CHALLENGE });
      }
    },
    [dispatch],
  );

  // Verifies the session over HTTP. Held in a ref so the block script's success
  // callback (registered once with the `window` global) can always invoke the
  // latest closure — see note below on `verifyRef`.
  const verifyRef = useRef<(isRetry: boolean) => Promise<void>>(() => Promise.resolve());
  const verify = useCallback(
    async (isRetry: boolean): Promise<void> => {
      const result = await requestService.captchaV2.submitCaptcha(challengeId, mode);

      if (!result.isError) {
        complete(result.value.redemption_token);
        return;
      }

      if (result.errorStatusCode === HttpResponseCodes.forbidden) {
        // A `403` can carry a block response which we render.
        const block = requestService.captchaV2.parseBlockResponse(result.errorRaw);
        if (block !== null) {
          // Solved-but-rejected: the user completed the widget yet the server
          // still challenged us, so surface the retry message alongside the
          // re-rendered challenge.
          if (isRetry) {
            setFailed(true);
          }
          // The re-rendered widget is interactive again; drop the verify spinner.
          showChallenge(block, isRetry);
        } else {
          invalidate(ErrorCode.UNKNOWN);
        }
        return;
      }

      if (result.errorStatusCode === HttpResponseCodes.notFound) {
        invalidate(ErrorCode.SESSION_NOT_FOUND);
        return;
      }

      invalidate(ErrorCode.UNKNOWN);
    },
    [challengeId, mode, complete, invalidate, requestService.captchaV2, showChallenge],
  );
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
        // Optimistically clear any prior retry error. If the re-verify comes
        // back with another `403`, `verify(true)` sets it again.
        setFailed(false);
        // eslint-disable-next-line no-void
        void verifyRef.current(true);
      } else {
        // The user failed the widget; vendor keeps it mounted for another
        // attempt, so prompt a retry.
        setFailed(true);
      }
    });

    const cancelWait = waitForSensorReady(sensorFinished => {
      if (sensorFinished) {
        eventService.sendSensorFinishedEvent();
        metricsService.fireSensorFinishedEvent();
      }
      // eslint-disable-next-line no-void
      void verify(false);
    });

    return () => {
      cancelWait();
      clearCaptchaSuccessCallback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challengeId]);

  // Custom render: publish the ABR globals and inject the block script once the
  // `px-captcha` container is mounted. The cleanup removes the script and clears
  // the globals, so it runs whenever the container detaches.
  useEffect(() => {
    if (blockResponse === null || container === null) {
      return undefined;
    }
    return startCustomChallenge(blockResponse, {
      buttonLabel: resources.Action.PressAndHold,
      // A finished attempt (solve or fail) shows spinner, later "render" event clears.
      onCaptchaEvent: status => setVerifying(status === "succeeded" || status === "failed"),
    });
  }, [blockResponse, container, resources.Action.PressAndHold]);

  // Tear down once the challenge reaches a terminal state. The terminal
  // callbacks still fire from the context provider's effects, which are
  // unaffected by rendering `null` here.
  if (onChallengeCompletedData !== null || onChallengeInvalidatedData !== null || isAbandoned) {
    return null;
  }

  // No interactive challenge required yet (verification pending or passed).
  if (blockResponse === null) {
    return null;
  }

  // Custom ABR only mounts the interactive widget (the press-and-hold button)
  // into `#px-captcha`, so we supply the surrounding UI.
  const challengeBody = (
    <React.Fragment>
      <p className="text-body-medium">{resources.Content.HoldToConfirm}</p>

      {/* Button area — reserve the button's height so the loading→button swap
          does not resize the dialog. The loading indicator overlays the same
          space the button will occupy. */}
      <div
        className="margin-top-small relative"
        style={{ minHeight: BUTTON_HEIGHT_PX, minWidth: BUTTON_MIN_WIDTH_PX }}
      >
        <div
          className={`absolute inset-[0] items-center justify-center ${verifying ? "flex" : "hidden"}`}
        >
          <ProgressCircle
            variant="Indeterminate"
            size="Small"
            ariaLabel={resources.Action.PressAndHold}
          />
        </div>
        {/* Vendor widget — hidden while loading/verifying so only the spinner shows. */}
        <div
          id={PX_CAPTCHA_CONTAINER_ID}
          ref={setContainer}
          className={verifying ? "hidden" : "flex"}
        />
      </div>

      {/* Retry error — fixed-height slot in the small margin under the button, so
          showing the message never grows the dialog. */}
      <div style={{ minHeight: ERROR_SLOT_HEIGHT_PX }}>
        {failed && <p className="text-body-small text-error">{resources.Content.TryAgain}</p>}
      </div>

      <p className="text-caption-small content-muted">
        {resources.Content.ReferenceID(blockResponse.uuid)}
      </p>
    </React.Fragment>
  );

  if (renderInline) {
    // Inline (non-modal) has no dialog chrome, so add top spacing so the header
    // text isn't flush with the top of the view.
    return <div className="margin-top-medium flex flex-col">{challengeBody}</div>;
  }

  return (
    <Dialog
      open={isModalVisible}
      onOpenChange={open => {
        if (!open) {
          abandon();
        }
      }}
      isModal
      size="Medium"
      type="Default"
      hasCloseAffordance
      closeLabel={resources.Label.Cancel}
    >
      <DialogContent>
        <DialogBody className="flex flex-col">
          <DialogTitle className="text-heading-small padding-bottom-small">
            {resources.Title.VerifyHuman}
          </DialogTitle>
          {challengeBody}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
};

export default CaptchaV2;
