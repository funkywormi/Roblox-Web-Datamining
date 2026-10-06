import { getAbsoluteUrl } from "@rbx/core-scripts/endpoints";
import { authenticatedUser } from "@rbx/core-scripts/meta/user";

const navLogoLinkId = "nav-logo-link";

export const initializeLogoLink = () => {
  const logoLink = document.getElementById(navLogoLinkId);
  if (!(logoLink instanceof HTMLAnchorElement)) {
    return;
  }

  if (authenticatedUser() == null) {
    logoLink.href = getAbsoluteUrl("/");
  }
};
