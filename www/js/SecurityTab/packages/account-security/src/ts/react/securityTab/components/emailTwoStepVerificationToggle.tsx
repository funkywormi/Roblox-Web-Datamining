import { AccountIntegrityChallengeService } from "Roblox";
import classNames from "classnames";
import { authenticatedUser } from "header-scripts";
import React from "react";
import { MetricsServiceDefault } from "../../challenge/generic/services/metricsService";
import { MediaType } from "../../challenge/twoStepVerification";
import { SecurityLevelMap } from "../constants/types";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";
import { continueChallengeRenderGenericSpendFriction } from "../utils/challengeParamData";

const metricsService = new MetricsServiceDefault();

const EmailTwoStepVerificationToggle: React.FC = () => {
  const {
    state: {
      eventService,
      requestService,
      resources,
      enabledMediaTypes,
      mySettingsInfo,
      twoStepVerificationMetadata,
      challengeParamData,
    },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Event Handlers
   */

  const isEmailVerified = () =>
    mySettingsInfo !== null && mySettingsInfo.IsEmailOnFile && mySettingsInfo.IsEmailVerified;

  const enableEmailTwoStepVerification = async () => {
    const handleEnable = async (closeModal?: () => void) => {
      const enableResult = await requestService.twoStepVerification.enableEmailTwoStepVerification(
        authenticatedUser.id!.toString(),
      );

      if (enableResult.isError) {
        const { Generic } = AccountIntegrityChallengeService;
        // Ignore challenge abandons for errors.
        if (Generic.ChallengeError.matchAbandoned(enableResult.errorRaw)) {
          closeModal?.();
          return;
        }
        dispatch({
          type: SecurityTabActionType.SET_MODAL_STATE,
          modalState: ModalState.GENERIC_TEXT_ERROR,
          additionalModalProps: {
            title: resources.Heading.Dialog.DefaultError,
            body: resources.Response.Dialog.DefaultErrorMessage,
            button: resources.Action.Dialog.Success,
          },
        });
      } else {
        dispatch({
          type: SecurityTabActionType.ENABLE_MEDIA_TYPE,
          mediaType: MediaType.Email,
        });
        if (challengeParamData) {
          // Attempt to continue forcetwostepverification and render a 2SV spend friction challenge.
          await continueChallengeRenderGenericSpendFriction(challengeParamData, metricsService);
        }
      }
      closeModal?.();
    };

    const hasAnyTwoStepMethodEnabled = enabledMediaTypes.length > 0;
    const highestSecurityLevelEnabled = enabledMediaTypes
      .map(mediaType => SecurityLevelMap[mediaType as MediaType])
      .reduce((acc, next) => (acc > next ? acc : next), 0);
    const isEnablingLowerSecurityMethod =
      hasAnyTwoStepMethodEnabled && highestSecurityLevelEnabled > SecurityLevelMap[MediaType.Email];

    if (
      twoStepVerificationMetadata.isSingleMethodEnforcementEnabled &&
      isEnablingLowerSecurityMethod
    ) {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.TWO_STEP_ENABLE_WARNING,
        additionalModalProps: {
          enableFunction: handleEnable,
        },
      });
    } else {
      await handleEnable();
    }
  };

  const toggleEmailTwoStepVerification = async () => {
    const currentlyEnabled = enabledMediaTypes.includes(MediaType.Email);
    if (currentlyEnabled) {
      eventService.sendTwoStepVerificationDisabledEvent();
    } else {
      eventService.sendTwoStepVerificationEnabledEvent();
    }

    if (currentlyEnabled) {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.TWO_STEP_DISABLE,
        additionalModalProps: {
          mediaTypeToDisable: MediaType.Email,
        },
      });
    } else if (isEmailVerified()) {
      await enableEmailTwoStepVerification();
    } else {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.GENERIC_TEXT_ERROR,
        additionalModalProps: {
          title: resources.Label.Dialog.EmailRequired,
          body: resources.Description.Dialog.MissingEmailTwoStepVerification,
          button: resources.Action.Dialog.Success,
        },
      });
    }
  };

  /*
   * Component Markup
   */

  const getUserEmail = () => (mySettingsInfo !== null ? mySettingsInfo.UserEmail : "");

  const isEmailEnabled = () => {
    return enabledMediaTypes.includes(MediaType.Email);
  };

  const toggleClassName = classNames("btn-toggle receiver-destination-type-toggle", {
    on: isEmailEnabled(),
  });

  return (
    <div className="section-content notifications-section">
      <button
        type="button"
        id="2sv-toggle"
        role="switch"
        aria-checked={isEmailEnabled()}
        className={toggleClassName}
        aria-describedby="2sv-email-disabled-description 2sv-email-enabled-description"
        onClick={toggleEmailTwoStepVerification}
      >
        <span className="toggle-flip" />
        <span id="toggle-on" className="toggle-on" />
        <span id="toggle-off" className="toggle-off" />
      </button>
      <div className="security-2svsetting-label btn-toggle-label">
        <label htmlFor="2sv-toggle" className="btn-toggle-label">
          {resources.Label.EmailTwoStepVerificationCodes}
        </label>
        <div className="rbx-divider" />
        <div
          className="text-description"
          id="2sv-email-disabled-description"
          style={{
            display: isEmailEnabled() ? "none" : undefined,
          }}
        >
          {resources.Label.TwoStepPrerequisite}
        </div>
        <div
          className="text-description"
          id="2sv-email-enabled-description"
          style={{
            display: isEmailEnabled() ? undefined : "none",
          }}
        >
          {resources.Description.TwoStepVerificationSecondaryEnabled(getUserEmail())}
        </div>
      </div>
    </div>
  );
};

export default EmailTwoStepVerificationToggle;
