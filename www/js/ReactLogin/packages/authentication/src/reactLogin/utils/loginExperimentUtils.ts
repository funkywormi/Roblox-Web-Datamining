import {
  type AuthUiVariant,
  authUiVariants,
} from "@rbx/authentication-common/utils/authUiVariantUtils";
import type { AuthUiPolicy } from "../../shared/hooks/useAuthUiPolicy";
import { isSsoEligible, type SsoEligibility } from "../../shared/utils/ssoEligibilityUtils";

export type LoginSsoPlacement = "hidden" | "otherSignInOptions" | "underDivider";

export type LoginExperimentResolution = {
  authUiVariant: AuthUiVariant;
  isLoginRefreshEnabled: boolean;
  ssoPlacement: LoginSsoPlacement;
};

const getSsoPlacement = (
  authUiVariant: AuthUiVariant,
  loginUiPolicy: AuthUiPolicy,
): LoginSsoPlacement => {
  if (loginUiPolicy.isLoading) {
    return "hidden";
  }
  switch (authUiVariant) {
    case authUiVariants.refreshSsoInline:
      return loginUiPolicy.isExternalIdentityLoginExcluded ? "hidden" : "underDivider";
    case authUiVariants.refreshSsoDialog:
      return loginUiPolicy.isExternalIdentityOtherSignInOptionsExcluded
        ? "hidden"
        : "otherSignInOptions";
    case authUiVariants.control:
    default:
      return loginUiPolicy.isExternalIdentityOtherSignInOptionsExcluded
        ? "hidden"
        : "otherSignInOptions";
  }
};

export const resolveLoginExperiments = (
  loginUiPolicy: AuthUiPolicy,
  authUiVariant: AuthUiVariant,
  ssoEligibility: SsoEligibility,
): LoginExperimentResolution => ({
  authUiVariant,
  isLoginRefreshEnabled: authUiVariant !== authUiVariants.control,
  ssoPlacement: isSsoEligible(ssoEligibility)
    ? getSsoPlacement(authUiVariant, loginUiPolicy)
    : "hidden",
});
