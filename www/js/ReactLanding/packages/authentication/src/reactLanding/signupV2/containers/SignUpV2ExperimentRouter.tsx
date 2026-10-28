import React from "react";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { localStorageService } from "@rbx/core-scripts/legacy/core-roblox-utilities";
import LandingPageContainer from "../../containers/LandingPageContainer";
import SignUpContainer from "../../revamp/SignUpContainer";
import isAccountExperienceRevampEnabled from "@rbx/authentication-common/utils/accountExperienceUtils";
import { identityVerificationResultTokenName } from "../../constants/signupConstants";
import { getBirthdayToPrefill, isVerifiedParentConsentSignup } from "../../utils/signupUtils";
import {
  getSignUpV2Experiment,
  SignUpV2ExperimentResolution,
} from "../utils/signupV2ExperimentUtils";
import SignUpV2Controller from "./SignUpV2Controller";

const SignUpV2ExperimentRouter = (): JSX.Element => {
  let resolution: SignUpV2ExperimentResolution = { isSignUpV2: false };
  try {
    resolution = getSignUpV2Experiment({
      isVerifiedParentConsentSignup: isVerifiedParentConsentSignup(),
      isAuthenticated: authenticatedUser.isAuthenticated,
      hasIdentityVerificationContinuation: Boolean(
        localStorageService.getLocalStorage(identityVerificationResultTokenName),
      ),
      hasKoreaIdBirthdayPrefill: Boolean(getBirthdayToPrefill()),
    });
  } catch {
    // Fail closed when local eligibility cannot be resolved.
  }

  if (resolution.isSignUpV2) {
    return (
      <LandingPageContainer
        signupV2Treatment={resolution.treatment}
        signupContent={
          <SignUpV2Controller
            treatment={resolution.treatment}
            authUiVariant={resolution.authUiVariant}
          />
        }
      />
    );
  }

  return isAccountExperienceRevampEnabled() ? <SignUpContainer /> : <LandingPageContainer />;
};

export default SignUpV2ExperimentRouter;
