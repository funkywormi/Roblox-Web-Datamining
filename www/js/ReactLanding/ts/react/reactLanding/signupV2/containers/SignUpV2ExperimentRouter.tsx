import React from 'react';
import { authenticatedUser } from 'header-scripts';
import { localStorageService } from 'core-roblox-utilities';
import LandingPageContainer from '../../containers/LandingPageContainer';
import SignUpContainer from '../../revamp/SignUpContainer';
import isAccountExperienceRevampEnabled from '../../../common/utils/accountExperienceUtils';
import { identityVerificationResultTokenName } from '../../constants/signupConstants';
import { isVerifiedParentConsentSignup } from '../../utils/signupUtils';
import {
  getSignUpV2Experiment,
  SignUpV2ExperimentResolution
} from '../utils/signupV2ExperimentUtils';
import SignUpV2Controller from './SignUpV2Controller';

const SignUpV2ExperimentRouter = (): JSX.Element => {
  let resolution: SignUpV2ExperimentResolution = 'legacy';
  try {
    resolution = getSignUpV2Experiment({
      isVerifiedParentConsentSignup: isVerifiedParentConsentSignup(),
      isAuthenticated: authenticatedUser.isAuthenticated,
      hasIdentityVerificationContinuation: Boolean(
        localStorageService.getLocalStorage(identityVerificationResultTokenName)
      )
    });
  } catch {
    // Fail closed when local eligibility cannot be resolved.
  }

  if (resolution !== 'legacy') {
    return (
      <LandingPageContainer
        signupV2Treatment={resolution}
        signupContent={<SignUpV2Controller treatment={resolution} />}
      />
    );
  }

  return isAccountExperienceRevampEnabled() ? <SignUpContainer /> : <LandingPageContainer />;
};

export default SignUpV2ExperimentRouter;
