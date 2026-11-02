import { navigateToPage } from "@rbx/authentication-common/utils/browserUtils";
import { qualifyAffiliateLogin } from "../../reactLanding/services/affiliateLinksService";
import { getRedirectUrl } from "./loginUtils";

/**
 * Leaves the login page for its validated `returnUrl` after any sign-in method, qualifying an
 * experience affiliate link on the way out.
 */
export const navigateToLoginReturnUrl = (): void => {
  const returnUrl = getRedirectUrl();
  qualifyAffiliateLogin(returnUrl);
  navigateToPage(returnUrl);
};
