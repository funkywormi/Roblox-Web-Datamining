import { addExternal, addLegacyExternal, checkExternalExists, externals } from "@rbx/externals";
import presence from "@rbx/presence";
import realTime from "@rbx/core-scripts/realtime";
import { isAuthenticated } from "@rbx/core-scripts/meta/user";
import { PresenceTypes, startPresenceUpdates } from "@rbx/www-common/presence";

// TODO: clean this up.  (SACQ-719)
addLegacyExternal(["Roblox", "Presence", "PresenceTypes"], PresenceTypes);

addExternal("RobloxPresence", presence);

if (isAuthenticated()) {
  document.addEventListener("DOMContentLoaded", () => {
    // RealTime only loads on pages with notifications enabled.
    if (checkExternalExists(externals["@rbx/core-scripts/realtime"])) {
      startPresenceUpdates(realTime.GetClient());
    }
  });
}
