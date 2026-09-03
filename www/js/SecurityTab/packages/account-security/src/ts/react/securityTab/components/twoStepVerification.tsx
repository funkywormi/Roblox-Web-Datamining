import { AccountIntegrityChallengeService } from "Roblox";
import { authenticatedUser } from "header-scripts";
import React, { useEffect, useState } from "react";
import { ProgressCircle } from "@rbx/foundation-ui";
import { TwoStepVerificationError } from "../../../common/request/types/twoStepVerification";
import { EppEnrollmentStatus } from "../../../common/request/types/userSettings";
import { Result } from "../../../common/result";
import { ChallengeType } from "../../challenge/generic";
import { MediaType } from "../../challenge/twoStepVerification";
import { HighlightableElement } from "../../common/HighlightableElement";
import { LOG_PREFIX } from "../app.config";
import useSecurityTabContext from "../hooks/useSecurityTabContext";
import useRedesignFlags from "../hooks/useRedesignFlags";
import { SecurityTabActionType } from "../store/action";
import ModalState from "../store/modalState";
import { isGenericChallengeType, renderGenericSpendFriction } from "../utils/challengeParamData";
import { getFilteredEnabledMediaTypes } from "../utils/helperUtils";
import AuthenticatorToggle from "./authenticatorToggle";
import EmailTwoStepVerificationToggle from "./emailTwoStepVerificationToggle";
import RecoveryCodesSection from "./recoveryCodesSection";
import SecurityKeyToggle from "./securityKeyToggle";
import SmsTwoStepVerificationToggle from "./smsTwoStepVerificationToggle";
import TwoStepVerificationRadioOptions from "./twoStepVerificationRadioOptions";

