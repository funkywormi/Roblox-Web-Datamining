import React, { useCallback, useEffect, useState } from "react";
import type { UpsellService as UpsellServiceType } from "Roblox";
import usePhoneVerificationContext from "../hooks/usePhoneVerificationContext";
import { PhoneVerificationActionType } from "../store/action";
import {
  LOG_PREFIX,
  VERIFICATION_UPSELL_TRASLATION_KEY,
  PHONE_ROOT_ELEMENT_ID,
  UPSELL_ORIGIN,
} from "../app.config";
import { ErrorCode } from "../interface";

import InlineChallenge from "../../../common/inlineChallenge";
import InlineChallengeBody from "../../../common/inlineChallengeBody";
import QuitVerificationConfirmation from "../../../common/quitVerificationConfirmation";

// Provided by a separate .NET-only bundle; absent on Next.js.
const getUpsellService = () =>
  (window.Roblox as { UpsellService?: typeof UpsellServiceType } | undefined)?.UpsellService;

const PhoneVerification: React.FC = () => {
  const {
    state: { renderInline, resources, metricsService, eventService, isModalVisible },
    dispatch,
  } = usePhoneVerificationContext();

  const [isConfirmationModalVisible, setConfirmationModalVisible] = useState(false);

  const onModalAbandoned = useCallback(
    (isPhoneVerified: boolean) => {
      if (isPhoneVerified) {
        dispatch({
          type: PhoneVerificationActionType.SET_CHALLENGE_COMPLETED,
          onChallengeCompletedData: {},
        });
        eventService.sendChallengeCompletedEvent();
        metricsService.fireChallengeCompletedEvent();
        return;
      }

      setConfirmationModalVisible(true);
      dispatch({
        type: PhoneVerificationActionType.HIDE_MODAL_CHALLENGE,
      });
    },
    [dispatch, eventService, metricsService],
  );

  const handleRejectAbandon = useCallback(() => {
    setConfirmationModalVisible(false);
    dispatch({
      type: PhoneVerificationActionType.SHOW_MODAL_CHALLENGE,
    });
  }, [dispatch]);

  const handleConfirmAbandon = useCallback(() => {
    setConfirmationModalVisible(false);
    dispatch({
      type: PhoneVerificationActionType.SET_CHALLENGE_INVALIDATED,
      errorCode: 0,
    });
    eventService.sendChallengeInvalidatedEvent();
    metricsService.fireChallengeInvalidatedEvent();
  }, [dispatch, eventService, metricsService]);

  useEffect(() => {
    if (isModalVisible) {
      const UpsellService = getUpsellService();
      if (!UpsellService) {
        console.error(LOG_PREFIX, "UpsellService is unavailable");
        dispatch({
          type: PhoneVerificationActionType.SET_CHALLENGE_INVALIDATED,
          errorCode: ErrorCode.UNKNOWN,
        });
        return;
      }
      UpsellService.renderPhoneUpsell({
        onClose: onModalAbandoned,
        origin: UPSELL_ORIGIN,
        addPhoneHeadingKey: VERIFICATION_UPSELL_TRASLATION_KEY.Header.VerifyYourAccountHeader,
        addPhoneDescriptionKey:
          VERIFICATION_UPSELL_TRASLATION_KEY.Description.SuspiciousActivityPhoneVerification,
        containerId: PHONE_ROOT_ELEMENT_ID,
        addPhoneLegalTextKey: VERIFICATION_UPSELL_TRASLATION_KEY.Description.LegalText,
        renderInWebview: renderInline,
      });
    }
  }, [onModalAbandoned, isModalVisible, dispatch]);

  /*
   * Rendering helpers
   */
  const getPageContent = () => (
    <InlineChallengeBody>
      <div id={PHONE_ROOT_ELEMENT_ID} />
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

    // The phone upsell renders its own modal into this container (see the
    // UpsellService.renderPhoneUpsell call in the effect above). renderPhoneUpsell
    // looks the container up synchronously by id, so it must be a plain element
    // that is already in the DOM — not wrapped in a Foundation (Radix) Dialog,
    // whose portaled content is not reliably mounted at that moment, which left
    // an empty, undismissable overlay with no form. Wrapping would also stack a
    // modal inside the upsell's own modal.
    return <div id={PHONE_ROOT_ELEMENT_ID} data-testid="phone-verification-challenge-container" />;
  };

  return <React.Fragment>{renderContent()}</React.Fragment>;
};

export default PhoneVerification;
