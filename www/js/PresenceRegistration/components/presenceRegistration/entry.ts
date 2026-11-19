import { parseInt } from "@rbx/core-lib/number";
import { startPresenceHeartbeat } from "@rbx/www-common/presence/heartbeat";
import { getCurrentUser } from "@rbx/www-common/user";
import { trackDotnetAppShellCounter } from "@rbx/www-common/observability/app-shell/dotnet";

const id = getCurrentUser()?.id;
const userId = id == null ? null : parseInt(id);
if (userId != null) {
  startPresenceHeartbeat(userId, outcome => {
    trackDotnetAppShellCounter("PresenceHeartbeat", { outcome });
  });
}
