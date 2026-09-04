export enum SignUpV2Treatment {
  PasswordFirst = 'passwordFirst',
  PasskeyFirst = 'passkeyFirst',
  FoundationControl = 'foundationControl'
}

export type SignUpV2StaticEligibility = {
  isVerifiedParentConsentSignup: boolean;
  isAuthenticated: boolean;
  hasIdentityVerificationContinuation: boolean;
};

export type SignUpV2ExperimentResolution = 'legacy' | SignUpV2Treatment;

const isImmediatelyIneligible = ({
  isVerifiedParentConsentSignup,
  isAuthenticated,
  hasIdentityVerificationContinuation
}: SignUpV2StaticEligibility): boolean =>
  isVerifiedParentConsentSignup || isAuthenticated || hasIdentityVerificationContinuation;

const getResolution = (assignment: string | undefined): SignUpV2ExperimentResolution | null => {
  switch (assignment) {
    case '0':
      return 'legacy';
    case '1':
      return SignUpV2Treatment.PasswordFirst;
    case '2':
      return SignUpV2Treatment.PasskeyFirst;
    case '3':
      return SignUpV2Treatment.FoundationControl;
    default:
      return null;
  }
};

/**
 * Synchronous so the form renders the right arm with no flicker.
 *
 * The client neither names the IXP layer nor logs exposure: the server resolves
 * the assignment and injects it as the `signup-v2-data` meta tag, and enrollment
 * is recorded there. See AA-7370 for the layer and enrollment-point decision.
 */
export const getSignUpV2Experiment = (
  staticEligibility: SignUpV2StaticEligibility
): SignUpV2ExperimentResolution => {
  if (isImmediatelyIneligible(staticEligibility)) {
    return 'legacy';
  }

  try {
    const metaTag = document.querySelector<HTMLElement>('meta[name="signup-v2-data"]');
    return getResolution(metaTag?.dataset.passkeySignupVariant) ?? 'legacy';
  } catch {
    return 'legacy';
  }
};
