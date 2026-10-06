import React, { useState, useCallback, useEffect } from "react";
import { EmailVerifyCodeModalService } from "Roblox";

import { OTP_CONTAINER_ID } from "../app.config";
import * as Otp from "../../../../common/request/types/otp";

import useEmailVerificationContext from "../hooks/useEmailVerificationContext";

import { EmailVerificationActionType } from "../store/action";
import { useOtpCodeLength } from "../hooks/useOtpCodeLength";

import InlineChallenge from "../../../common/inlineChallenge";
import InlineChallengeBody from "../../../common/inlineChallengeBody";
import QuitVerificationConfirmation from "../../../common/quitVerificationConfirmation";

const EmailVerification: React.FC = () => {
  const {
    state: { renderInline, resources, translate, eventService, metricsService, isModalVisible },
    dispatch,
  } = useEmailVerificationContext();

  const otpCodeLength = useOtpCodeLength();

  const [isConfirmationModalVisible, setConfirmationModalVisible] = useState(false);

  const onModalAbandoned = useCallback(() => {
    setConfirmationModalVisible(true);
    dispatch({
      type: EmailVerificationActionType.HIDE_MODAL_CHALLENGE,
    });
  }, [dispatch]);

  const handleRejectAbandon = useCallback(() => {
    setConfirmationModalVisible(false);
    dispatch({
      type: EmailVerificationActionType.SHOW_MODAL_CHALLENGE,
    });
  }, [dispatch]);

  const handleConfirmAbandon = useCallback(() => {
    setConfirmationModalVisible(false);
    dispatch({
      type: EmailVerificationActionType.SET_CHALLENGE_INVALIDATED,
      errorCode: 0,
    });

    metricsService.fireChallengeInvalidatedEvent();
    eventService.sendChallengeInvalidatedEvent();
  }, [dispatch, eventService, metricsService]);

  const loadChallenge = () => {
    if (EmailVerifyCodeModalService) {
      EmailVerifyCodeModalService.renderEmailVerifyCodeModal({
        containerId: OTP_CONTAINER_ID,
        codeLength: otpCodeLength,
        onEmailCodeEntered: (sessionToken: string, code: string) => {
          dispatch({
            type: EmailVerificationActionType.SET_CHALLENGE_COMPLETED,
            onChallengeCompletedData: {
              otpSession: sessionToken,
            },
          });
          eventService.sendChallengeCompletedEvent();
          metricsService.fireChallengeCompletedEvent();
        },
        onModalAbandoned,
        enterEmailTitle: resources.Header.VerifyYourAccount,
        enterEmailDescription: resources.Description.SuspiciousActivityEmailVerification,
        enterCodeTitle: resources.Header.EnterCode,
        enterCodeDescription: resources.Description.EnterCode,
        origin: Otp.Origin.Challenge,
        translate,
        renderInWebview: renderInline,
      });
    }
  };

  useEffect(() => {
    if (isModalVisible) {
      // eslint-disable-next-line no-void
      void loadChallenge();
    }
  }, [isModalVisible]);

  /*
   * Rendering helper
   */
  const getPageContent = () => (
    <InlineChallengeBody>
      <div id={OTP_CONTAINER_ID} />
    </InlineChallengeBody>
  );

  const renderContent = () => {
    if (isConfirmationModalVisible) {
      return (
        <QuitVerificationConfirmation
          renderInline={renderInline}
          confirmAbandonLabel={resources.Label.ConfirmAbandon}
          rejectAbandonLabel={resources.Label.RejectAbandon}
          abandonConfirmationTitle={resources.Header.ConfirmAbandon}
          abandonConfirmationDescription={resources.Description.ConfirmAbandon}
          isConfirmationModalVisible={isConfirmationModalVisible}
          handleContinue={handleRejectAbandon}
          handleConfirmAbandon={handleConfirmAbandon}
        />
      );
    }

    if (renderInline) {
      return <InlineChallenge titleText="">{getPageContent()}</InlineChallenge>;
    }

    // The email verify-code modal renders its own modal into this container (see
    // the EmailVerifyCodeModalService.renderEmailVerifyCodeModal call in loadChallenge
    // above). renderEmailVerifyCodeModal looks the container up synchronously by id, so
    // it must be a plain element that is already in the DOM — not wrapped in a Foundation
    // (Radix) Dialog, whose portaled content is not reliably mounted at that moment, which
    // left an empty, undismissable overlay with no form. Wrapping would also stack a modal
    // inside the modal's own modal.
    return <div id={OTP_CONTAINER_ID} data-testid="email-verification-challenge-container" />;
  };

  return <React.Fragment>{renderContent()}</React.Fragment>;
};

export default EmailVerification;
