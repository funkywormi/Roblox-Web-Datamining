import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@rbx/core-ui";
import { useTranslation } from "@rbx/core-scripts/react";
import { AccountSwitcherService } from "@rbx/core-scripts/legacy/Roblox";
import dataStores from "@rbx/core-scripts/data-store";
import { getSignupUrl, getIsVNGLandingRedirectEnabled } from "../util/authUtil";
import { isAccountExperienceRevampEnabled } from "../util/accountExperienceUtils";

export default function HeaderSignupLink() {
  const { translate } = useTranslation();

  const [isAccountSwitchingEnabledForBrowser] =
    AccountSwitcherService.useIsAccountSwitcherAvailableForBrowser();

  useEffect(() => {
    try {
      const {
        authIntentDataStore: { saveGameIntentFromCurrentUrl },
      } = dataStores;
      saveGameIntentFromCurrentUrl();
    } catch (e) {
      console.error("Failed to save game intent from current url", e);
    }
  }, []);

  const { data: hideSignupButton = true } = useQuery({
    queryKey: ["getIsVNGLandingRedirectEnabled"],
    queryFn: getIsVNGLandingRedirectEnabled,
  });

  return hideSignupButton ? null : (
    <li className="signup-button-container">
      <Link
        url={getSignupUrl(isAccountSwitchingEnabledForBrowser)}
        id="sign-up-button"
        className="rbx-navbar-signup btn-growth-sm nav-menu-title signup-button"
      >
        {translate(isAccountExperienceRevampEnabled() ? "Label.CreateAccount" : "Label.sSignUp")}
      </Link>
    </li>
  );
}
