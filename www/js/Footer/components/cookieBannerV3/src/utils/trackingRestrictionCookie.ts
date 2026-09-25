import * as cookie from "@rbx/core-lib/cookie";
import "@rbx/www-common/global";
import environmentUrls from "@rbx/environment-urls";
import { isAuthenticated } from "@rbx/core-scripts/meta/user";

// Logged out means unknown, not unrestricted; writing would clear a child's restriction.
const setTrackingRestriction = (restrictTracking: boolean | undefined): void => {
  if (restrictTracking == null || !isAuthenticated()) {
    return;
  }

  cookie.set("RBXcp", restrictTracking ? "restricted" : "standard", {
    domain: environmentUrls.domain,
    maxAge: 180 * 24 * 60 * 60,
    sameSite: "lax",
  });
};

export default setTrackingRestriction;
