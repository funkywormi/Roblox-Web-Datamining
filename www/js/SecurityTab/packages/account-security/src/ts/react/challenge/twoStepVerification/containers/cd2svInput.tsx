import React, { useEffect, useState } from "react";
import { Modal } from "react-style-guide";
import { Button } from "@rbx/foundation-ui";
import * as TwoStepVerification from "../../../../common/request/types/twoStepVerification";
import InlineChallengeBody from "../../../common/inlineChallengeBody";
import { TIMEOUT_BEFORE_CALLBACK_MILLISECONDS } from "../app.config";
import {
  mapTwoStepVerificationErrorToChallengeErrorCode,
  mapTwoStepVerificationErrorToResource,
} from "../constants/resources";
import { useActiveMediaType } from "../hooks/useActiveMediaType";
import useTwoStepVerificationContext from "../hooks/useTwoStepVerificationContext";
import { TwoStepVerificationActionType } from "../store/action";
import { useDelayedVerificationBodyText } from "../delay/text";

const HELP_PAGE_URL = "https://www.roblox.com/info/2sv";
const DEBOUNCE_INTERVAL_MILLISECONDS = 3000;
const POLLING_INTERVAL_MILLISECONDS = 3000;

type Props = {
  requestInFlight: boolean;
  setRequestInFlight: React.Dispatch<React.SetStateAction<boolean>>;
  setModalTitleText: React.Dispatch<React.SetStateAction<string>>;
  setShowChangeMediaType: React.Dispatch<React.SetStateAction<boolean>>;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A container element for the Cross Device input UI.
 */
const CD2SVInput: React.FC<Props> = ({
  requestInFlight,
  setRequestInFlight,
  setModalTitleText,
  setShowChangeMediaType,
  children,
}: Props) => {
  const {
    state: {
      userId,
      challengeId,
      actionType,
      renderInline,
      resources,
      metadata,
      eventService,
      metricsService,
      requestService,
      onModalChallengeAbandoned,
    },
    dispatch,
  } = useTwoStepVerificationContext();
  const activeMediaType = useActiveMediaType();

  /*
   * Component State
   */

  const [requestError, setRequestError] = useState<string | null>(null);
  const [modalDescription, setModalDescription] = useState<string>(
    resources.Label.ApproveWithDevice,
  );
  const [showRetryButton, setShowRetryButton] = useState<boolean>(true);
  const [showHelpCenterLink, setShowHelpCenterLink] = useState<boolean>(false);
  const [numRetryAttempted, setNumRetryAttempted] = useState<number>(0);
  const [shouldDebounceRetry, setShouldDebounceRetry] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const closeModal = () => {
    dispatch({
      type: TwoStepVerificationActionType.HIDE_MODAL_CHALLENGE,
    });

    eventService.sendChallengeAbandonedEvent(activeMediaType, actionType);
    metricsService.fireAbandonedEvent();

    if (onModalChallengeAbandoned !== null) {
      // Set a timeout to ensure that any events and metrics have a better
      // chance to complete.
      setTimeout(
        () =>
          onModalChallengeAbandoned(() =>
            dispatch({
              type: TwoStepVerificationActionType.SHOW_MODAL_CHALLENGE,
            }),
          ),
        TIMEOUT_BEFORE_CALLBACK_MILLISECONDS,
      );
    }
  };

  const retryPrompt = async () => {
    if (numRetryAttempted >= 4) {
      // Attempt to retract dialog but don't surface any possible errors.
      await requestService.twoStepVerification.retractCrossDevice(userId, {
        challengeId,
        actionType,
      });
      setModalTitleText(resources.Label.TwoStepVerification);
      setModalDescription(resources.Description.LoginExpired);
      setShowChangeMediaType(false);
      setShowRetryButton(false);
      setShowHelpCenterLink(true);
      return;
    }
    setNumRetryAttempted(numRetryAttempted + 1);
    setRequestInFlight(true);
    setRequestError(null);
    setModalTitleText(resources.Label.TwoStepVerification);
    setModalDescription(resources.Label.ApproveWithDevice);
    const result = await requestService.twoStepVerification.retryCrossDevice(userId, {
      challengeId,
      actionType,
    });

    if (result.isError) {
      eventService.sendCodeVerificationFailedEvent(
        activeMediaType,
        actionType,
        TwoStepVerification.TwoStepVerificationError[
          result.error || TwoStepVerification.TwoStepVerificationError.UNKNOWN
        ],
      );
      if (
        result.error === TwoStepVerification.TwoStepVerificationError.INVALID_USER_ID ||
        result.error === TwoStepVerification.TwoStepVerificationError.INVALID_CHALLENGE_ID
      ) {
        dispatch({
          type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(result.error),
        });
        return;
      }

      setRequestInFlight(false);
      setRequestError(mapTwoStepVerificationErrorToResource(resources, result.error));
      return;
    }
    // Show the retry button on modal load, but add a 3s delay after each click.
    if (numRetryAttempted > 0) {
      setShouldDebounceRetry(true);
    }
    setRequestInFlight(false);
  };

  /*
   * Render Properties
   */

  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const marginBottomClassName = renderInline
    ? "inline-challenge-margin-bottom"
    : "modal-margin-bottom";
  const marginBottomLargeClassName = renderInline
    ? "inline-margin-bottom-xlarge"
    : "modal-margin-bottom-xlarge";
  const textErrorClassName = marginBottomLargeClassName.concat(" ", "text-error xsmall");
  const lockIconClassName = renderInline
    ? "inline-challenge-protection-shield-icon"
    : "modal-protection-shield-icon";

  useEffect(() => {
    if (!shouldDebounceRetry) return undefined;
    const timeoutId = setTimeout(() => {
      setShouldDebounceRetry(false);
    }, DEBOUNCE_INTERVAL_MILLISECONDS);
    return () => clearTimeout(timeoutId);
  }, [shouldDebounceRetry]);

  useEffect(() => {
    retryPrompt()
      .then(() => setRequestError(null))
      .catch(() =>
        setRequestError(
          mapTwoStepVerificationErrorToResource(
            resources,
            TwoStepVerification.TwoStepVerificationError.UNKNOWN,
          ),
        ),
      );
    const interval = setInterval(() => {
      requestService.twoStepVerification
        .verifyCrossDevice(userId, {
          challengeId,
          actionType,
        })
        .then(result => {
          if (result.isError) {
            eventService.sendCodeVerificationFailedEvent(
              activeMediaType,
              actionType,
              TwoStepVerification.TwoStepVerificationError[
                result.error || TwoStepVerification.TwoStepVerificationError.UNKNOWN
              ],
            );
            if (result.error === TwoStepVerification.TwoStepVerificationError.CHALLENGE_DENIED) {
              setModalTitleText(resources.Label.TwoStepVerification);
              setModalDescription(resources.Description.Denied);
              setShowChangeMediaType(false);
              setShowRetryButton(false);
              clearInterval(interval);
              return;
            }
            if (
              result.error ===
              TwoStepVerification.TwoStepVerificationError.CROSS_DEVICE_DIALOG_EXPIRED
            ) {
              setModalTitleText(resources.Label.TwoStepVerification);
              setModalDescription(resources.Description.Expired);
              setShowChangeMediaType(false);
              setShowRetryButton(false);
              setShowHelpCenterLink(true);
              clearInterval(interval);
              return;
            }
            if (
              result.error === TwoStepVerification.TwoStepVerificationError.INVALID_USER_ID ||
              result.error === TwoStepVerification.TwoStepVerificationError.INVALID_CHALLENGE_ID
            ) {
              dispatch({
                type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
                errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(result.error),
              });
              return;
            }
            setRequestError(mapTwoStepVerificationErrorToResource(resources, result.error));
          } else if (result.value.verificationToken) {
            eventService.sendCodeVerifiedEvent(activeMediaType, actionType);
            metricsService.fireVerifiedEvent(activeMediaType);
            dispatch({
              type: TwoStepVerificationActionType.SET_CHALLENGE_COMPLETED,
              onChallengeCompletedData: {
                verificationToken: result.value.verificationToken,
                rememberDevice: false,
              },
            });
          }
        })
        .catch(() =>
          setRequestError(
            mapTwoStepVerificationErrorToResource(
              resources,
              TwoStepVerification.TwoStepVerificationError.UNKNOWN,
            ),
          ),
        );
    }, POLLING_INTERVAL_MILLISECONDS);
    return () => {
      clearInterval(interval);
    };
  }, []);

  /*
   * Component Markup
   */

  const maybeDelayedText = useDelayedVerificationBodyText(metadata?.isDelayedUiEnabled ?? false);

  return (
    metadata && (
      <BodyElement>
        <div className={lockIconClassName} />
        <p className={marginBottomClassName}>
          {modalDescription} {maybeDelayedText ?? ""}
        </p>
        {showRetryButton ? (
          <Button
            variant="Standard"
            size="Medium"
            className={`challenge-action-button ${marginBottomClassName}`}
            aria-label={resources.Action.Retry}
            isDisabled={requestInFlight}
            isLoading={requestInFlight || shouldDebounceRetry}
            onClick={retryPrompt}
            data-testid="cross-device-retry-button"
          >
            {resources.Action.Retry}
          </Button>
        ) : (
          <Button
            variant="Emphasis"
            size="Medium"
            className={`challenge-action-button ${marginBottomClassName}`}
            aria-label={resources.Action.Okay}
            isDisabled={requestInFlight}
            isLoading={requestInFlight}
            onClick={closeModal}
            data-testid="cross-device-okay-button"
          >
            {resources.Action.Okay}
          </Button>
        )}
        {showRetryButton ? children : null}
        {showRetryButton || showHelpCenterLink ? (
          <p
            className={`text-footer ${marginBottomClassName}`}
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: resources.Label.HelpCenterLink(
                `<a class="text-name text-footer contact" href="${HELP_PAGE_URL}" target="_blank" rel="noopener noreferrer">${resources.Label.HelpCenter}</a>`,
              ),
            }}
          />
        ) : null}
        <p className={textErrorClassName}>{requestError}</p>
      </BodyElement>
    )
  );
};

export default CD2SVInput;
