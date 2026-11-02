import React, { useState, useEffect } from "react";
import { useTranslation, WithTranslationsProps } from "@rbx/core-scripts/legacy/react-utilities";
import { authenticatedUser } from "@rbx/core-scripts/legacy/header-scripts";
import { AccountSwitcherService, NavigationService } from "Roblox";
import { loginTranslationConfig } from "../translation.config";
import { FeatureLoginPage } from "@rbx/authentication-common/constants/translationConstants";
import { buildSignupRedirUrl } from "@rbx/authentication-common/utils/browserUtils";
import { getAccountSwitchingSignupUrl } from "../utils/loginUtils";
import { loginFormStrings } from "../constants/loginConstants";
import EVENT_CONSTANTS from "@rbx/authentication-common/constants/eventsConstants";
import { sendLoginLinkClickEvent } from "../services/eventService";

export type SignupLinkProps = {
  useCombinedCreateAccountLabel?: boolean;
};

const createAccountLinkStart = "__CREATE_ACCOUNT_LINK_START__";
const createAccountLinkEnd = "__CREATE_ACCOUNT_LINK_END__";

// A translation that drops the link markers still renders as a usable link.
const splitCombinedCreateAccountLabel = (
  label: string,
): { prefix: string; link: string; suffix: string } => {
  const [prefix = "", linkAndSuffix] = label.split(createAccountLinkStart);
  if (linkAndSuffix === undefined) {
    return { prefix: "", link: label, suffix: "" };
  }
  const [link = "", suffix = ""] = linkAndSuffix.split(createAccountLinkEnd);
  return { prefix, link, suffix };
};

export const SignupLink = ({
  useCombinedCreateAccountLabel = false,
}: SignupLinkProps): JSX.Element => {
  const { translate } = useTranslation();
  const [showSignupLink, setShowSignupLink] = useState(false);
  const isAccountSwitching = AccountSwitcherService && authenticatedUser.isAuthenticated;
  const signupRedirUrl = isAccountSwitching
    ? getAccountSwitchingSignupUrl()
    : buildSignupRedirUrl();
  const combinedCreateAccountLabel = useCombinedCreateAccountLabel
    ? splitCombinedCreateAccountLabel(
        translate(loginFormStrings.LabelDontHaveAnAccountCreateOne, {
          startTag: createAccountLinkStart,
          endTag: createAccountLinkEnd,
        }),
      )
    : null;

  const handleSignupLinkClick = (): void => sendLoginLinkClickEvent(EVENT_CONSTANTS.btn.signup);

  // Note that if vng users want to add a new account from logged in state, it is allowed.
  // https://roblox.atlassian.net/browse/WEBCORE-14284
  useEffect(() => {
    const fetchData = async () => {
      try {
        const isVNGComplianceEnabled = await NavigationService?.getIsVNGLandingRedirectEnabled();
        // if VNG landing page redirect is enabled, we don't want to show any signup UI unless the user is switching accounts
        setShowSignupLink(isAccountSwitching || !isVNGComplianceEnabled);
      } catch (error) {
        console.error("Error fetching data:", error);
        setShowSignupLink(true); // fallback to show signup link
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    fetchData();
  }, [isAccountSwitching]); // Include isAccountSwitching in the dependency array if it is used inside fetchData

  return (
    <div className="text-center">
      {showSignupLink && (
        <div className="signup-option">
          {combinedCreateAccountLabel ? (
            <React.Fragment>
              <span className="no-account-text">{combinedCreateAccountLabel.prefix}</span>
              <a
                id="sign-up-link"
                className="text-link signup-link"
                href={signupRedirUrl}
                target="_self"
                onClick={handleSignupLinkClick}
              >
                {combinedCreateAccountLabel.link}
              </a>
              <span className="no-account-text">{combinedCreateAccountLabel.suffix}</span>
            </React.Fragment>
          ) : (
            <React.Fragment>
              {!isAccountSwitching && (
                <span className="no-account-text">
                  {translate(FeatureLoginPage.LabelNoAccount)}
                </span>
              )}
              <a
                id="sign-up-link"
                className="text-link signup-link"
                href={signupRedirUrl}
                target="_self"
                onClick={handleSignupLinkClick}
              >
                {translate(
                  isAccountSwitching
                    ? FeatureLoginPage.ActionCreateANewAccount
                    : FeatureLoginPage.ActionSignUpCapitalized,
                )}
              </a>
            </React.Fragment>
          )}
        </div>
      )}
    </div>
  );
};

export default SignupLink;