const TwoStepVerification: React.FC = () => {
  const {
    state: {
      systemFeedbackService,
      eventService,
      requestService,
      resources,
      twoStepVerificationMetadata,
      enabledMediaTypes,
      showRobuxSpendFriction,
      robuxSpendFrictionMessage,
      twoStepVerificationActionType,
      challengeParamData,
      userSettings,
    },
    dispatch,
  } = useSecurityTabContext();

  const { isRedesignEnabled, isSecurityTabRedesignEnabled } = useRedesignFlags();

  const isEppEnrolled = userSettings?.eppEnrollmentStatus === EppEnrollmentStatus.KEY_PLAN_ENROLLED;
  const isEppUIEnabled = twoStepVerificationMetadata?.isEppUIEnabled ?? false;
  const shouldDisableForEpp = isEppUIEnabled && isEppEnrolled;

  /*
   * Component State
   */

  const [requestError, setRequestError] = useState<string | null>(null);
  const [requestInFlight, setRequestInFlight] = useState<boolean>(true);
  const [email2SVHasHighlight, setEmail2SVHasHighlight] = useState<boolean>(false);

  /*
   * Event Handlers
   */

  const { TwoStepVerification: twoStepVerification } = AccountIntegrityChallengeService;

  const showVerifyErrorBanner = () => {
    systemFeedbackService.warning(resources.Response.VerificationError, 100, 6000);
  };

  const onChallengeCompletedForChallengeToken = (challengeToken: string) => {
    return async (tokenData: { verificationToken: string }) => {
      let redeemChallengeResult: Result<boolean, TwoStepVerificationError | null>;
      switch (twoStepVerificationActionType) {
        case twoStepVerification.ActionType.RobuxSpend:
          redeemChallengeResult =
            await requestService.twoStepVerification.redeemSpendFrictionChallenge(
              challengeToken,
              tokenData.verificationToken,
            );
          break;
        case twoStepVerification.ActionType.ItemTrade:
          redeemChallengeResult =
            await requestService.twoStepVerification.redeemTradeFrictionChallenge(
              challengeToken,
              tokenData.verificationToken,
            );
          break;
        case twoStepVerification.ActionType.Resale:
          redeemChallengeResult =
            await requestService.twoStepVerification.redeemResaleFrictionChallenge(
              challengeToken,
              tokenData.verificationToken,
            );
          break;
        default:
          return;
      }
      if (redeemChallengeResult.isError || !redeemChallengeResult.value) {
        showVerifyErrorBanner();
        return;
      }
      systemFeedbackService.success(resources.Response.SuccessfulVerificationV2, 100, 6000);
      dispatch({
        type: SecurityTabActionType.SET_ROBUX_SPEND_FRICTION_STATUS,
        showRobuxSpendFriction: false,
        robuxSpendFrictionMessage: "",
        twoStepVerificationActionType: null,
      });
    };
  };

  let renderTwoStepVerificationChallenge: (
    numFailedTwoStepChallengeAttempts: number,
  ) => Promise<void>;
  const handleInvalidatedTwoStepVerificationChallenge = async (
    numFailedTwoStepChallengeAttempts: number,
  ) => {
    const MAX_RETRY_ATTEMPTS = 3;
    // Allow the user to try again three times if the session is invalidated. If this doesn't work don't show again.
    if (numFailedTwoStepChallengeAttempts < MAX_RETRY_ATTEMPTS) {
      await renderTwoStepVerificationChallenge(numFailedTwoStepChallengeAttempts + 1);
    } else {
      showVerifyErrorBanner();
    }
  };

  renderTwoStepVerificationChallenge = async (numFailedTwoStepChallengeAttempts: number) => {
    let generateChallengeResult: Result<string, TwoStepVerificationError | null>;
    switch (twoStepVerificationActionType) {
      case twoStepVerification.ActionType.RobuxSpend:
        generateChallengeResult =
          await requestService.twoStepVerification.generateSpendFrictionChallenge();
        break;
      case twoStepVerification.ActionType.ItemTrade:
        generateChallengeResult =
          await requestService.twoStepVerification.generateTradeFrictionChallenge();
        break;
      case twoStepVerification.ActionType.Resale:
        generateChallengeResult =
          await requestService.twoStepVerification.generateResaleFrictionChallenge();
        break;
      default:
        return;
    }
    if (generateChallengeResult.isError) {
      showVerifyErrorBanner();
      return;
    }

    const challengeToken = generateChallengeResult.value;
    twoStepVerification.renderChallenge({
      containerId: "2sv-popup-container",
      userId: authenticatedUser.id!.toString(),
      challengeId: challengeToken,
      actionType: twoStepVerificationActionType,
      renderInline: false,
      shouldShowRememberDeviceCheckbox: false,
      onChallengeCompleted: onChallengeCompletedForChallengeToken(challengeToken),
      onChallengeInvalidated: () =>
        handleInvalidatedTwoStepVerificationChallenge(numFailedTwoStepChallengeAttempts),
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onModalChallengeAbandoned: () => {},
    });
  };

  const verifyChallenge = async () => {
    if (twoStepVerificationActionType !== null) {
      eventService.sendCodeInputModalTriggeredEvent(twoStepVerificationActionType);
      eventService.sendVerifySecurityPageEvent(twoStepVerificationActionType);
      await renderTwoStepVerificationChallenge(0);
    }
  };

  const toggleAuthenticator = (emailVerified: boolean) => {
    const currentlyEnabled = enabledMediaTypes.includes(MediaType.Authenticator);
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
          mediaTypeToDisable: MediaType.Authenticator,
        },
      });
      return;
    }
    if (emailVerified) {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.AUTHENTICATOR_ENABLE,
        additionalModalProps: {},
      });
    } else {
      dispatch({
        type: SecurityTabActionType.SET_MODAL_STATE,
        modalState: ModalState.GENERIC_TEXT_ERROR,
        additionalModalProps: {
          title: twoStepVerificationMetadata.isAuthenticatorWithVerifiedPhoneEnabled
            ? resources.Heading.Dialog.VerifiedEmailOrPhoneRequired
            : resources.Label.Dialog.EmailRequired,
          body: twoStepVerificationMetadata.isAuthenticatorWithVerifiedPhoneEnabled
            ? resources.Description.Dialog.UnverifiedEmailOrPhoneTwoStepVerification
            : resources.Description.Dialog.MissingEmailTwoStepVerification,
          button: resources.Action.Dialog.Success,
        },
      });
    }
  };

  /*
   * Effects
   */

  const initializeTwoStepVerification = async () => {
    setRequestInFlight(true);

    const getMetadataResult = await requestService.twoStepVerification.getMetadata();
    if (getMetadataResult.isError) {
      setRequestInFlight(false);
      setRequestError(resources.Response.GeneralError);
      return;
    }

    const metadata = getMetadataResult.value;

    if (metadata.twoStepVerificationEnabled) {
      const getUserConfigurationResult =
        await requestService.twoStepVerification.getUserConfiguration(
          authenticatedUser.id!.toString(),
        );
      if (getUserConfigurationResult.isError) {
        setRequestInFlight(false);
        setRequestError(resources.Response.GeneralError);
        return;
      }

      const configuration = getUserConfigurationResult.value;
      const mediaTypes = getFilteredEnabledMediaTypes(
        configuration,
        metadata.isSingleMethodEnforcementEnabled,
      );

      dispatch({
        type: SecurityTabActionType.INITIALIZE_TWO_STEP_VERIFICATION,
        metadata,
        enabledMediaTypes: mediaTypes,
      });

      setRequestInFlight(false);

      // If we're coming to this screen from the authenticator upsell modal then we want to toggle
      // enable authenticator when the page loads.
      const authenticatorUpsellRedirectUrlSignifier = "authpopup";
      if (
        window.location.href.includes(authenticatorUpsellRedirectUrlSignifier) &&
        !enabledMediaTypes.includes(MediaType.Authenticator)
      ) {
        const getEmailConfigurationResult = await requestService.email.getEmailConfiguration();
        if (getEmailConfigurationResult.isError) {
          // eslint-disable-next-line no-console
          console.error(LOG_PREFIX, "Error getting email.");
        } else {
          const emailVerified = getEmailConfigurationResult.value.verified;
          toggleAuthenticator(emailVerified);
        }
      }

      // If a forcetwostepverification challenge is passed as a query param to the page
      // the email 2SV toggle button is highlighted.
      if (
        !mediaTypes.includes(MediaType.Email) &&
        isGenericChallengeType(challengeParamData, ChallengeType.FORCE_TWO_STEP_VERIFICATION)
      ) {
        setEmail2SVHasHighlight(true);
      }

      // If a twostepverification challenge is passed as a query param to the page.
      // attempt to render it using the interceptChallenge method.
      if (
        challengeParamData &&
        isGenericChallengeType(challengeParamData, ChallengeType.TWO_STEP_VERIFICATION)
      ) {
        await renderGenericSpendFriction(
          challengeParamData.challengeID,
          challengeParamData.challengeMetadata,
          challengeParamData.challengeType,
        );
      }

      const email2SVUpsellRedirectUrlSignifier = "emailhighlight";
      if (window.location.href.includes(email2SVUpsellRedirectUrlSignifier)) {
        setEmail2SVHasHighlight(!mediaTypes.includes(MediaType.Email));
      }

      const getRecoveryCodesStatusResult =
        await requestService.twoStepVerification.getRecoveryCodesStatus(
          authenticatedUser.id!.toString(),
        );
      if (getRecoveryCodesStatusResult.isError) {
        dispatch({
          type: SecurityTabActionType.SET_RECOVERY_CODE_STATUS,
          recoveryCodeStatus: {
            activeCount: 0,
            created: null,
          },
        });
        return;
      }
      dispatch({
        type: SecurityTabActionType.SET_RECOVERY_CODE_STATUS,
        recoveryCodeStatus: getRecoveryCodesStatusResult.value,
      });
    } else {
      setRequestInFlight(false);
      setRequestError(resources.Response.FeatureDisabled);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line no-void
    void initializeTwoStepVerification();
  }, []);

  /*
   * Component Markup
   */

  const isSmsTwoStepVerificationAvailable = () => {
    return twoStepVerificationMetadata.isSmsTwoStepVerificationAvailable;
  };

  const isSecurityKeyTwoStepVerificationAvailable = () => {
    return twoStepVerificationMetadata.isSecurityKeyTwoStepVerificationAvailable;
  };

  const shouldShowRecoveryCodesSection = () => {
    // Recovery codes should be available when any enableable 2SV method is enabled
    if (!twoStepVerificationMetadata.twoStepVerificationEnabled) {
      return false;
    }

    // 2SV methods that users can enable
    const enableableMediaTypes = [
      MediaType.Email,
      MediaType.Authenticator,
      MediaType.Passkey,
      MediaType.SecurityKey,
    ];
    return enableableMediaTypes.some(mediaType => enabledMediaTypes.includes(mediaType));
  };

  const securityPageDescription = () => {
    const descriptionResource = twoStepVerificationMetadata.isSingleMethodEnforcementEnabled
      ? resources.Label.TwoStepVerificationSingleMethodDescription
      : resources.Label.TwoStepVerificationDescription;

    if (isRedesignEnabled) {
      return (
        <div className="description-wrapper">
          <div id="security-page-description" className="section-content">
            <div className="text-body-large text-new-line">{descriptionResource}</div>
          </div>
        </div>
      );
    }

    return (
      <div id="security-page-description" className="section-content">
        <div className="text-description text-new-line">{descriptionResource}</div>
        <div className="text-description">{resources.Description.SecurityWarning("", "")}</div>
      </div>
    );
  };

  // Don't render anything until experiment flag is resolved to avoid flicker
  if (isSecurityTabRedesignEnabled === null) {
    return null;
  }

  return (
    <React.Fragment>
      <div
        className={`section ${isRedesignEnabled ? "settings-redesign-enabled" : ""}`}
        data-testid="two-step-verification-section"
      >
        <div className="container-header margin-bottom-small">
          <h3 className="text-heading-small font-header-2">
            {resources.Heading.TwoStepVerification}
          </h3>
        </div>
        {requestInFlight ? (
          // Page still loading:
          <div className="container-header">
            <ProgressCircle ariaLabel="Loading" size="Medium" variant="Indeterminate" />
          </div>
        ) : (
          <React.Fragment>
            {requestError === null && (
              <React.Fragment>
                {securityPageDescription()}
                {enabledMediaTypes.includes(MediaType.Email) &&
                  enabledMediaTypes.includes(MediaType.Authenticator) && (
                    <div className="container-header wrapper">
                      <div className="lowerkey-grayscale-warning">
                        <div className="icon-warning icon-location" />
                        <div>{resources.Label.TwoStepVerificationEmailWarningNew}</div>
                      </div>
                    </div>
                  )}
                {showRobuxSpendFriction && (
                  <div className="container-header robux-spend-verification">
                    <span className="icon-warning" />
                    <span className="text-description">{robuxSpendFrictionMessage}</span>
                    <button
                      id="robux-spend-verify"
                      type="button"
                      className="btn-control-sm acct-settings-btn"
                      onClick={verifyChallenge}
                    >
                      {resources.Action.Dialog.Verify}
                    </button>
                    <span id="2sv-popup-container" />
                  </div>
                )}
                {isRedesignEnabled ? (
                  <TwoStepVerificationRadioOptions isDisabled={shouldDisableForEpp} />
                ) : (
                  <div
                    className="two-step-toggle-interface"
                    data-testid="two-step-toggle-interface"
                  >
                    <AuthenticatorToggle unlockPinAndToggleAuthenticator={toggleAuthenticator} />
                    <HighlightableElement
                      isHighlighted={email2SVHasHighlight}
                      setIsHighlighted={setEmail2SVHasHighlight}
                    >
                      <EmailTwoStepVerificationToggle />
                    </HighlightableElement>
                    {isSmsTwoStepVerificationAvailable() && <SmsTwoStepVerificationToggle />}
                    {isSecurityKeyTwoStepVerificationAvailable() && (
                      <SecurityKeyToggle unlockPinAndToggleAuthenticator={toggleAuthenticator} />
                    )}
                  </div>
                )}
                {shouldShowRecoveryCodesSection() && <RecoveryCodesSection />}
              </React.Fragment>
            )}
            {requestError !== null && <div className="section-content-off">{requestError}</div>}
          </React.Fragment>
        )}
      </div>
    </React.Fragment>
  );
};

export default TwoStepVerification;
