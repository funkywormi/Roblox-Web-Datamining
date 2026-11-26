import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useTranslations } from "@rbx/www-common/i18n";
import { getSignupUrl, getIsVNGLandingRedirectEnabled } from "../util/authLinkUtil";
import { getMobileWebSignupUrl, isMobileWebSignupCandidate } from "../util/mobileWebSignupLink";
import { useNavLocation } from "../util/navLocation";
import { isAccountExperienceRevampEnabled } from "../util/accountExperienceUtils";
import { getNavCapability, useNavCapability } from "../util/navCapabilities";
import Link from "./NavLink";

const useNoAccountSwitcher = (): [boolean, boolean] => [false, false];

export default function HeaderSignupLink() {
  const t = useTranslations("CommonUI.Features");
  const location = useNavLocation();

  const useIsAccountSwitcherAvailableForBrowser =
    useNavCapability("useIsAccountSwitcherAvailableForBrowser") ?? useNoAccountSwitcher;
  const [isAccountSwitchingEnabledForBrowser] = useIsAccountSwitcherAvailableForBrowser();

  useEffect(() => {
    try {
      getNavCapability("saveGameIntentFromCurrentUrl")?.();
    } catch (e) {
      console.error("Failed to save game intent from current url", e);
    }
  }, []);

  // After mount: the device probe's stored answer is in local storage, which Next.js server
  // rendering can't read.
  const [isMobileWebSignup, setIsMobileWebSignup] = useState(false);
  useEffect(() => {
    setIsMobileWebSignup(isMobileWebSignupCandidate(location));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read once per page, like the Play button
  }, [location.href]);

  const { data: hideSignupButton = true } = useQuery({
    queryKey: ["getIsVNGLandingRedirectEnabled"],
    queryFn: getIsVNGLandingRedirectEnabled,
  });

  return hideSignupButton ? null : (
    <li className="signup-button-container">
      <Link
        url={
          isMobileWebSignup
            ? getMobileWebSignupUrl(location)
            : getSignupUrl(isAccountSwitchingEnabledForBrowser, location)
        }
        id="sign-up-button"
        className="rbx-navbar-signup btn-growth-sm nav-menu-title signup-button"
      >
        {t(isAccountExperienceRevampEnabled() ? "Label.CreateAccount" : "Label.sSignUp")}
      </Link>
    </li>
  );
}
