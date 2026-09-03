import React from "react";
import classNames from "classnames";
import { authenticatedUser } from "header-scripts";
import { AccountIntegrityChallengeService } from "Roblox";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import { MediaType } from "../../challenge/twoStepVerification";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";
import { SecurityLevelMap } from "../constants/types";

const SmsTwoStepVerificationToggle: React.FC = () => {
  const {
    state: {
      eventService,
      requestService,
      resources,
      enabledMediaTypes,
      phoneConfiguration,
      twoStepVerificationMetadata,
    },
    dispatch,
  } = useSecurityTabContext();

  /*
   * Event Handlers
   */

  const isPhoneVerified = () => phoneConfiguration !== null && phoneConfiguration.isVerified;

  const enableSmsTwoStepVerification = async () => {
    const handleEnable = async (closeModal?: () => void) => {
      const enableResult = await requestService.twoStepVerification.enableSmsTwoStepVerification(
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
          mediaType: MediaType.SMS,
        });
      }
      closeModal?.();
    };

    const hasAnyTwoStepMethodEnabled = enabledMediaTypes.length > 0;
    const highestSecurityLevelEnabled = enabledMediaTypes
      .map(mediaType => SecurityLevelMap[mediaType as MediaType])
      .reduce((acc, next) => (acc > next ? acc : next), 0);
    const isEnablingLowerSecurityMethod =
      hasAnyTwoStepMethodEnabled && highestSecurityLevelEnabled > SecurityLevelMap[MediaType.SMS];

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

  const toggleSmsTwoStepVerification = async () => {
    const currentlyEnabled = enabledMediaTypes.includes(MediaType.SMS);
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
          mediaTypeToDisable: MediaType.SMS,
        },
      });
    } else if (isPhoneVerified()) {
      await enableSmsTwoStepVerification();
    } else {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.GENERIC_TEXT_ERROR,
        additionalModalProps: {
          title: resources.Heading.Dialog.VerifiedPhoneRequired,
          body: resources.Description.Dialog.MissingPhoneTwoStepVerification,
          button: resources.Action.Dialog.Success,
        },
      });
    }
  };

  /*
   * Component Markup
   */

  const getPhoneNumber = () => (phoneConfiguration !== null ? phoneConfiguration.phone : "");

  const isSmsEnabled = () => {
    return enabledMediaTypes.includes(MediaType.SMS);
  };

  const toggleClassName = classNames("btn-toggle receiver-destination-type-toggle", {
    on: isSmsEnabled(),
  });

  return (
    <div className="section-content notifications-section">
      <button
        type="button"
        id="2sv-toggle"
        role="switch"
        aria-checked={isSmsEnabled()}
        className={toggleClassName}
        onClick={toggleSmsTwoStepVerification}
      >
        <span className="toggle-flip" />
        <span id="toggle-on" className="toggle-on" />
        <span id="toggle-off" className="toggle-off" />
      </button>
      <div className="security-2svsetting-label btn-toggle-label">
        <label htmlFor="2sv-toggle" className="btn-toggle-label">
          {resources.Label.SmsTwoStepVerificationCodes}
        </label>
        <div className="rbx-divider" />
        <div
          className="text-description"
          style={{
            display: isSmsEnabled() ? "none" : undefined,
          }}
        >
          {resources.Label.SmsTwoStepPrerequisite}
        </div>
        <div
          className="text-description"
          style={{
            display: isSmsEnabled() ? undefined : "none",
          }}
        >
          {resources.Description.SmsTwoStepVerificationSecondaryEnabled(getPhoneNumber())}
        </div>
      </div>
    </div>
  );
};

export default SmsTwoStepVerificationToggle;
