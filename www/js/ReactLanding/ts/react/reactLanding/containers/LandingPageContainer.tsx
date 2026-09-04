import React, { ReactNode, useState, useEffect } from 'react';
import { authenticatedUser } from 'header-scripts';
import { createModal } from 'react-style-guide';
import { withTranslations, WithTranslationsProps } from 'react-utilities';
import { dataStores } from 'core-roblox-utilities';
import { AppStoreContainer } from '@rbx/app-store-links';
import { landingTranslationConfig } from '../translation.config';
import ActionBar from '../components/ActionBar';
import SignupHeader from '../components/SignupHeader';
import SignupFormContainer from './SignupFormContainer';
import CountryRatingLogos from '../components/CountryRatingLogos';
import { getContentRatingLogoPolicy } from '../services/landingService';
import { sendAppClickEvent } from '../services/eventService';
import { urlConstants, landingPageStrings, experimentLayer } from '../constants/landingConstants';
import { isVerifiedParentConsentSignup } from '../utils/signupUtils';
import useExperiments from '../../common/hooks/useExperiments';
import useLandingBackground from '../../common/hooks/useLandingBackground';
import { SignUpV2Treatment } from '../signupV2/utils/signupV2ExperimentUtils';
import {
  accountSwitcherConfirmationModalContainer,
  otpModalConstants
} from '../constants/signupConstants';

type LandingPageContainerProps = WithTranslationsProps & {
  signupContent?: ReactNode;
  signupV2Treatment?: SignUpV2Treatment;
};

// An arm belongs to exactly one of these: it either carries its own in-card sign-in action
// or it keeps the shell button.
const treatmentsWithoutShellLogIn: SignUpV2Treatment[] = [
  SignUpV2Treatment.PasswordFirst,
  SignUpV2Treatment.PasskeyFirst
];

const treatmentsWithFoundationSignIn: SignUpV2Treatment[] = [SignUpV2Treatment.FoundationControl];

export const LandingPageContainer = ({
  translate,
  signupContent,
  signupV2Treatment
}: LandingPageContainerProps): JSX.Element => {
  const [shouldDisplayBrazilRatingLogo, setShouldDisplayBrazilRatingLogo] = useState(false);
  const [shouldDisplayItalyRatingLogo, setShouldDisplayItalyRatingLogo] = useState(false);
  const [ContentRatingModal, modalService] = createModal();
  const experiments = useExperiments(experimentLayer);
  const isEligibleForUsernameSuggestionExperiment = experiments.IsUsernameSuggestionEnabled as boolean;
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
    ? `signup-v2-chrome${hidesShellLogIn ? ' signup-v2-no-shell-log-in' : ''}`
    : undefined;
  const appStoreSpacingClassName = isSignUpV2
    ? 'margin-top-large padding-top-xxlarge'
    : 'padding-top-xxlarge';

  const handleContentRatingModalAction = (): void => {
    let ratingGuideUrl = '';
    if (shouldDisplayItalyRatingLogo) {
      ratingGuideUrl = urlConstants.italyContentRatingGuide;
    }
    window.open(ratingGuideUrl, '_blank');
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
        authIntentDataStore: { saveGameIntentFromReturnUrl }
      } = dataStores;
      saveGameIntentFromReturnUrl();
    } catch (e) {
      console.error('intent saving error: ', e);
    }
    // eslint-disable-next-line no-void
    void handleContentRatingLogoPolicy();
  }, []);

  return (
    <div id='landing-page-container dark-theme'>
      <section
        className={`row full-height-section rollercoaster-background ${
          isEligibleForUsernameSuggestionExperiment ? 'fixed-background' : ''
        } ${landingBackgroundClass}`}
        id='RollerContainer'>
        <div className='col-md-12 inner-full-height-section' id='InnerRollerContainer'>
          {shouldShowActionBar && <ActionBar usesFoundationSignIn={usesFoundationSignIn} />}
          <div
            className={`${
              shouldDisplayBrazilRatingLogo || shouldDisplayItalyRatingLogo
                ? 'lower-logo-container-with-content-rating-logo'
                : ''
            } lower-logo-container`}>
            <div id='signup-container' className={signupContainerClassName}>
              {/* The wordmark is positioned against this container, so it belongs to the
                  page rather than to whichever signup experience fills the slot. */}
              <SignupHeader />
              {signupContent ?? (
                <SignupFormContainer
                  isEligibleForUsernameSuggestionExperiment={
                    isEligibleForUsernameSuggestionExperiment
                  }
                  translate={translate}
                />
              )}
              <CountryRatingLogos
                shouldDisplayBrazilRatingLogo={shouldDisplayBrazilRatingLogo}
                shouldDisplayItalyRatingLogo={shouldDisplayItalyRatingLogo}
                onContentRatingLogoClick={() => modalService.open()}
                translate={translate}
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
                />
              )}
            </div>
            {!isVPCSignup && (
              <div className={appStoreSpacingClassName}>
                <AppStoreContainer onAppClick={sendAppClickEvent} translate={translate} />
              </div>
            )}
            <div id='otp-container' />
          </div>
        </div>
      </section>
      <div id={otpModalConstants.otpSignupContainer} />
      <div id={accountSwitcherConfirmationModalContainer} />
    </div>
  );
};

export default withTranslations(LandingPageContainer, landingTranslationConfig);
