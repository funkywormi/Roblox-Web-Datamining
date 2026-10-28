import React, { ReactNode, useState, useEffect } from "react";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { createModal } from "@rbx/core-ui/legacy/react-style-guide";
import { useTranslation, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { dataStores } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import { AppStoreContainer } from "@rbx/app-store-links";
import { landingTranslationConfig } from "../translation.config";
import ActionBar from "../components/ActionBar";
import SignupHeader from "../components/SignupHeader";
import SignupFormContainer from "./SignupFormContainer";
import { CountryRatingLogos } from "@rbx/content-rating-logos";
import { getContentRatingLogoPolicy } from "../services/landingService";
import { sendAppClickEvent } from "../services/eventService";
import { qualifyAffiliateLogin } from "../services/affiliateLinksService";
import { urlConstants, landingPageStrings, experimentLayer } from "../constants/landingConstants";
import { getReturnUrl, isVerifiedParentConsentSignup } from "../utils/signupUtils";
import { navigateToPage } from "@rbx/authentication-common/utils/browserUtils";
import useExperiments from "@rbx/authentication-common/hooks/useExperiments";
import useLandingBackground from "../hooks/useLandingBackground";
import { SignUpV2Treatment } from "../signupV2/utils/signupV2ExperimentUtils";
import SsoCompleteHandler from "../../shared/components/SsoCompleteHandler";
import {
  accountSwitcherConfirmationModalContainer,
  otpModalConstants,
} from "../constants/signupConstants";

type LandingPageContainerProps = {
  signupContent?: ReactNode;
  signupV2Treatment?: SignUpV2Treatment;
};

// An arm belongs to exactly one of these: it either carries its own in-card sign-in action
// or it keeps the shell button.
const treatmentsWithoutShellLogIn: SignUpV2Treatment[] = [
  SignUpV2Treatment.PasswordFirst,
  SignUpV2Treatment.PasskeyFirst,
];

const treatmentsWithFoundationSignIn: SignUpV2Treatment[] = [SignUpV2Treatment.FoundationControl];

/* SSO can sign in to an existing account from this page; new accounts leave through
 * `handlePostSignup` instead. */
const navigateToSignupReturnUrl = (): void => {
  const returnUrl = getReturnUrl();
  qualifyAffiliateLogin(returnUrl);
  navigateToPage(returnUrl);
};

export const LandingPageContainer = ({
  signupContent,
  signupV2Treatment,
}: LandingPageContainerProps): JSX.Element => {
  const { translate } = useTranslation();
  const [shouldDisplayBrazilRatingLogo, setShouldDisplayBrazilRatingLogo] = useState(false);
  const [shouldDisplayItalyRatingLogo, setShouldDisplayItalyRatingLogo] = useState(false);
  const [ContentRatingModal, modalService] = createModal();
  const experiments = useExperiments(experimentLayer);
  const isEligibleForUsernameSuggestionExperiment =
    experiments.IsUsernameSuggestionEnabled as boolean;
  const landingBackgroundClass = useLandingBackground();

  const isVPCSignup = isVerifiedParentConsentSignup();
  const isSignUpV2 = signupV2Treatment !== undefined;
  const hidesShellLogIn =
    signupV2Treatment !== undefined && treatmentsWithoutShellLogIn.includes(signupV2Treatment);
  const usesFoundationSignIn =
    signupV2Treatment !== undefined && treatmentsWithFoundationSignIn.includes(signupV2Treatment);
  const shouldShowActionBar =
    !(isVPCSignup || authenticatedUser.isAuthenticated) && !hidesShellLogIn;
  const signupContainerClassName = isSignUpV2
    ? `signup-v2-chrome${hidesShellLogIn ? " signup-v2-no-shell-log-in" : ""}`
    : undefined;
  const appStoreSpacingClassName = isSignUpV2
    ? "margin-top-large padding-top-xxlarge"
    : "padding-top-xxlarge";

  // Only Italy's mark is clickable (it opens the PEGI guide), and its confirmation is only
  // mounted when that mark is displayed, so this always navigates.
  const handleContentRatingModalAction = (): void => {
    window.open(urlConstants.italyContentRatingGuide, "_blank");
  };

  const handleContentRatingLogoPolicy = async () => {
    const contentRatingLogoPolicy = await getContentRatingLogoPolicy();
    if (contentRatingLogoPolicy) {
      setShouldDisplayBrazilRatingLogo(contentRatingLogoPolicy.displayBrazilRatingLogo);
      setShouldDisplayItalyRatingLogo(contentRatingLogoPolicy.displayItalyRatingLogo);
    }
  };

  useEffect(() => {
    try {
      const {
        authIntentDataStore: { saveGameIntentFromReturnUrl },
      } = dataStores;
      saveGameIntentFromReturnUrl();
    } catch (e) {
      console.error("intent saving error: ", e);
    }
    // eslint-disable-next-line no-void
    void handleContentRatingLogoPolicy();
  }, []);

  return (
    <div id="landing-page-container dark-theme">
      <section
        className={`row full-height-section rollercoaster-background ${
          isEligibleForUsernameSuggestionExperiment ? "fixed-background" : ""
        } ${landingBackgroundClass}`}
        id="RollerContainer"
      >
        <div className="col-md-12 inner-full-height-section" id="InnerRollerContainer">
          {shouldShowActionBar && <ActionBar usesFoundationSignIn={usesFoundationSignIn} />}
          <div
            className={`${
              shouldDisplayBrazilRatingLogo || shouldDisplayItalyRatingLogo
                ? "lower-logo-container-with-content-rating-logo"
                : ""
            } lower-logo-container`}
          >
            <div id="signup-container" className={signupContainerClassName}>
              {/* The wordmark is positioned against this container, so it belongs to the
                  page rather than to whichever signup experience fills the slot. */}
              <SignupHeader />
              {signupContent ?? (
                <SignupFormContainer
                  isEligibleForUsernameSuggestionExperiment={
                    isEligibleForUsernameSuggestionExperiment
                  }
                />
              )}
              <CountryRatingLogos
                shouldDisplayBrazilRatingLogo={shouldDisplayBrazilRatingLogo}
                shouldDisplayItalyRatingLogo={shouldDisplayItalyRatingLogo}
                onItalyContentRatingLogoClick={() => modalService.open()}
              />
              <SsoCompleteHandler
                navigateToDestination={navigateToSignupReturnUrl}
                getSignupReturnUrl={getReturnUrl}
              />
              {shouldDisplayItalyRatingLogo && (
                <ContentRatingModal
                  title={translate(landingPageStrings.leavingRoblox)}
                  body={<p>{translate(landingPageStrings.externalWebsiteRedirect)}</p>}
                  actionButtonShow
                  actionButtonText={translate(landingPageStrings.continue)}
                  neutralButtonText={translate(landingPageStrings.cancel)}
                  onNeutral={() => modalService.close()}
                  onAction={handleContentRatingModalAction}
                  size="sm"
                />
              )}
            </div>
            {!isVPCSignup && (
              <div className={appStoreSpacingClassName}>
                <AppStoreContainer onAppClick={sendAppClickEvent} translate={translate} />
              </div>
            )}
            <div id="otp-container" />
          </div>
        </div>
      </section>
      <div id={otpModalConstants.otpSignupContainer} />
      <div id={accountSwitcherConfirmationModalContainer} />
    </div>
  );
};

export default LandingPageContainer;
