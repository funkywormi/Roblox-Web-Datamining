import { addExternal, addLegacyExternal, checkExternalExists, externals } from "@rbx/externals";
import presence from "@rbx/presence";
import realTime from "@rbx/core-scripts/realtime";
import { isAuthenticated } from "@rbx/core-scripts/meta/user";
import { PresenceTypes, startPresenceUpdates } from "@rbx/www-common/presence";
import { trackDotnetAppShellCounter } from "@rbx/www-common/observability/app-shell/dotnet";

// TODO: clean this up.  (SACQ-719)
addLegacyExternal(["Roblox", "Presence", "PresenceTypes"], PresenceTypes);

addExternal("RobloxPresence", presence);

if (isAuthenticated()) {
  document.addEventListener("DOMContentLoaded", () => {
    // RealTime only loads on pages with notifications enabled.
    if (checkExternalExists(externals["@rbx/core-scripts/realtime"])) {
      let client: ReturnType<typeof realTime.GetClient>;
      try {
        client = realTime.GetClient();
      } catch (error) {
        trackDotnetAppShellCounter("RealtimeStart", { outcome: "failed" });
        throw error;
      }
      trackDotnetAppShellCounter("RealtimeStart", { outcome: "started" });
      startPresenceUpdates(client);
    }
  });
}
