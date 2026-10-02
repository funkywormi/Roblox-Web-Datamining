// TODO(AA-7602): These gate parameters, client-side resolution, and exposure behavior are
// provisional and may change once the experiment approach is finalized.
export const loginExperimentParameters = {
  // TODO(AA-7602): Placeholder; replace with the final IXP parameter name.
  loginRefresh: "IsLoginRefreshEnabled",
  googleSso: "IsGoogleSsoLoginEnabled",
  appleSso: "IsAppleSsoLoginEnabled",
} as const;

export type LoginExperimentResolution = {
  isLoginRefreshEnabled: boolean;
  isGoogleSsoLoginEnabled: boolean;
  isAppleSsoLoginEnabled: boolean;
};

export type LoginExperimentStaticEligibility = {
  isMagicLinkLogin: boolean;
  isAuthenticated: boolean;
  isAccountSwitcherVisible: boolean;
  isAccountLimitReached: boolean;
};

const defaultResolution: LoginExperimentResolution = {
  isLoginRefreshEnabled: false,
  isGoogleSsoLoginEnabled: false,
  isAppleSsoLoginEnabled: false,
};

export const resolveLoginExperiments = (
  values: Record<string, unknown> & { isLoading?: boolean },
  staticEligibility: LoginExperimentStaticEligibility = {
    isMagicLinkLogin: false,
    isAuthenticated: false,
    isAccountSwitcherVisible: false,
    isAccountLimitReached: false,
  },
): LoginExperimentResolution => {
  if (values.isLoading === true) {
    return defaultResolution;
  }

  const isLoginRefreshEligible =
    !staticEligibility.isMagicLinkLogin &&
    !staticEligibility.isAuthenticated &&
    !staticEligibility.isAccountSwitcherVisible &&
    !staticEligibility.isAccountLimitReached;

  return {
    isLoginRefreshEnabled:
      isLoginRefreshEligible && values[loginExperimentParameters.loginRefresh] === true,
    isGoogleSsoLoginEnabled: values[loginExperimentParameters.googleSso] === true,
    isAppleSsoLoginEnabled: values[loginExperimentParameters.appleSso] === true,
  };
};
