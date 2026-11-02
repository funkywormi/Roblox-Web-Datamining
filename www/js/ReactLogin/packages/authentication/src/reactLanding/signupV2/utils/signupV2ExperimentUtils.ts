import {
  type AuthUiVariant,
  authUiVariants,
  getAssignedAuthUiVariant,
} from "@rbx/authentication-common/utils/authUiVariantUtils";

export enum SignUpV2Treatment {
  PasswordFirst = "passwordFirst",
  PasskeyFirst = "passkeyFirst",
  FoundationControl = "foundationControl",
}

export type SignUpV2StaticEligibility = {
  isVerifiedParentConsentSignup: boolean;
  isAuthenticated: boolean;
  hasIdentityVerificationContinuation: boolean;
  // The deprecated Korea ID flow prefills and locks the birthday, which only the control form does.
  hasKoreaIdBirthdayPrefill: boolean;
};

export type SignUpV2RefreshVariant = Exclude<AuthUiVariant, typeof authUiVariants.control>;

export type SignUpV2ExperimentResolution =
  | { isSignUpV2: false }
  | { isSignUpV2: true; treatment: SignUpV2Treatment; authUiVariant?: SignUpV2RefreshVariant };

const controlResolution: SignUpV2ExperimentResolution = { isSignUpV2: false };

const isImmediatelyIneligible = ({
  isVerifiedParentConsentSignup,
  isAuthenticated,
  hasIdentityVerificationContinuation,
  hasKoreaIdBirthdayPrefill,
}: SignUpV2StaticEligibility): boolean =>
  isVerifiedParentConsentSignup ||
  isAuthenticated ||
  hasIdentityVerificationContinuation ||
  hasKoreaIdBirthdayPrefill;

const getSignUpV2DataResolution = (): SignUpV2ExperimentResolution => {
  const metaTag = document.querySelector<HTMLElement>('meta[name="signup-v2-data"]');
  switch (metaTag?.dataset.passkeySignupVariant) {
    case "1":
      return { isSignUpV2: true, treatment: SignUpV2Treatment.PasswordFirst };
    case "2":
      return { isSignUpV2: true, treatment: SignUpV2Treatment.PasskeyFirst };
    case "3":
      return { isSignUpV2: true, treatment: SignUpV2Treatment.FoundationControl };
    default:
      return controlResolution;
  }
};

/**
 * Signup shares login's `auth-ui-data` arm when the server assigns one: control keeps the
 * production signup, and both refresh arms render the password-first V2 flow (only the inline arm
 * adds SSO providers). Visitors without an `auth-ui-data` arm fall back to the standalone
 * `signup-v2-data` experiment, so its arms never reach the shared experiment's control.
 *
 * The client neither names the IXP layers nor logs exposure: the server resolves both assignments
 * and records enrollment. Synchronous so the form renders the right arm with no flicker.
 */
export const getSignUpV2Experiment = (
  staticEligibility: SignUpV2StaticEligibility,
): SignUpV2ExperimentResolution => {
  if (isImmediatelyIneligible(staticEligibility)) {
    return controlResolution;
  }

  try {
    const authUiVariant = getAssignedAuthUiVariant();
    if (authUiVariant === undefined) {
      return getSignUpV2DataResolution();
    }
    if (authUiVariant === authUiVariants.control) {
      return controlResolution;
    }
    return { isSignUpV2: true, treatment: SignUpV2Treatment.PasswordFirst, authUiVariant };
  } catch {
    return controlResolution;
  }
};
