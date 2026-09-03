import { addExternal, addLegacyExternal } from "@rbx/externals";
import presence from "@rbx/presence";
import { PresenceTypes } from "./src/constants/presenceStatusConstants";
import "./src/services/presenceStatusUpdateService";

// TODO: clean this up.  (SACQ-719)
addLegacyExternal(["Roblox", "Presence", "PresenceTypes"], PresenceTypes);

addExternal("RobloxPresence", presence);
