import React, { ReactNode, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { Modal } from "react-style-guide";
import { Icon, ListItem } from "@rbx/foundation-ui";
import * as TwoStepVerification from "../../../../common/request/types/twoStepVerification";
import { TwoStepVerificationError } from "../../../../common/request/types/twoStepVerification";
import InlineChallengeBody from "../../../common/inlineChallengeBody";
import {
  mapTwoStepVerificationErrorToChallengeErrorCode,
  mapTwoStepVerificationErrorToResource,
} from "../constants/resources";
import { mediaTypeToPath } from "../hooks/useActiveMediaType";
import { useTrustedSessionCount } from "../hooks/useSessionsQuery";
import useTwoStepVerificationContext from "../hooks/useTwoStepVerificationContext";
import { TwoStepVerificationActionType } from "../store/action";
import { ActionType, MediaType } from "../interface";
import {
  calculateDelayByTranslations,
  getAlternateMethodDelayTextOrDefault,
  getDelayTextFromDates,
} from "../delay/text";
import SupportHelp from "./supportHelp";
import { hasBypassableMethod } from "../delay/filter";

type Props = {
  hasSentEmailCode: boolean;
  setHasSentEmailCode: React.Dispatch<React.SetStateAction<boolean>>;
  hasSentSmsCode: boolean;
  setHasSentSmsCode: React.Dispatch<React.SetStateAction<boolean>>;
  requestInFlight: boolean;
  setRequestInFlight: React.Dispatch<React.SetStateAction<boolean>>;
  setModalTitleText: React.Dispatch<React.SetStateAction<string>>;
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
};

/**
 * A list of available media types to solve the 2SV challenge.
 */
const MediaTypeList: React.FC<Props> = ({
  hasSentEmailCode,
  setHasSentEmailCode,
  hasSentSmsCode,
  setHasSentSmsCode,
  requestInFlight,
  setRequestInFlight,
  setModalTitleText,
  children,
}: Props) => {
  const {
    state: {
      userId,
      challengeId,
      actionType,
      renderInline,
      resources,
      requestService,
      enabledMediaTypes,
      delayParameters,
      metadata,
    },
    dispatch,
  } = useTwoStepVerificationContext();
  const history = useHistory();

  /*
   * Component State
   */

  const [sendCodeError, setSendCodeError] = useState<string | null>(null);

  /*
   * Event Handlers
   */

  const transitionToMediaType = async (mediaType: MediaType) => {
    if (requestInFlight) {
      return;
    }

    if (mediaType !== MediaType.CrossDevice && enabledMediaTypes.includes(MediaType.CrossDevice)) {
      // Attempt to retract dialog when a user has CD2SV enabled and switches media types, but don't surface any errors.
      await requestService.twoStepVerification.retractCrossDevice(userId, {
        challengeId,
        actionType,
      });
    }

    // Automatically send a 2SV email when switching to email code type.
    if (mediaType === MediaType.Email && !hasSentEmailCode) {
      setRequestInFlight(true);

      const result = await requestService.twoStepVerification.sendEmailCode(userId, {
        challengeId,
        actionType,
      });
      setRequestInFlight(false);
      if (result.isError) {
        if (
          result.error === TwoStepVerificationError.INVALID_USER_ID ||
          result.error === TwoStepVerificationError.INVALID_CHALLENGE_ID
        ) {
          dispatch({
            type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
            errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(result.error),
          });
        } else {
          setSendCodeError(mapTwoStepVerificationErrorToResource(resources, result.error));
        }
        return;
      }

      setHasSentEmailCode(true);
    }

    // Automatically send a 2SV text when switching to SMS code type.
    if (mediaType === MediaType.SMS && !hasSentSmsCode) {
      setRequestInFlight(true);

      const result = await requestService.twoStepVerification.sendSmsCode(userId, {
        challengeId,
        actionType,
      });
      setRequestInFlight(false);
      if (result.isError) {
        if (
          result.error === TwoStepVerificationError.INVALID_USER_ID ||
          result.error === TwoStepVerificationError.INVALID_CHALLENGE_ID
        ) {
          dispatch({
            type: TwoStepVerificationActionType.SET_CHALLENGE_INVALIDATED,
            errorCode: mapTwoStepVerificationErrorToChallengeErrorCode(result.error),
          });
        } else {
          setSendCodeError(mapTwoStepVerificationErrorToResource(resources, result.error));
        }
        return;
      }

      setHasSentSmsCode(true);
    }

    // Automatically re-send the CD2SV prompt when switching to the Cross Device type.
    if (mediaType === MediaType.CrossDevice) {
      setRequestInFlight(true);
      const result = await requestService.twoStepVerification.retryCrossDevice(userId, {
        challengeId,
        actionType,
      });
      setRequestInFlight(false);
      if (result.isError) {
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
        setSendCodeError(mapTwoStepVerificationErrorToResource(resources, result.error));
      }
    }

    history.push(mediaTypeToPath(mediaType));
  };

  /*
   * Rendering Helpers
   */

  // The names are slightly different here.
  const getFoundationMediaTypeIcon = (mediaType: MediaType) => {
    switch (mediaType) {
      case MediaType.Authenticator:
        return "icon-regular-smartphone-portrait";
      case MediaType.Email:
        return "icon-regular-envelope";
      case MediaType.RecoveryCode:
        return "icon-regular-clock-spin-reverse-dashed";
      case MediaType.SMS:
        return "icon-regular-smartphone-portrait";
      case MediaType.SecurityKey:
        return "icon-regular-key";
      case MediaType.CrossDevice:
        return "icon-regular-smartphone-portrait";
      case MediaType.Passkey:
        return "icon-regular-fingerprint";
      case MediaType.Password:
        return "icon-regular-nine-dots-grid";
      default:
        return "icon-regular-circle-slash";
    }
  };

  const getMediaTypeLabel = (mediaType: MediaType): string | null => {
    switch (mediaType) {
      case MediaType.Authenticator:
        return resources.Label.AuthenticatorMediaType;
      case MediaType.Email:
        return resources.Label.EmailMediaType;
      case MediaType.RecoveryCode:
        return resources.Label.RecoveryCodeMediaType;
      case MediaType.SMS:
        return resources.Label.SmsMediaType;
      case MediaType.SecurityKey:
        return resources.Label.SecurityKeyMediaType;
      case MediaType.CrossDevice:
        return resources.Label.CrossDeviceMediaType;
      case MediaType.Passkey:
        return resources.Label.PasskeyMediaType;
      case MediaType.Password:
        return resources.Label.PasswordMediaType;
      default:
        return null;
    }
  };

  const renderMediaType = (
    mediaType: MediaType,
    key: number,
    rowRef: React.RefObject<HTMLLIElement> | null,
  ): JSX.Element | null => {
    const mediaTypeLabel = getMediaTypeLabel(mediaType);
    if (!mediaTypeLabel) {
      return null;
    }

    const isDelayEnabled = metadata?.isDelayedUiEnabled ?? false;
    if (
      isDelayEnabled &&
      delayParameters?.state === "LOCK_STATE_UNLOCKED" &&
      !hasBypassableMethod(mediaType, delayParameters)
    ) {
      return null; // If delays are enabled, skip non-bypassable methods.
    }

    // This will filter to undefined if no delay is defined.
    const maybeDelayText = getDelayTextFromDates({
      delayParameters,
      dayTranslation: resources.Label.DayWait,
      hourTranslation: resources.Label.HourWait,
      minuteTranslation: resources.Label.MinuteWait,
      erroneousDelayTranslation: resources.Label.UnableToCalculateDelay,
      noWaitTranslation: resources.Label.NoWait,
      frictionType: mediaType,
    });

    // Ignore delayText if it's defined if the gate is false.
    const gatedDelayText = isDelayEnabled ? maybeDelayText : undefined;

    const conditionalHandler = () => {
      if (requestInFlight) {
        return;
      }

      // Reset the modal title to the default always.
      setModalTitleText(resources.Label.TwoStepVerification);

      // eslint-disable-next-line no-void
      void transitionToMediaType(mediaType);
    };
    const trailingIcon = <Icon name="icon-filled-chevron-large-right" size="Medium" />;
    const icon = <Icon name={getFoundationMediaTypeIcon(mediaType)} size="Medium" />;
    const item = (
      <ListItem
        key={key}
        title={mediaTypeLabel}
        metadata={gatedDelayText}
        leading={icon}
        divider="None"
        trailing={trailingIcon}
        className="text-body-medium padding-x-xlarge padding-y-medium"
        onSelect={conditionalHandler}
        ref={rowRef}
        isContained
      />
    );

    return item;
  };

  const trustedSessionCount = useTrustedSessionCount() ?? 0;
  const getModalText = (): { title: string; body: ReactNode } => {
    const defaultBodyText =
      actionType === ActionType.PasswordReset
        ? resources.Label.ChooseAMediaType
        : resources.Label.ChooseAlternateMediaType;
    const defaultText = {
      title: resources.Label.TwoStepVerification,
      body: defaultBodyText,
    };
    // Do not compute delay text if the delay is locked; it's just normal 2SV at this point.
    if (delayParameters?.state !== "LOCK_STATE_UNLOCKED") {
      return defaultText;
    }
    const maybeSimpleDelayText = calculateDelayByTranslations({
      timestamp: delayParameters?.delayUntil ?? "0",
      dayTranslation: resources.Label.SimpleDay,
      hourTranslation: resources.Label.SimpleHour,
      minuteTranslation: resources.Label.SimpleMinute,
    });
    if (!maybeSimpleDelayText) {
      return defaultText;
    }
    const maybeDelayedBodyText = getAlternateMethodDelayTextOrDefault(
      resources,
      defaultBodyText,
      delayParameters,
      trustedSessionCount,
    );
    return {
      title: resources.Label.WeNeedYouToWait(maybeSimpleDelayText),
      body: maybeDelayedBodyText,
    };
  };

  /*
   * Render Properties
   */
  const { title, body } = getModalText();
  setModalTitleText(title);

  const BodyElement = renderInline ? InlineChallengeBody : Modal.Body;
  const lockIconClassName = renderInline
    ? "inline-challenge-protection-shield-icon"
    : "modal-protection-shield-icon";
  const marginBottomXLargeClassName = renderInline
    ? "inline-challenge-margin-bottom-xlarge"
    : "modal-margin-bottom-xlarge";
  const tableMarginClassName = renderInline ? "" : "modal-margin-bottom-large";
  const errorTextMarginClassName = renderInline
    ? "inline-challenge-margin-top-large"
    : "modal-margin-bottom-large";
  const marginBottomClassName = renderInline
    ? "inline-challenge-margin-bottom"
    : "modal-margin-bottom";

  const rowRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    rowRef.current?.focus();
  }, []);
  /*
   * Component Markup
   */

  return (
    <BodyElement data-testid="media-type-list">
      <div className={lockIconClassName} />
      <p className={marginBottomXLargeClassName}>{body}</p>
      <table className={`table table-striped media-type-list ${tableMarginClassName}`}>
        <tbody className="[&>*:nth-child(even)]:bg-surface-300">
          {enabledMediaTypes.map((mediaType, index) =>
            renderMediaType(mediaType, index, index === 0 ? rowRef : null),
          )}
        </tbody>
      </table>
      {sendCodeError ? (
        <p className={`text-error xsmall ${errorTextMarginClassName}`}>{sendCodeError}</p>
      ) : null}
      {children}
      {/* TODO: update SupportHelp to allow conditional rendering of copy text */}
      <SupportHelp className={marginBottomClassName} />
    </BodyElement>
  );
};

export default MediaTypeList;
