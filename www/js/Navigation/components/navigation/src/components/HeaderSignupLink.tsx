import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTranslations } from "@rbx/www-common/i18n";
import { getSignupUrl, getIsVNGLandingRedirectEnabled } from "../util/authLinkUtil";
import { isAccountExperienceRevampEnabled } from "../util/accountExperienceUtils";
import { getNavCapability } from "../util/navCapabilities";
import Link from "./NavLink";

const useNoAccountSwitcher = (): [boolean, boolean] => [false, false];

export default function HeaderSignupLink() {
  const t = useTranslations("CommonUI.Features");

  const useIsAccountSwitcherAvailableForBrowser =
    getNavCapability("useIsAccountSwitcherAvailableForBrowser") ?? useNoAccountSwitcher;
  const [isAccountSwitchingEnabledForBrowser] = useIsAccountSwitcherAvailableForBrowser();

  useEffect(() => {
    try {
      getNavCapability("saveGameIntentFromCurrentUrl")?.();
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
        {t(isAccountExperienceRevampEnabled() ? "Label.CreateAccount" : "Label.sSignUp")}
      </Link>
    </li>
  );
}
